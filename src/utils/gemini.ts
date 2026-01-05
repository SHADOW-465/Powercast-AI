import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ForecastResult {
  forecast: { timestamp: string; load: number }[];
  analysis: string;
  recommendations: string;
  expansion: {
    timeframe: string;
    capacityNeededMW: number;
    reasoning: string;
  };
}

export async function generateForecast(
  apiKey: string,
  historicalData: { timestamp: string; load: number }[],
  horizon: number, // Number of future steps
  horizonUnit: 'hours' | 'days' = 'hours'
): Promise<ForecastResult> {

  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Prepare prompt
  const lookback = historicalData.slice(-48); // Use last 48 points for context (e.g. 2 days if hourly)

  const dataStr = lookback.map(d => `${d.timestamp}: ${d.load.toFixed(1)}`).join('\n');
  const lastTimestamp = new Date(lookback[lookback.length - 1].timestamp);

  // Construct prompt
  const prompt = `
    You are an expert electrical load forecasting system.
    Task:
    1. Forecast the electrical load for the next ${horizon} ${horizonUnit}.
    2. Provide expert analysis and operational recommendations.
    3. Analyze long-term trends to predict Future Expansion needs (when new generation capacity will be required).

    Historical Load Data (Chronological):
    ${dataStr}

    Instructions:
    1. Analyze the trend and seasonality in the provided data.
    2. Predict the load values for the next ${horizon} ${horizonUnit} starting after the last provided timestamp.
    3. For "expansion", estimate based on the growth trend when the grid might need more capacity (e.g., "6-12 months", "2 years"). If trend is flat/decreasing, say "Not imminent".
    4. Return ONLY a valid JSON object with this exact structure:
    {
      "forecast": [number, number, ...],
      "analysis": "Short text analyzing the trend (max 2 sentences)",
      "recommendations": "Short text suggesting operational actions (max 2 sentences)",
      "expansion": {
          "timeframe": "Estimated time until new capacity needed (e.g. '12-18 months')",
          "capacityNeededMW": number (estimated MW needed, or 0 if none),
          "reasoning": "Short explanation of growth trend"
      }
    }
    5. Do not include markdown formatting like \`\`\`json. Just the raw JSON object.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up response if it contains markdown
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsed: any;
    try {
        parsed = JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse Gemini response:", text);
        throw new Error("Failed to parse AI forecast response.");
    }

    if (!parsed.forecast || !Array.isArray(parsed.forecast)) {
         throw new Error("AI response missing forecast array.");
    }

    // Generate timestamps for forecast
    const forecast: { timestamp: string; load: number }[] = [];
    let currentTime = new Date(lastTimestamp);

    for (const val of parsed.forecast) {
        if (horizonUnit === 'hours') {
            currentTime.setHours(currentTime.getHours() + 1);
        } else {
            currentTime.setDate(currentTime.getDate() + 1);
        }

        // Simple formatting YYYY-MM-DD HH:MM
        const ts = currentTime.toISOString().slice(0, 16).replace('T', ' ');
        forecast.push({ timestamp: ts, load: Number(val) });

        if (forecast.length >= horizon) break;
    }

    return {
        forecast,
        analysis: parsed.analysis || "No analysis provided.",
        recommendations: parsed.recommendations || "No recommendations provided.",
        expansion: parsed.expansion || { timeframe: "Unknown", capacityNeededMW: 0, reasoning: "No data." }
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
