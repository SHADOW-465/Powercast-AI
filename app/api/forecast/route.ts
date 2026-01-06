import { NextRequest, NextResponse } from 'next/server';
import { savitzkyGolaySmooth, backtestAndOptimize } from '@/utils/signalProcessing';
import { calculateUnitCommitment, suggestMaintenance, GeneratorUnit } from '@/utils/decisionLogic';
import { generateForecast } from '@/utils/gemini';
import { fetchExogenousFactors } from '@/utils/weatherService';

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

    // 1. Adaptive Signal Quality Control
    const rawLoads = historicalData.map((d: any) => d.load);
    const { windowSize, degree, lookback } = backtestAndOptimize(rawLoads);

    // 2. Preprocessing: Smoothing with optimized parameters
    const smoothedLoads = savitzkyGolaySmooth(rawLoads, windowSize, degree);

    const processedHistory = historicalData.map((d: any, i: number) => ({
      timestamp: d.timestamp,
      load: smoothedLoads[i],
      originalLoad: d.load
    })).slice(-lookback); // Adaptive Context Window

    console.log(`[Adaptive Controller] Optimized: Window=${windowSize}, Degree=${degree}, Lookback=${lookback}`);

    // 2. Fetch Exogenous factors (Weather/Environmental)
    const { location = "Global Grid" } = body;
    let exogenous;
    try {
      exogenous = await fetchExogenousFactors(location);
    } catch (err) {
      console.warn("Exogenous fetch failed, continuing without weather data.");
    }

    // 3. Forecasting (Gemini)
    let aiResult;
    try {
      aiResult = await generateForecast(apiKey, processedHistory, horizon, horizonUnit, units, exogenous);
    } catch (error: any) {
      return NextResponse.json({ error: "Forecasting failed: " + error.message }, { status: 500 });
    }

    const { forecast, analysis, recommendations, expansion, maintenance, environmentalImpact } = aiResult;

    const forecastLoads = forecast.map(f => f.load);
    const forecastTimestamps = forecast.map(f => f.timestamp);

    // 4. Hybrid Dispatch Logic (Environmental Priority)
    const unitCommitment = calculateUnitCommitment(forecastLoads, forecastTimestamps, units);

    return NextResponse.json({
      processedHistory,
      forecast,
      analysis,
      recommendations,
      expansion,
      unitCommitment,
      maintenance,
      environmentalScore: environmentalImpact // AI estimated green score
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
