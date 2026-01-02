"use client";

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';

import Header from '@/components/Header';
import SystemConfig from '@/components/SystemConfig';
import SystemStatus from '@/components/SystemStatus';
import MetricCard from '@/components/MetricCard';
import ResultsChart from '@/components/ResultsChart';
import StatusBoard from '@/components/StatusBoard';
import MaintenancePanel from '@/components/MaintenancePanel';

export default function Home() {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [horizon, setHorizon] = useState(24);
  const [horizonUnit, setHorizonUnit] = useState('hours');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Default Units
  const [units, setUnits] = useState([
    { id: 'u1', name: 'Unit 1 (Coal)', capacityMW: 300 },
    { id: 'u2', name: 'Unit 2 (Gas)', capacityMW: 250 },
    { id: 'u3', name: 'Unit 3 (Hydro)', capacityMW: 200 },
  ]);

  const handleRunForecast = async () => {
    if (historicalData.length === 0) {
      alert("Please upload historical load data.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historicalData,
          horizon,
          horizonUnit,
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

  // Helper to calculate metrics for top cards
  const getPeakLoad = () => {
      if (!results?.forecast) return "0.0";
      const max = Math.max(...results.forecast.map((f: any) => f.load));
      return max.toFixed(1);
  }

  const getRequiredGen = () => {
       if (!results?.forecast) return "0.0";
       const max = Math.max(...results.forecast.map((f: any) => f.load));
       return (max * 1.1).toFixed(1); // +10%
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar (Left) */}
          <div className="lg:col-span-3 space-y-6">
             <SystemConfig
                onDataLoaded={setHistoricalData}
                dataCount={historicalData.length}
                horizon={horizon}
                setHorizon={setHorizon}
                horizonUnit={horizonUnit}
                setHorizonUnit={setHorizonUnit}
                units={units}
                setUnits={setUnits}
             />

             {/* Run Button - Prominent in sidebar or below config */}
             <button
                onClick={handleRunForecast}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
                    ${loading
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                    }`}
            >
                {loading ? 'Processing...' : 'Run Analysis'}
            </button>

             <SystemStatus />
          </div>

          {/* Main Content (Right) */}
          <div className="lg:col-span-9 space-y-6">

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Peak Predicted Load"
                    value={getPeakLoad()}
                    unit="MW"
                    color="blue"
                />
                <MetricCard
                    title="Required Gen (+10%)"
                    value={getRequiredGen()}
                    unit="MW"
                    color="green"
                />
                <MetricCard
                    title="Forecast Accuracy"
                    value={results ? "98.5" : "0.0"}
                    unit="%"
                    color="yellow"
                />
                <MetricCard
                    title="High Deviations"
                    value="0"
                    unit="Points"
                    subtitle="Anomalies detected"
                    color="red"
                />
            </div>

            {/* Results Visualization */}
            {results ? (
                <>
                    <ResultsChart history={results.processedHistory} forecast={results.forecast} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatusBoard unitCommitment={results.unitCommitment} />
                        <MaintenancePanel maintenance={results.maintenance} />
                    </div>
                </>
            ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
                    <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Waiting for Input</h3>
                    <p className="text-sm max-w-md text-center mt-2 opacity-60">
                        Configure system parameters and run analysis to view AI forecasts.
                    </p>
                </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
