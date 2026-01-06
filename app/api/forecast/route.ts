import { NextRequest, NextResponse } from 'next/server';
import { generateForecast } from '@/utils/gemini';
import { adaptiveSmooth } from '@/utils/signalProcessing';
import { fetchCurrentWeather } from '@/utils/weatherService';
import { calculateUnitCommitment, suggestMaintenance } from '@/utils/decisionLogic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      historicalData,
      timestamps,
      forecastHorizon = 24,
      location = "New York, NY", // Default location
      userConfig,
      maintenanceWindows
    } = body;

    if (!historicalData || !Array.isArray(historicalData) || historicalData.length === 0) {
      return NextResponse.json({ error: "Invalid historical data" }, { status: 400 });
    }

    // 1. Fetch Real-Time Exogenous Factors (Weather)
    let weatherContext = undefined;
    try {
      const weather = await fetchCurrentWeather(location);
      // Map to context structure expected by Gemini
      weatherContext = {
        temperature: [weather.temperature], // Mocking array for now
        cloudCover: [weather.cloudCover],
        windSpeed: [weather.windSpeed]
      };
    } catch (err) {
      console.warn("Failed to fetch weather data:", err);
    }

    // 2. Adaptive Signal Processing
    const smoothedData = adaptiveSmooth(historicalData);

    // 3. Call Gemini for forecasting
    const forecastResult = await generateForecast({
      historicalData: smoothedData,
      timestamps,
      forecastHorizon,
      location,
      context: weatherContext
    });

    // 4. Calculate Unit Commitment & Maintenance
    const units = body.units || [];

    // Generate future timestamps if not present
    // Simple hourly increment
    const futureTimestamps = [];
    const lastTime = timestamps ? new Date(timestamps[timestamps.length-1]).getTime() : Date.now();
    for (let i = 1; i <= forecastResult.forecast.length; i++) {
        futureTimestamps.push(new Date(lastTime + i * 3600000).toISOString());
    }

    const unitCommitment = calculateUnitCommitment(
        forecastResult.forecast,
        futureTimestamps,
        units
    );

    const maintenance = suggestMaintenance(
        forecastResult.forecast,
        futureTimestamps
    );

    return NextResponse.json({
      originalData: historicalData,
      smoothedData,
      forecast: forecastResult.forecast,
      explanation: forecastResult.explanation,
      confidenceIntervals: forecastResult.confidenceIntervals,
      unitCommitment,
      maintenance,
      analysis: "AI Analysis: " + (forecastResult.explanation || "System stable."),
      recommendations: ["Shift non-essential load to midday if Solar available.", "Monitor thermal unit efficiency."],
      expansion: ["Consider +50MW Battery Storage for peak shaving."]
    });

  } catch (error: any) {
    console.error("Forecast API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
