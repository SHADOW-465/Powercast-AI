"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea } from 'recharts';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useMemo } from 'react';

interface ResultsChartProps {
  history: any[];
  forecast: any[];
  horizon: number;
  maintenanceWindows?: any[];
}

export default function ResultsChart({ history, forecast, horizon, maintenanceWindows = [] }: ResultsChartProps) {

  // Safe data preparation
  const data = useMemo(() => {
      const safeHistory = Array.isArray(history) ? history : [];
      const safeForecast = Array.isArray(forecast) ? forecast : [];

      // Map History
      const historyTail = safeHistory.slice(-48).map(d => ({
        timestamp: d.timestamp,
        actual: isNaN(d.originalLoad) ? null : d.originalLoad,
        smoothed: isNaN(d.load) ? null : d.load,
        predicted: null
      }));

      // Map Forecast
      const forecastData = safeForecast.map(d => ({
        timestamp: d.timestamp,
        actual: null,
        smoothed: null,
        predicted: isNaN(d.load) ? null : d.load
      }));

      // Create Bridge Point
      if (historyTail.length > 0 && forecastData.length > 0) {
          const lastHist = historyTail[historyTail.length - 1];
          if (lastHist.smoothed !== null) {
              const bridge = {
                  timestamp: lastHist.timestamp,
                  actual: null,
                  smoothed: lastHist.smoothed,
                  predicted: lastHist.smoothed
              };
              forecastData.unshift(bridge);
          }
      }

      return [...historyTail, ...forecastData];
  }, [history, forecast]);

  const startForecastIndex = data.findIndex(d => d.predicted !== null);

  const formatXAxis = (val: string) => {
      if (!val) return '';
      const parts = val.split(' ');
      if (parts.length > 1) return parts[1]; // Return time part only
      return val.length > 5 ? val.slice(0, 5) : val;
  };

  if (data.length === 0) {
      return (
        <div className="neo-card w-full h-full p-6 flex flex-col items-center justify-center">
            <p className="text-slate-400 text-sm">No data available for visualization.</p>
        </div>
      );
  }

  return (
    <div className="neo-card w-full h-full p-6 relative flex flex-col min-h-[400px]">
        {/* Header inside the chart card */}
        <div className="flex justify-between items-start mb-4 z-10">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dynamic Load Forecast</h2>

            <div className="flex items-center gap-2">
                <div className="neo-btn px-3 py-1 text-[10px] gap-2 cursor-pointer hover:text-blue-500">
                    <Maximize2 className="w-3 h-3" />
                    <span>Zoom/Pan</span>
                </div>
            </div>
        </div>

        {/* Legend Overlay */}
        <div className="flex justify-center gap-6 mb-2">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
                <span className="text-[10px] font-bold text-slate-500">Historical</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
                <span className="text-[10px] font-bold text-slate-500">Smoothed</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]"></div>
                <span className="text-[10px] font-bold text-slate-500">Predicted</span>
            </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400/50 border border-red-400 border-dashed"></div>
                <span className="text-[10px] font-bold text-slate-500">Maintenance</span>
            </div>
        </div>

      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB923C" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FB923C" stopOpacity={0}/>
                </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
                dataKey="timestamp"
                tick={{fontSize: 10, fill: '#94A3B8'}}
                axisLine={false}
                tickLine={false}
                minTickGap={30}
                tickFormatter={formatXAxis}
            />
            <YAxis
                tick={{fontSize: 10, fill: '#94A3B8'}}
                axisLine={false}
                tickLine={false}
            />
            <Tooltip
                contentStyle={{
                    backgroundColor: '#F0F2F5',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '-4px -4px 10px #ffffff, 4px 4px 10px #d1d9e6',
                    fontSize: '12px',
                    color: '#2D3748'
                }}
            />

            {/* Shaded Forecast Zone */}
            {startForecastIndex > 0 && (
                <ReferenceArea
                    x1={data[startForecastIndex]?.timestamp}
                    x2={data[data.length-1]?.timestamp}
                    fill="#FB923C"
                    fillOpacity={0.05}
                />
            )}

            {/* Maintenance Windows */}
            {maintenanceWindows.map((win, idx) => (
                <ReferenceArea
                    key={idx}
                    x1={win.startTimestamp}
                    x2={win.endTimestamp}
                    fill="#F87171"
                    fillOpacity={0.15}
                    strokeOpacity={0.5}
                />
            ))}

            <Area
                type="monotone"
                dataKey="actual"
                stroke="#60A5FA"
                strokeWidth={2}
                fill="url(#colorActual)"
                connectNulls={false}
                activeDot={{ r: 5, fill: "#60A5FA", stroke: "#F0F2F5", strokeWidth: 2 }}
            />
            <Area
                type="monotone"
                dataKey="smoothed"
                stroke="#4ADE80"
                strokeWidth={2}
                fill="transparent"
                strokeDasharray="0"
                connectNulls={true}
            />
             <Area
                type="monotone"
                dataKey="predicted"
                stroke="#FB923C"
                strokeWidth={3}
                fill="url(#colorPredicted)"
                connectNulls={true}
                activeDot={{ r: 6, fill: "#FB923C", stroke: "#F0F2F5", strokeWidth: 2 }}
                animationDuration={1500}
            />

            </AreaChart>
        </ResponsiveContainer>

        {/* Forecast Horizon Label Overlay */}
        <div className="absolute top-4 right-10 pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase bg-[#F0F2F5]/80 px-2 py-1 rounded">Forecast Horizon</span>
        </div>

        {/* Zoom Controls Overlay */}
        <div className="absolute bottom-4 right-4 flex gap-2">
             <button className="w-8 h-8 rounded-lg neo-card flex items-center justify-center text-slate-500 hover:text-blue-500 active:scale-95 transition-transform">
                 <ZoomOut className="w-4 h-4" />
             </button>
             <button className="w-8 h-8 rounded-lg neo-card flex items-center justify-center text-slate-500 hover:text-blue-500 active:scale-95 transition-transform">
                 <ZoomIn className="w-4 h-4" />
             </button>
        </div>
      </div>
    </div>
  );
}
