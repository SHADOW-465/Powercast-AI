"use client";

import { useState } from "react";
import { Zap, Activity, Info } from "lucide-react";
import dynamic from 'next/dynamic';
import SystemConfig from "@/components/SystemConfig";
const ResultsChart = dynamic(() => import("@/components/ResultsChart"), { ssr: false });
import StatusBoard from "@/components/StatusBoard";
import AIInsights from "@/components/AIInsights";
import MaintenanceTimeline from "@/components/MaintenanceTimeline";
import FuturePlanning from "@/components/FuturePlanning";

// Unified interfaces
export interface GeneratorUnit {
  id: string;
  name: string;
  capacityMW: number;
  type: 'solar' | 'wind' | 'hydro' | 'thermal' | 'nuclear' | 'other';
  isRenewable: boolean;
  status: 'ON' | 'OFF';
  marginalCost: number;
  emissionFactor: number;
}

export interface MaintenanceWindowConfig {
  id: string;
  start: string;
  end: string;
  reason: string;
}

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
    <main className="min-h-screen p-8 flex flex-col gap-8">

      {/* Header Section */}
      <header className="flex justify-between items-center px-2">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 neo-card flex items-center justify-center text-blue-500 rounded-2xl shadow-lg border border-white/50">
            <Zap size={24} fill="#3B82F6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-700 tracking-tight uppercase">Powercast-AI Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="neo-status-dot bg-green-500"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Operational</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Status</span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{loading ? 'Processing...' : 'Ready'}</span>
          </div>
          <div className="neo-btn group relative p-3 rounded-full hover:text-blue-500">
            <Info size={18} />
            <div className="absolute top-full right-0 mt-4 neo-card p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 w-[240px]">
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest leading-loose">
                Next-gen electrical load forecasting using Google Gemini Intelligence.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-[1fr_2.8fr] gap-8">

        {/* Sidebar Configuration */}
        <aside className="flex flex-col gap-6">
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
        </aside>

        {/* Visualization & Analysis Area */}
        <section className="flex flex-col gap-8">

          {/* Top Chart Area */}
          <div className="flex-1 min-h-[450px]">
            <ResultsChart
              history={historicalData}
              forecast={results?.forecast || []}
              horizon={horizon}
              horizonUnit={horizonUnit}
              isLoading={loading}
            />
          </div>

          {/* Bottom Analysis Grid (3-Columns) */}
          <div className="grid grid-cols-3 gap-8 h-[380px]">

            {/* Column 1: Generator Commitment */}
            <div className="neo-card p-6 flex flex-col overflow-hidden">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Generator Commitment</h3>
              <StatusBoard
                units={units}
                commitment={results?.unitCommitment}
              />
            </div>

            {/* Column 2: Maintenance Timeline */}
            <div className="neo-card p-6 flex flex-col overflow-hidden">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Optimal Maintenance Schedule</h3>
              <MaintenanceTimeline
                windows={results?.maintenance || []}
              />
            </div>

            {/* Column 3: Insights & Expansion */}
            <div className="neo-card p-6 flex flex-col gap-8 justify-center">
              <AIInsights
                analysis={results?.analysis}
                recommendations={results?.recommendations}
              />
              <FuturePlanning
                expansion={results?.expansion}
              />
            </div>

          </div>

        </section>

      </div>

    </main>
  );
}
