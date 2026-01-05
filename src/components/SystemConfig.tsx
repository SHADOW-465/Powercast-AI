"use client";

import { useState } from "react";
import { Upload, Trash2, Zap, Settings, Activity } from "lucide-react";
import FileUpload from "./FileUpload";

interface SystemConfigProps {
  onDataLoaded: (data: any[]) => void;
  dataCount: number;
  horizon: number;
  setHorizon: (val: number) => void;
  lookback: number;
  setLookback: (val: number) => void;
  units: any[];
  setUnits: (units: any[]) => void;
  onRunForecast: () => void;
  isLoading: boolean;
}

export default function SystemConfig({
  onDataLoaded,
  dataCount,
  horizon,
  setHorizon,
  lookback,
  setLookback,
  units,
  setUnits,
  onRunForecast,
  isLoading
}: SystemConfigProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'params' | 'fleet'>('upload');

  const removeUnit = (id: string) => {
      setUnits(units.filter(u => u.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 h-full">

      {/* Top Card: Tabs + Content */}
      <div className="neo-card p-6 flex flex-col gap-6">

        {/* Tabs */}
        <div className="flex p-1 neo-inset rounded-xl">
            {[
                { id: 'upload', label: 'DATA UPLOAD' },
                { id: 'params', label: 'PARAMETERS' },
                { id: 'fleet', label: 'GENERATOR FLEET' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-2 text-[10px] font-bold tracking-wider rounded-lg transition-all ${
                        activeTab === tab.id
                        ? 'bg-[#F0F2F5] text-blue-600 shadow-[-3px_-3px_6px_#ffffff,3px_3px_6px_#d1d9e6]'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[150px]">
            {activeTab === 'upload' && (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-blue-400 transition-colors cursor-pointer group">
                   <FileUpload onDataLoaded={onDataLoaded} />
                   {dataCount > 0 && (
                       <p className="mt-2 text-xs text-green-600 font-bold">✓ {dataCount} points loaded</p>
                   )}
                </div>
            )}

            {activeTab === 'params' && (
                <div className="space-y-4 py-2">
                    <p className="text-xs text-slate-500">Global parameters for the AI model.</p>
                    {/* Just placeholder info, sliders are main controls below */}
                    <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Model Type</span>
                        <span className="font-bold">Gemini 2.0 Flash</span>
                    </div>
                     <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Smoothing</span>
                        <span className="font-bold">Savitzky-Golay (W11)</span>
                    </div>
                </div>
            )}

            {activeTab === 'fleet' && (
                 <div className="space-y-4 py-2">
                    <p className="text-xs text-slate-500">Configure available generation assets.</p>
                    <div className="text-center text-xs text-blue-500 font-bold cursor-pointer hover:underline">
                        + Add New Unit
                    </div>
                 </div>
            )}
        </div>
      </div>

      {/* Sliders Section */}
      <div className="flex flex-col gap-6 px-2">
          <div>
              <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Forecast Horizon</label>
                  <div className="neo-inset px-3 py-1 text-slate-600 font-bold text-xs w-12 text-center">
                      {horizon}
                  </div>
              </div>
              <div className="h-6 flex items-center">
                 <input
                    type="range"
                    min="12" max="72" step="1"
                    value={horizon}
                    onChange={(e) => setHorizon(Number(e.target.value))}
                    className="w-full"
                 />
              </div>
          </div>

          <div>
              <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Look-back</label>
                  <div className="neo-inset px-3 py-1 text-slate-600 font-bold text-xs w-12 text-center">
                      {lookback}
                  </div>
              </div>
              <div className="h-6 flex items-center">
                 <input
                    type="range"
                    min="24" max="168" step="12"
                    value={lookback}
                    onChange={(e) => setLookback(Number(e.target.value))}
                    className="w-full"
                 />
              </div>
          </div>
      </div>

      {/* Generator Fleet List (Always Visible based on mockup, or maybe just when Fleet tab selected?
          Mockup description says "Below it, three stacked... list items".
          But the top card also has tabs.
          I will put the fleet list below the sliders as a separate section as per "Section header 'GENERATOR FLEET'" description
          which seemed separate from the card.
      */}
      <div>
          <h3 className="text-xs font-bold text-slate-600 uppercase mb-4">Generator Fleet</h3>
          <div className="space-y-4">
              {units.map((unit) => (
                  <div key={unit.id} className="neo-card p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full neo-inset flex items-center justify-center text-slate-400">
                             <Zap className="w-4 h-4" />
                          </div>
                          <div>
                              <div className="text-xs font-bold text-slate-700">{unit.name}</div>
                              <div className="text-[10px] text-slate-500">{unit.capacityMW} kWh • {unit.type}</div>
                          </div>
                      </div>
                      <button
                        onClick={() => removeUnit(unit.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                      >
                          <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
              ))}
          </div>
      </div>

      <div className="mt-auto">
          <button
            onClick={onRunForecast}
            disabled={isLoading}
            className={`neo-btn w-full text-xs uppercase tracking-wider ${isLoading ? 'opacity-70 cursor-wait' : 'hover:text-blue-600'}`}
          >
              {isLoading ? 'Processing...' : 'Initiate AI Forecast'}
          </button>
      </div>

    </div>
  );
}
