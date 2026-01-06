import { useState } from 'react';
import FileUpload from './FileUpload';
import { Settings, Sliders, PlayCircle } from 'lucide-react';
import { GeneratorUnit, MaintenanceWindowConfig } from '@/utils/decisionLogic';

interface SystemConfigProps {
  onDataLoaded: (data: any[]) => void;
  dataCount: number;
  horizon: number;
  setHorizon: (h: number) => void;
  horizonUnit: 'hours' | 'days' | 'years';
  setHorizonUnit: (u: 'hours' | 'days' | 'years') => void;
  lookback: number;
  setLookback: (l: number) => void;
  units: GeneratorUnit[];
  setUnits: (u: GeneratorUnit[]) => void;
  maintenanceWindows: MaintenanceWindowConfig[];
  setMaintenanceWindows: (w: MaintenanceWindowConfig[]) => void;
  location: string;
  setLocation: (loc: string) => void;
  onRunForecast: () => void;
  isLoading: boolean;
}

export default function SystemConfig(props: SystemConfigProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'fleet'>('config');

  return (
    <div className="flex flex-col gap-4 w-full h-full overflow-hidden">

      {/* Tab Navigation */}
      <div className="flex p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-white shadow-sm text-blue-500' : 'text-slate-400'}`}
        >
          Configuration
        </button>
        <button
          onClick={() => setActiveTab('fleet')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'fleet' ? 'bg-white shadow-sm text-blue-500' : 'text-slate-400'}`}
        >
          Fleet & Grid
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">

        {activeTab === 'config' ? (
          <>
            {/* 1. Data & Location */}
            <div className="neo-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings size={14} className="text-slate-400" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Input Data</h3>
              </div>
              <div className="space-y-3">
                 <FileUpload onDataLoaded={props.onDataLoaded} />
                 <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Location (Weather)</label>
                    <input
                        type="text"
                        value={props.location}
                        onChange={(e) => props.setLocation(e.target.value)}
                        className="neo-input w-full font-bold text-xs text-slate-600 p-2"
                        placeholder="City, Country"
                    />
                 </div>
              </div>
            </div>

            {/* 2. Forecast Parameters */}
            <div className="neo-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sliders size={14} className="text-slate-400" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Horizon</h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={props.horizon}
                  onChange={(e) => props.setHorizon(parseInt(e.target.value))}
                  className="neo-input w-20 text-center font-bold text-slate-600 text-sm"
                />
                <select
                  value={props.horizonUnit}
                  onChange={(e) => props.setHorizonUnit(e.target.value as any)}
                  className="neo-input flex-1 font-bold text-xs text-slate-600 uppercase"
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
          </>
        ) : (
          /* 3. Fleet Configuration (Compact) */
          <div className="neo-card p-4 flex-1 flex flex-col min-h-[200px]">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Generation Mix</h3>
             <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {props.units.map((u) => (
                  <div key={u.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center group hover:border-blue-100 transition-colors">
                     <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-8 rounded-full ${u.isRenewable ? 'bg-green-400' : 'bg-slate-400'}`}></div>
                        <div>
                           <div className="text-[10px] font-bold text-slate-700">{u.name}</div>
                           <div className="text-[9px] text-slate-400 font-bold uppercase">{u.type} • {u.capacityMW}MW</div>
                        </div>
                     </div>
                     <div className={`text-[9px] font-black px-1.5 py-0.5 rounded ${u.status === 'ON' ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-400'}`}>
                        {u.status}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

      </div>

      {/* Main Action Button - Neumorphic Style */}
      <button
         onClick={props.onRunForecast}
         disabled={props.isLoading || props.dataCount === 0}
         className={`
           group relative w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300
           ${props.isLoading || props.dataCount === 0
             ? 'bg-slate-100 text-slate-400 cursor-not-allowed inner-shadow'
             : 'bg-[#F0F2F5] text-blue-500 neo-btn hover:scale-[1.02] active:scale-[0.98]'}
         `}
       >
         <div className="flex items-center justify-center gap-2 relative z-10">
           {props.isLoading ? (
             <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
           ) : (
             <PlayCircle size={18} className={`${props.dataCount > 0 ? 'text-blue-500' : 'text-slate-300'}`} />
           )}
           <span>{props.isLoading ? 'Processing...' : 'Run Forecast'}</span>
         </div>
       </button>

    </div>
  );
}
