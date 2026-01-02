"use client";

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ResultsChart from '@/components/ResultsChart';
import StatusBoard from '@/components/StatusBoard';
import MaintenancePanel from '@/components/MaintenancePanel';
import GeneratorInput from '@/components/GeneratorInput';
import { Activity, Cpu, Zap, Settings, BarChart3, AlertTriangle, Key, Gauge } from 'lucide-react';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
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
    if (!apiKey) {
      alert("Please enter a Google Gemini API Key.");
      return;
    }
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
          apiKey,
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
               <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white tracking-tight">PowerCast <span className="text-cyan-400">AI</span></h1>
              <p className="text-xs text-slate-500 font-medium">Intelligent Load Forecasting & Decision Support</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-md border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-mono text-slate-400">SYSTEM ONLINE</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">

            {/* API Key Section */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Key className="w-4 h-4" /> System Access
                </h3>
                <div className="space-y-3">
                    <label className="text-xs text-slate-500">Google Gemini API Key</label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-600">
                        Key is required for AI forecasting engine. Not stored permanently.
                    </p>
                </div>
            </div>

            {/* Data Input Section */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Activity className="w-4 h-4" /> Data Source
              </h3>
              <FileUpload onDataLoaded={setHistoricalData} />
              {historicalData.length > 0 && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-md border border-green-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      Loaded {historicalData.length} data points
                  </div>
              )}
            </div>

            {/* Parameters Section */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Configuration
              </h3>

              <div className="space-y-4">
                  <div>
                      <label className="block text-xs text-slate-500 mb-1">Forecast Horizon</label>
                      <div className="flex gap-2">
                          <input
                            type="number"
                            value={horizon}
                            onChange={(e) => setHorizon(Number(e.target.value))}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                          />
                          <select
                            value={horizonUnit}
                            onChange={(e) => setHorizonUnit(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                          >
                              <option value="hours">Hours</option>
                              <option value="days">Days</option>
                          </select>
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs text-slate-500 mb-1">Look-back Window (points)</label>
                      <input
                        type="number"
                        defaultValue={48}
                        disabled
                        className="w-full bg-slate-800/50 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                      />
                      <p className="text-[10px] text-slate-600 mt-1">Fixed for optimization (48 steps)</p>
                  </div>
              </div>
            </div>

            {/* Generator Units */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Gauge className="w-4 h-4" /> Generator Fleet
                </h3>
                <GeneratorInput units={units} onChange={setUnits} />
            </div>

            <button
                onClick={handleRunForecast}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2
                    ${loading
                        ? 'bg-slate-800 text-slate-500 cursor-wait'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                    }`}
            >
                {loading ? (
                    <>Processing...</>
                ) : (
                    <>
                        <Zap className="w-5 h-5 fill-current" /> Initialize Forecast
                    </>
                )}
            </button>

          </div>

          {/* Right Column: Visualization */}
          <div className="lg:col-span-8 space-y-6">

            {/* Chart Area */}
            {results ? (
                <>
                    <ResultsChart history={results.processedHistory} forecast={results.forecast} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatusBoard unitCommitment={results.unitCommitment} />
                        <MaintenancePanel maintenance={results.maintenance} />
                    </div>
                </>
            ) : (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-600 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                    <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                    <h3 className="text-lg font-medium text-slate-400">Waiting for Input</h3>
                    <p className="text-sm max-w-md text-center mt-2 opacity-60">
                        Upload historical load data CSV and enter your API key to generate AI-powered forecasts and decision support.
                    </p>
                </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
