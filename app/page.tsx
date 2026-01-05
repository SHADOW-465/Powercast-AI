"use client";

import { useState } from 'react';
import SystemConfig from '@/components/SystemConfig';
import ResultsChart from '@/components/ResultsChart';
import StatusBoard from '@/components/StatusBoard';
import AIInsights from '@/components/AIInsights';
import { BarChart3, Zap, Sparkles } from 'lucide-react';

export default function Home() {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [horizon, setHorizon] = useState(24);
  const [lookback, setLookback] = useState(48);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Default units (with stable IDs)
  const [units, setUnits] = useState([
    { id: 'u1', name: 'Thermal Unit A', capacityMW: 2500, type: 'Capacity' },
    { id: 'u2', name: 'Hydro Unit B', capacityMW: 3500, type: 'Hydro' },
    { id: 'u3', name: 'Gas Unit C', capacityMW: 3000, type: 'Capacity' },
  ]);

  const handleRunForecast = async () => {
    if (historicalData.length === 0) {
      alert("Please upload historical load data.");
      return;
    }

    setLoading(true);
    setResults(null); // Clear previous results to trigger loading state

    try {
      const res = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historicalData,
          horizon,
          horizonUnit: 'hours',
          units
        })
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setResults(data);
      }
    } catch (e) {
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-8 flex flex-col md:flex-row gap-8 overflow-hidden bg-[#F0F2F5]">
       {/* Sidebar */}
       <div className="w-full md:w-1/4 min-w-[340px] flex flex-col gap-6">
            <h1 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-2 ml-1">Input & Configuration</h1>
            <SystemConfig
                onDataLoaded={setHistoricalData}
                dataCount={historicalData.length}
                horizon={horizon}
                setHorizon={setHorizon}
                lookback={lookback}
                setLookback={setLookback}
                units={units}
                setUnits={setUnits}
                onRunForecast={handleRunForecast}
                isLoading={loading}
            />
       </div>

       {/* Main Content */}
       <div className="w-full md:w-3/4 flex flex-col gap-6 h-full">
            <h1 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-2 ml-1">Forecasting & Decision Support</h1>

            {/* Chart Panel */}
            <div className="flex-1 min-h-[420px]">
                {results ? (
                    <ResultsChart history={results.processedHistory} forecast={results.forecast} horizon={horizon} />
                ) : (
                    <div className="neo-card w-full h-full p-6 flex flex-col">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Dynamic Load Forecast Visualization</h2>
                        <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                            <BarChart3 className="w-12 h-12 mb-3 text-slate-400" />
                            <p className="text-sm font-medium text-slate-500">
                                {loading ? 'Processing Forecast...' : 'Awaiting Forecast Execution'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[380px]">

                {/* Unit Commitment */}
                <div className="h-full">
                     {results ? (
                         <StatusBoard unitCommitment={results.unitCommitment} maintenance={results.maintenance} units={units} />
                     ) : (
                         <div className="neo-card w-full h-full p-6 flex flex-col">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Optimized Unit Commitment & Maintenance</h2>
                            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                                <Zap className="w-10 h-10 mb-3 text-slate-400" />
                                <p className="text-sm font-medium text-slate-500">Unit Status Pending</p>
                            </div>
                         </div>
                     )}
                </div>

                {/* AI Insights */}
                <div className="h-full">
                     {results ? (
                         <AIInsights analysis={results.analysis} recommendations={results.recommendations} />
                     ) : (
                         <div className="neo-card w-full h-full p-6 flex flex-col">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">AI Insights & Reasoning</h2>
                            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                                <Sparkles className="w-10 h-10 mb-3 text-slate-400" />
                                <p className="text-sm font-medium text-slate-500">Gemini Engine Ready</p>
                            </div>
                         </div>
                     )}
                </div>

            </div>
       </div>
    </main>
  );
}
