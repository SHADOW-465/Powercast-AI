"use client";

import { Activity, Gauge, Settings, Upload } from "lucide-react";
import FileUpload from "./FileUpload";
import GeneratorInput from "./GeneratorInput";
import { useState } from "react";

interface SystemConfigProps {
  onDataLoaded: (data: any[]) => void;
  dataCount: number;
  horizon: number;
  setHorizon: (val: number) => void;
  horizonUnit: string;
  setHorizonUnit: (val: string) => void;
  units: any[];
  setUnits: (units: any[]) => void;
}

export default function SystemConfig({
  onDataLoaded,
  dataCount,
  horizon,
  setHorizon,
  horizonUnit,
  setHorizonUnit,
  units,
  setUnits,
}: SystemConfigProps) {
  return (
    <div className="space-y-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            System Configuration
        </h2>

      {/* Data Input Section */}
      <div className="space-y-4">
        <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                Historical Data (CSV)
            </label>
            <FileUpload onDataLoaded={onDataLoaded} />
            {dataCount > 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    Loaded {dataCount} data points
                </div>
            )}
        </div>

        <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                Forecast Horizon (Hours)
            </label>
             <input
                type="number"
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
             />
        </div>

        <div>
             <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                Look-back Window (Hours)
            </label>
             <input
                type="number"
                defaultValue={48}
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
             />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
             <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 block">
                Generator Units
            </label>
            <GeneratorInput units={units} onChange={setUnits} />
        </div>

      </div>
    </div>
  );
}
