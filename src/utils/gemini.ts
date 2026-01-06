import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExogenousFactors } from "./weatherService";

export interface ForecastResult {
  forecast: { timestamp: string; load: number }[];
  analysis: string;
  recommendations: string;
  environmentalImpact: number[]; // Percentage of renewables or green-score
  expansion: {
    timeframe: string;
    capacityNeededMW: number;
    reasoning: string;
  };
  maintenance: {
    startTimestamp: string;
    endTimestamp: string;
    reason: string;
    avgLoad: number;
  }[];
}

export async function generateForecast(
  apiKey: string,
  historicalData: { timestamp: string; load: number }[],
  horizon: number,
  horizonUnit: 'hours' | 'days' | 'years' = 'hours',
  units: any[] = [],
  exogenous?: ExogenousFactors
): Promise<ForecastResult> {

  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const lookback = historicalData.slice(-168); // Use up to a week for better seasonality
  const dataStr = lookback.map(d => `${d.timestamp}: ${d.load.toFixed(1)}`).join('\n');
  const unitsStr = units.map(u => `${u.name} (${u.type}, ${u.capacityMW}MW, Renewable: ${u.isRenewable})`).join(', ');
  const lastTimestamp = new Date(lookback[lookback.length - 1].timestamp);

  const exogenousStr = exogenous ? `
    Location: ${exogenous.location}
    Weather: Temp ${exogenous.temperature}°C, Humidity ${exogenous.humidity}%, Cloud Cover ${exogenous.cloudCover}%, Wind ${exogenous.windSpeed}m/s
    Is Holiday: ${exogenous.isHoliday}
  ` : "N/A";

  const prompt = `
    You are an expert electrical load forecasting and grid operations system.
    
    Grid Assets:
    ${unitsStr}

    Exogenous Factors (Current/Initial):
    ${exogenousStr}

    Task:
    1. Forecast the electrical load for the next ${horizon} ${horizonUnit}.
    2. Provide expert analysis and operational recommendations.
    3. Analyze long-term trends to predict Future Expansion needs.
    4. Predict optimal maintenance windows (periods of low load).
    5. Estimate "environmentalImpact" scores for each forecast hour (0-100 green scale).

    Historical Load Data (Last ${lookback.length} points):
    ${dataStr}

    Instructions:
    - Correlate Cloud Cover vs. Solar Output and Temperature vs. Cooling/Heating load.
    - Forecast exactly ${horizon} points.
    - For "maintenance", find periods where load is significantly lower than average.
    - Return ONLY valid JSON:
    {
      "forecast": [number, number, ...],
      "analysis": "Short trend analysis",
      "recommendations": "Operational advice",
      "environmentalImpact": [number, number, ...],
      "expansion": {
          "timeframe": "e.g., '12-18 months'",
          "capacityNeededMW": number,
          "reasoning": "Reasoning"
      },
      "maintenance": [
          { "startTimestamp": "YYYY-MM-DD HH:MM", "endTimestamp": "YYYY-MM-DD HH:MM", "reason": "e.g. Low Load Window", "avgLoad": number }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(cleanedText);

    const forecast: { timestamp: string; load: number }[] = [];
    const currentTime = new Date(lastTimestamp);

    for (const val of parsed.forecast) {
      if (horizonUnit === 'hours') currentTime.setHours(currentTime.getHours() + 1);
      else if (horizonUnit === 'days') currentTime.setDate(currentTime.getDate() + 1);
      else if (horizonUnit === 'years') currentTime.setFullYear(currentTime.getFullYear() + 1);

      const ts = currentTime.toISOString().slice(0, 16).replace('T', ' ');
      forecast.push({ timestamp: ts, load: Number(val) });
      if (forecast.length >= horizon) break;
    }

    return {
      forecast,
      analysis: parsed.analysis || "N/A",
      recommendations: parsed.recommendations || "N/A",
      environmentalImpact: parsed.environmentalImpact || [],
      expansion: parsed.expansion || { timeframe: "Unknown", capacityNeededMW: 0, reasoning: "N/A" },
      maintenance: parsed.maintenance || []
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
