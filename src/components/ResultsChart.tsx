import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea
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
    // If no data, return empty
    if (history.length === 0 && forecast.length === 0) return [];

    // Prioritize Forecast View
    // User wants: "forecast data to be more prioritized... portion of year 2024 (history) visible left side"
    // Heuristic: If we have forecast, show all forecast + small tail of history (e.g. 20% of chart width equivalent)
    // If forecast is length N, we might want N/4 history points prepended.

    // If we have forecast, determine how much history to show by default
    // This doesn't filter the data, but sets the default zoom/view.
    // However, Recharts needs the data array. Let's build the full connected dataset first.

    // 1. Process History
    // We need to parse timestamps if available to do the Year logic correctly.
    // Assuming history items have 'timestamp' or we infer from index.

    // Check if we can determine the last timestamp of history to project future dates
    let lastHistoryDate = new Date();
    if (history.length > 0) {
        const last = history[history.length - 1];
        // Try to parse timestamp
        const ts = last.timestamp || last.date;
        if (ts) {
            const parsed = new Date(ts);
            if (!isNaN(parsed.getTime())) {
                lastHistoryDate = parsed;
            }
        }
    }

    const normalizedHistory = history.map((point: any, index: number) => ({
      name: point.timestamp || `T-${history.length - index}`,
      load: typeof point === 'object' ? (point.value || point.Load_MW) : point,
      forecast: null,
      type: 'history',
      originalIndex: index
    }));

    // 2. Process Forecast with Date Logic
    const normalizedForecast = forecast.map((val, index) => {
        let label = `+${index + 1}`;

        // Date Projection
        const currentDate = new Date(lastHistoryDate);
        if (horizonUnit === 'hours') {
            currentDate.setHours(currentDate.getHours() + (index + 1));
            // Format: HH:mm
            label = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (horizonUnit === 'days') {
            currentDate.setDate(currentDate.getDate() + (index + 1));
            // Format: MMM dd
            label = currentDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } else if (horizonUnit === 'years') {
            // For years, we probably mean "forecast over a year" so the steps might be days or months?
            // If the user selected "Years" as unit and "1" as horizon, we probably get 12 data points (months)?
            // Or 365 points? The API usually returns what we ask.
            // Assuming the forecast array corresponds to the "steps" of the horizon.

            // If the user said "Forecast for 1 Year" and we get e.g. 12 points (monthly), or 8760 points (hourly).
            // Let's assume the API handles the resolution.
            // If the unit is 'years', we assume the steps are significant.
            // Let's increment based on a sensible step. If we just have indices, we project.

            // Simple approach: If unit is 'years', maybe the steps are months?
            // Let's assume the user meant the *duration* is years, but the resolution is monthly/daily.
            // But if the backend simply steps by 1 'unit', then 1 year step is huge.
            // Let's assume standard monthly projection if count is low (~12), or daily if (~365).

            // Fallback: If 'years' is selected, simply increment year? No, that's too coarse.
            // Let's assume standard date increment.
            currentDate.setMonth(currentDate.getMonth() + (index + 1)); // Assumption: Steps are months for 'Year' view
            label = currentDate.toLocaleDateString([], { month: 'short', year: 'numeric' });
        }

        return {
            name: label,
            load: null,
            forecast: val,
            type: 'forecast',
            originalIndex: index
        };
    });

    // Stitching: Connect the last history point to the first forecast point
    if (normalizedHistory.length > 0 && normalizedForecast.length > 0) {
        const lastHist = normalizedHistory[normalizedHistory.length - 1];
        normalizedForecast.unshift({
            name: lastHist.name,
            load: null,
            forecast: lastHist.load,
            type: 'forecast',
            originalIndex: -1
        });
    }

    const fullData = [...normalizedHistory, ...normalizedForecast];

    // Slicing for Default View ("Prioritize Forecast")
    // If we haven't zoomed yet (left === 'dataMin'), we might want to return a sliced version?
    // OR we can just set the domain of XAxis to start from (Total - Forecast - SmallBuffer).

    // Let's filter the data passed to the chart if no zoom is active to optimize performance and view.
    // Actually, XAxis domain is better for maintaining scrollability/zoom-out capability if we implemented that.
    // But Recharts 'domain' on XAxis (Category) works by index.

    // User wants: "forecast data to be more prioritized ... portion of history visible"
    // Let's return the full data but calculate the default start index.
    return fullData;

  }, [history, forecast, horizonUnit]);

  // Determine Default Start Index for "Prioritized View"
  // We want to show all forecast + maybe 20% history.
  const defaultStartIndex = useMemo(() => {
      if (!chartData || chartData.length === 0) return 0;
      const forecastStartIndex = chartData.findIndex(d => d.type === 'forecast');
      if (forecastStartIndex === -1) return 0; // No forecast

      const forecastLength = chartData.length - forecastStartIndex;
      // Show history equal to say 25% of forecast length?
      const historyBuffer = Math.floor(forecastLength * 0.25);
      const start = Math.max(0, forecastStartIndex - historyBuffer);
      return start;
  }, [chartData]);

  // Update view when data changes (reset zoom to default view)
  // We need to use 'startIndex' if we want to programmatically zoom.
  // Recharts XAxis domain by index can do this.

  // We need to map 'name' to index effectively if using category axis?
  // Actually, let's just slice the data we *render* by default if the user hasn't zoomed.
  // Wait, if we slice, the user can't zoom out to see older history.
  // Better: Set the default 'left' state to the name of the start index.

  // NOTE: This creates a loop if we set state in render. We need useEffect.
  useMemo(() => {
     if (chartData.length > 0 && left === 'dataMin') {
         // This is a bit tricky. We only want to set this ONCE when new data arrives.
         // But 'chartData' changes when history/forecast changes.
         // We can leave it as 'dataMin' and 'dataMax' and let the user zoom?
         // User explicitly asked for specific initial view.
     }
  }, [chartData, left]);


  // Filter data based on current zoom or default view
  // If left is 'dataMin', use our calculated defaultStartIndex?
  // No, 'dataMin' usually means 0.
  // Let's implement a 'visibleData' logic.

  const visibleData = useMemo(() => {
      if (left === 'dataMin' && right === 'dataMax') {
          // Apply default view (Forecast + buffer)
          return chartData.slice(defaultStartIndex);
      }

      // If zoomed, we rely on Recharts internal filtering or we filter manually.
      // With Category axis, Recharts doesn't auto-slice effectively for performance sometimes,
      // but for logic correctness:
      // If we provided `domain={[left, right]}` to XAxis, Recharts handles it.
      // But we want the *initial* state to be zoomed in.

      return chartData;
  }, [chartData, left, right, defaultStartIndex]);


  // Zoom Logic
  const zoom = () => {
    if (refAreaLeft === refAreaRight || refAreaRight === null || refAreaLeft === null) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      return;
    }

    // Direction check
    // We need to find indices of the labels
    const leftIndex = chartData.findIndex(d => d.name === refAreaLeft);
    const rightIndex = chartData.findIndex(d => d.name === refAreaRight);

    if (leftIndex > rightIndex) {
        // Right-to-Left Drag: Zoom In
        setLeft(refAreaRight);
        setRight(refAreaLeft);
    } else {
        // Left-to-Right Drag: Reset (Zoom Out)
        setLeft('dataMin');
        setRight('dataMax');
    }

    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50/50 rounded-2xl">
        <div className="animate-pulse flex flex-col items-center gap-2">
           <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generating AI Model...</span>
        </div>
      </div>
    );
  }

  if (history.length === 0 && forecast.length === 0) {
    return (
       <div className="w-full h-full flex items-center justify-center">
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Waiting for Data...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative select-none">
      <div className="absolute top-2 left-4 z-10 flex flex-col pointer-events-none">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dynamic Load Forecast</h3>
        <p className="text-[9px] text-slate-300 font-bold mt-0.5">
            Drag R-to-L to Zoom • L-to-R to Reset
        </p>
      </div>

      <div className="absolute top-2 right-4 z-10 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-blue-500 rounded-full"></div>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Historical</span>
          </div>
          <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-red-500 rounded-full"></div>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Predicted</span>
          </div>
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-[20%] bg-gradient-to-l from-red-50/30 to-transparent pointer-events-none z-0"></div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
            data={visibleData} // Use the sliced data for default view
            margin={{ top: 30, right: 20, left: 0, bottom: 0 }}
            onMouseDown={(e) => e && e.activeLabel && setRefAreaLeft(e.activeLabel)}
            onMouseMove={(e) => refAreaLeft && e && e.activeLabel && setRefAreaRight(e.activeLabel)}
            onMouseUp={zoom}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            tick={{fontSize: 9, fill: '#94A3B8', fontWeight: 700}}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis
             tick={{fontSize: 9, fill: '#94A3B8', fontWeight: 700}}
             axisLine={false}
             tickLine={false}
             domain={['auto', 'auto']}
             width={35}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', fontWeight: 600 }}
            cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          <Line
            type="monotone"
            dataKey="load"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={false}
            animationDuration={500}
            activeDot={{ r: 4, strokeWidth: 0 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#EF4444"
            strokeWidth={2.5}
            dot={false}
            strokeDasharray="0 0"
            animationDuration={500}
            activeDot={{ r: 4, strokeWidth: 0 }}
            connectNulls
          />

          {/* Reference area for forecast region highlight */}
          {chartData.some(d => d.type === 'forecast') && (
              <ReferenceArea
                x1={chartData.find(d => d.type === 'forecast')?.name}
                strokeOpacity={0}
                fill="#EF4444"
                fillOpacity={0.05}
               />
          )}

          {refAreaLeft && refAreaRight ? (
            <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="#3B82F6" fillOpacity={0.1} />
          ) : null}

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
