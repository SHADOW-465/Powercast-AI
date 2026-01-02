import { NextRequest, NextResponse } from 'next/server';
import { savitzkyGolaySmooth } from '@/utils/signalProcessing';
import { calculateUnitCommitment, suggestMaintenance, GeneratorUnit } from '@/utils/decisionLogic';
import { generateForecast } from '@/utils/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      historicalData,
      horizon,
      horizonUnit,
      units
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server configuration error: API Key missing" }, { status: 500 });
    }

    if (!historicalData || !Array.isArray(historicalData)) {
      return NextResponse.json({ error: "Invalid historical data" }, { status: 400 });
    }

    // 1. Preprocessing: Smoothing
    const rawLoads = historicalData.map((d: any) => d.load);
    const smoothedLoads = savitzkyGolaySmooth(rawLoads);

    const processedHistory = historicalData.map((d: any, i: number) => ({
      timestamp: d.timestamp,
      load: smoothedLoads[i],
      originalLoad: d.load
    }));

    // 2. Forecasting (Gemini)
    // We pass the SMOOTHED data to the AI for better trend detection
    // Limit to context size if needed, but generateForecast handles slicing.
    let forecast = [];
    try {
        forecast = await generateForecast(apiKey, processedHistory, horizon, horizonUnit);
    } catch (error: any) {
        return NextResponse.json({ error: "Forecasting failed: " + error.message }, { status: 500 });
    }

    // 3. Decision Support
    // Combine history (tail) + forecast for continuous view, or just forecast.
    // Decision is usually on future steps.
    const forecastLoads = forecast.map(f => f.load);
    const forecastTimestamps = forecast.map(f => f.timestamp);

    const unitCommitment = calculateUnitCommitment(forecastLoads, forecastTimestamps, units);
    const maintenance = suggestMaintenance(forecastLoads, forecastTimestamps);

    return NextResponse.json({
      processedHistory, // Return smoothed data for plotting
      forecast,
      unitCommitment,
      maintenance
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
