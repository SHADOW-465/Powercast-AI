import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea
} from 'recharts';

interface ResultsChartProps {
  history: any[];
  forecast: number[];
  horizon: number;
  horizonUnit: 'hours' | 'days' | 'years';
  isLoading: boolean;
}

export default function ResultsChart({ history, forecast, horizonUnit, isLoading }: ResultsChartProps) {

  // Interaction State for Zooming
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [left, setLeft] = useState<string | 'dataMin'>('dataMin');
  const [right, setRight] = useState<string | 'dataMax'>('dataMax');

  // Chart Data Preparation
  const chartData = useMemo(() => {
    // Determine history slice based on simple heuristic if not zoomed
    // If we have forecast, we want to emphasize it.
    // Default view: Show last 50% history + Forecast

    // Normalize History
    const normalizedHistory = history.map((point: any, index: number) => ({
      name: point.timestamp || `T-${history.length - index}`,
      load: typeof point === 'object' ? (point.value || point.Load_MW) : point,
      forecast: null,
      type: 'history',
      index: index
    }));

    const lastHistoryIdx = normalizedHistory.length;

    // Normalize Forecast
    const normalizedForecast = forecast.map((val, index) => {
      // Fix for "Years" display logic if needed
      let label = `+${index + 1}${horizonUnit[0]}`;
      if (horizonUnit === 'years') {
         // If "years", assuming index is year offset?
         // Or if input was hours and we selected years?
         // Let's stick to the relative label for now, but formatted nicely.
         label = `Y+${index + 1}`;
      }

      return {
        name: label,
        load: null, // continuous line gap?
        forecast: val,
        type: 'forecast',
        index: lastHistoryIdx + index
      };
    });

    // To connect the lines, we need the last history point to also be the first forecast point (visually)
    // or Recharts will leave a gap.
    if (normalizedHistory.length > 0 && normalizedForecast.length > 0) {
        const lastHist = normalizedHistory[normalizedHistory.length - 1];
        normalizedForecast.unshift({
            name: lastHist.name,
            load: null,
            forecast: lastHist.load, // Connect point
            type: 'forecast',
            index: lastHistoryIdx - 1
        });
    }

    return [...normalizedHistory, ...normalizedForecast];
  }, [history, forecast, horizonUnit]);

  // Zoom Logic
  const zoom = () => {
    if (refAreaLeft === refAreaRight || refAreaRight === null || refAreaLeft === null) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      return;
    }

    // Identify direction
    // Recharts dataKey "name" implies categorical axis usually, but we need indices for reliable direction check
    // We'll rely on the order in the data array found by name.

    const leftIndex = chartData.findIndex(d => d.name === refAreaLeft);
    const rightIndex = chartData.findIndex(d => d.name === refAreaRight);

    // Custom Requirement:
    // Drag Right-to-Left (Right Index < Left Index? No, Start on Right, Move Left)
    // Wait, mouseDown is 'Left', mouseUp is 'Right' in time sequence?
    // Let's define by drag direction on screen.

    // In Recharts:
    // refAreaLeft is the starting point (MouseDown)
    // refAreaRight is the ending point (MouseUp)

    if (leftIndex > rightIndex) {
        // User dragged from Right (later time) to Left (earlier time)
        // Action: "Magnify / Accurate" -> Zoom In
        setLeft(refAreaRight);
        setRight(refAreaLeft);
    } else {
        // User dragged from Left to Right
        // Action: "Vice Versa" -> Zoom Out / Show Previous Data
        setLeft('dataMin');
        setRight('dataMax');
    }

    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  if (isLoading) {
    return (
      <div className="neo-card w-full h-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
           <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generating AI Model...</span>
        </div>
      </div>
    );
  }

  if (history.length === 0 && forecast.length === 0) {
    return (
       <div className="neo-card w-full h-full flex items-center justify-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Data Loaded</span>
      </div>
    );
  }

  return (
    <div className="neo-card w-full h-full p-4 relative select-none">
      <div className="absolute top-4 left-6 z-10 flex flex-col">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Load Forecast Visualization</h3>
        <p className="text-[9px] text-slate-300 font-bold mt-1">
            Drag Right-to-Left to Zoom • Left-to-Right to Reset
        </p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
            data={chartData}
            margin={{ top: 40, right: 30, left: 0, bottom: 0 }}
            onMouseDown={(e) => e && e.activeLabel && setRefAreaLeft(e.activeLabel)}
            onMouseMove={(e) => refAreaLeft && e && e.activeLabel && setRefAreaRight(e.activeLabel)}
            onMouseUp={zoom}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 700}}
            axisLine={false}
            tickLine={false}
            domain={[left, right]}
            allowDataOverflow
          />
          <YAxis
             tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 700}}
             axisLine={false}
             tickLine={false}
             domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}
          />
          <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }} />

          <Line
            type="monotone"
            dataKey="load"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={false}
            name="Historical Load"
            animationDuration={300}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#EF4444"
            strokeWidth={3}
            dot={false}
            strokeDasharray="5 5"
            name="AI Prediction"
            animationDuration={300}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />

          {refAreaLeft && refAreaRight ? (
            <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="#3B82F6" fillOpacity={0.1} />
          ) : null}

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
