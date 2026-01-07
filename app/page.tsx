"use client";

import { useState } from "react";
import { Zap, Info } from "lucide-react";
import dynamic from 'next/dynamic';
import SystemConfig from "@/components/SystemConfig";
const ResultsChart = dynamic(() => import("@/components/ResultsChart"), { ssr: false });
import StatusBoard from "@/components/StatusBoard";
import AIInsights from "@/components/AIInsights";
import MaintenanceTimeline from "@/components/MaintenanceTimeline";
import FuturePlanning from "@/components/FuturePlanning";

import { GeneratorUnit, MaintenanceWindowConfig } from '@/utils/decisionLogic';

export default function Home() {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [horizon, setHorizon] = useState(24);
  const [horizonUnit, setHorizonUnit] = useState<'hours' | 'days' | 'years'>('hours');
  const [lookback, setLookback] = useState(168);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [location, setLocation] = useState("New York, NY");
  const [units, setUnits] = useState<GeneratorUnit[]>([
    { id: '1', name: 'Thermal Base-1', capacityMW: 1200, type: 'thermal', isRenewable: false, status: 'ON', marginalCost: 40, emissionFactor: 450 },
    { id: '2', name: 'Solar Farm Alpha', capacityMW: 450, type: 'solar', isRenewable: true, status: 'ON', marginalCost: 5, emissionFactor: 0 },
    { id: '3', name: 'Wind Ridge', capacityMW: 300, type: 'wind', isRenewable: true, status: 'ON', marginalCost: 8, emissionFactor: 0 },
  ]);

  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindowConfig[]>([]);

  const handleRunForecast = async () => {
    if (historicalData.length === 0) return;

    setLoading(true);
    setResults(null);

    try {
      const resp = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historicalData,
          horizon,
          horizonUnit,
          units,
          location,
          maintenanceWindows
        })
      });

      const data = await resp.json();
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
    <main className="h-screen w-full overflow-hidden flex flex-col p-4 gap-4 bg-[#F0F2F5]">

      {/* Header Section */}
      <header className="flex justify-between items-center px-2 py-1 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 neo-card flex items-center justify-center text-blue-500 rounded-2xl shadow-lg border border-white/50">
            <Zap size={20} fill="#3B82F6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-700 tracking-tight uppercase">Powercast AI</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="neo-status-dot bg-green-500"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enhanced Load Forecasting & Decision Support</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</span>
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{loading ? 'Processing...' : 'Ready'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-[300px_1fr] gap-4 min-h-0">

        {/* Sidebar Configuration */}
        <aside className="flex flex-col gap-4 overflow-hidden h-full">
            <div className="flex-1 neo-card p-4 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-2 shrink-0">
                     <h2 className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Control & Configuration</h2>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                     <SystemConfig
                        onDataLoaded={setHistoricalData}
                        dataCount={historicalData.length}
                        horizon={horizon}
                        setHorizon={setHorizon}
                        horizonUnit={horizonUnit}
                        setHorizonUnit={setHorizonUnit}
                        lookback={lookback}
                        setLookback={setLookback}
                        units={units}
                        setUnits={setUnits}
                        maintenanceWindows={maintenanceWindows}
                        setMaintenanceWindows={setMaintenanceWindows}
                        location={location}
                        setLocation={setLocation}
                        onRunForecast={handleRunForecast}
                        isLoading={loading}
                    />
                </div>
            </div>
        </aside>

        {/* Visualization & Analysis Area */}
        <section className="flex flex-col gap-4 overflow-hidden h-full">

          {/* Top Chart Area */}
          <div className="flex-[1.2] neo-card p-1 min-h-0 relative">
            <ResultsChart
              history={historicalData}
              forecast={results?.forecast || []}
              horizon={horizon}
              horizonUnit={horizonUnit}
              isLoading={loading}
            />
          </div>

          {/* Bottom Analysis Grid (3-Columns) */}
          <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">

            {/* Column 1: Generator Commitment */}
            <div className="neo-card p-4 flex flex-col min-h-0">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 shrink-0">Generator Commitment</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <StatusBoard
                    units={units}
                    commitment={results?.unitCommitment}
                  />
              </div>
            </div>

            {/* Column 2: Maintenance Timeline */}
            <div className="neo-card p-4 flex flex-col min-h-0">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 shrink-0">Maintenance Schedule Timeline</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <MaintenanceTimeline
                    windows={results?.maintenance || []}
                  />
              </div>
            </div>

            {/* Column 3: Insights & Expansion */}
            <div className="neo-card p-4 flex flex-col min-h-0">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 shrink-0">Future Planning & AI Insights</h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                    <FuturePlanning
                        expansion={results?.expansion}
                    />
                    <div className="h-px bg-slate-200 shrink-0"></div>
                    <AIInsights
                        analysis={results?.analysis}
                        recommendations={results?.recommendations}
                    />
                </div>
            </div>

          </div>

        </section>

      </div>

    </main>
  );
}
