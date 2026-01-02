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

  // Create a bridge point to connect smoothed line to forecast line visually
  // We prepend a point to the forecast that matches the last smoothed value
  if (historyTail.length > 0 && forecastData.length > 0) {
      const lastHist = historyTail[historyTail.length - 1];
      const bridge = {
          timestamp: lastHist.timestamp,
          actual: null,
          smoothed: lastHist.smoothed, // Also show smoothed here to connect the blue line? No, blue line ends here.
          predicted: lastHist.smoothed // Start prediction from last smoothed point
      };
      // We add this bridge to the forecast data for the 'predicted' line
      forecastData.unshift(bridge);
  }

  const data = [...historyTail, ...forecastData];

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Complete Load Profile</h3>
                <p className="text-sm text-slate-500">Historical, smoothed trend, and future AI predictions.</p>
            </div>
            {/* Legend handled by Recharts, but we can add custom if needed */}
        </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
                dataKey="timestamp"
                stroke="#94a3b8"
                tick={{fontSize: 11}}
                tickFormatter={(val) => {
                    const d = new Date(val);
                    return isNaN(d.getTime()) ? val.split(' ')[1] : d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }}
                minTickGap={30}
            />
            <YAxis
                stroke="#94a3b8"
                tick={{fontSize: 11}}
                tickFormatter={(val) => `${val} MW`}
            />
            <Tooltip
                contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    color: '#0f172a'
                }}
                itemStyle={{ fontSize: '12px' }}
                labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}
            />
            <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ top: -40, right: 0, width: 'auto' }}
            />

            {/* Actual Load: Grey, Solid */}
            <Line
                type="monotone"
                dataKey="actual"
                stroke="#cbd5e1"
                strokeWidth={2}
                dot={false}
                name="Actual"
                activeDot={{ r: 6 }}
            />

            {/* Smoothed Trend: Blue, Dashed */}
            <Line
                type="monotone"
                dataKey="smoothed"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Smoothed"
            />

            {/* Forecast: Red, Solid with Dots */}
            <Line
                type="monotone"
                dataKey="predicted"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                name="Forecast"
                animationDuration={1500}
            />
            </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
