import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ForecastRequest {
  historicalData: number[];
  timestamps: string[];
  forecastHorizon: number; // e.g., 24 hours
  location?: string;
  context?: {
    temperature?: number[];
    cloudCover?: number[];
    windSpeed?: number[];
  };
}

export interface ForecastResult {
  forecast: number[];
  confidenceIntervals?: { lower: number[], upper: number[] };
  explanation?: string;
}

export async function generateForecast(req: ForecastRequest): Promise<ForecastResult> {
  const apiKey = process.env.GEMINI_API_KEY || "";

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Using fallback mock generation.");
    return generateFallbackForecast(req);
  }

  // Safe initialization
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const historyLength = req.historicalData.length;
  const contextWindow = Math.min(48, historyLength);
  const recentHistory = req.historicalData.slice(-contextWindow);

  let prompt = `Act as an expert electrical grid load forecaster.
  I will provide you with a sequence of recent hourly electrical load data (in MW).
  Your task is to predict the next ${req.forecastHorizon} hours of load.

  Recent Historical Load (last ${contextWindow} hours):
  ${recentHistory.join(", ")}

  `;

  if (req.location) {
    prompt += `Location: ${req.location}\n`;
  }

  if (req.context) {
    prompt += `Weather Context (Exogenous Factors):
    - Temperature: ${req.context.temperature ? req.context.temperature[0] + "C (Current)" : "Not provided"}
    - Cloud Cover: ${req.context.cloudCover ? req.context.cloudCover[0] + "%" : "Not provided"}
    - Wind Speed: ${req.context.windSpeed ? req.context.windSpeed[0] + "km/h" : "Not provided"}
    
    CRITICAL CORRELATIONS TO APPLY:
    1. Temperature vs Load: If temperature is high (>25C) or low (<10C), increase residential load prediction (AC/Heating).
    2. Cloud Cover vs Solar (Net Load): If cloud cover is high, behind-the-meter solar generation drops, causing Net Load to INCREASE.
    3. Wind Speed: High wind may affect cooling but primarily impacts wind generation (if applicable).

    Adjust the forecast trend based on these factors relative to the recent history.
    `;
  }

  prompt += `
  Return the output strictly as a JSON object with the following structure:
  {
    "forecast": [number, number, ...], // array of length ${req.forecastHorizon}
    "explanation": "string" // brief reasoning citing weather impact if applicable
  }
  Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed.forecast) || parsed.forecast.length !== req.forecastHorizon) {
       throw new Error("Invalid forecast length from AI");
    }

    return {
      forecast: parsed.forecast,
      explanation: parsed.explanation
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return generateFallbackForecast(req);
  }
}

function generateFallbackForecast(req: ForecastRequest): ForecastResult {
  const lastVal = req.historicalData[req.historicalData.length - 1] || 100;
  const forecast: number[] = [];

  for(let i=0; i<req.forecastHorizon; i++) {
    const hourOffset = i;
    const seasonality = Math.sin((hourOffset / 24) * 2 * Math.PI) * (lastVal * 0.1);
    const noise = (Math.random() - 0.5) * (lastVal * 0.05);
    forecast.push(Math.max(0, lastVal + seasonality + noise));
  }

  return {
    forecast,
    explanation: "Fallback logic used (Gemini API unavailable or failed)."
  };
}
