import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateForecast(
  apiKey: string,
  historicalData: { timestamp: string; load: number }[],
  horizon: number, // Number of future steps
  horizonUnit: 'hours' | 'days' = 'hours'
): Promise<{ timestamp: string; load: number }[]> {

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
    Task: Forecast the electrical load for the next ${horizon} ${horizonUnit}.

    Historical Load Data (Chronological):
    ${dataStr}

    Instructions:
    1. Analyze the trend and seasonality in the provided data.
    2. Predict the load values for the next ${horizon} ${horizonUnit} starting after the last provided timestamp.
    3. Return ONLY a valid JSON array of numbers representing the forecasted load values. Do not include timestamps in the JSON, just the values.
    4. Do not include markdown formatting like \`\`\`json. Just the raw JSON array.

    Example Output:
    [120.5, 125.3, 110.0]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up response if it contains markdown
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let forecastValues: number[];
    try {
        forecastValues = JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse Gemini response:", text);
        // Fallback or retry logic could go here.
        // For now, throw error.
        throw new Error("Failed to parse AI forecast response.");
    }

    if (!Array.isArray(forecastValues)) {
         throw new Error("AI response is not an array.");
    }

    // Generate timestamps for forecast
    const forecast: { timestamp: string; load: number }[] = [];
    let currentTime = new Date(lastTimestamp);

    for (const val of forecastValues) {
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

    return forecast;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
