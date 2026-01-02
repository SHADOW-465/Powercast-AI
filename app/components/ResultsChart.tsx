"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ComposedChart } from 'recharts';

interface ResultsChartProps {
  history: any[];
  forecast: any[];
}

export default function ResultsChart({ history, forecast }: ResultsChartProps) {
  // Combine data for display
  // We want to show the tail of history and the full forecast

  // Take last 48 points of history
  const historyTail = history.slice(-48).map(d => ({
    timestamp: d.timestamp,
    actual: d.originalLoad,
    smoothed: d.load,
    predicted: null
  }));

  const forecastData = forecast.map(d => ({
    timestamp: d.timestamp,
    actual: null,
    smoothed: null,
    predicted: d.load
  }));

  const data = [...historyTail, ...forecastData];

  return (
    <div className="w-full h-[400px] bg-slate-900/50 rounded-xl p-4 border border-slate-800">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Load Forecast Visualization</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="timestamp"
            stroke="#94a3b8"
            tick={{fontSize: 12}}
            tickFormatter={(val) => val.split(' ')[1]} // Show time only
          />
          <YAxis stroke="#94a3b8" label={{ value: 'Load (MW)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}/>
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
          />
          <Legend />

          <Line
            type="monotone"
            dataKey="actual"
            stroke="#64748b"
            strokeWidth={1}
            dot={false}
            name="Actual History"
          />
          <Line
            type="monotone"
            dataKey="smoothed"
            stroke="#22d3ee"
            strokeWidth={2}
            dot={false}
            name="Smoothed History"
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#f472b6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            name="AI Forecast"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
