import FileUpload from './FileUpload';
import { PlayCircle, Plus, Trash2 } from 'lucide-react';
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

import { useState } from 'react';

export default function SystemConfig(props: SystemConfigProps) {
  const [activeTab, setActiveTab] = useState<'data'|'fleet'|'maint'>('data');

  const addUnit = () => {
    const newId = (props.units.length + 1).toString();
    props.setUnits([...props.units, {
        id: newId,
        name: `Unit ${newId}`,
        capacityMW: 100,
        type: 'thermal',
        isRenewable: false,
        status: 'ON',
        marginalCost: 50,
        emissionFactor: 400
    }]);
  };

  const toggleUnitStatus = (id: string) => {
    props.setUnits(props.units.map(u => u.id === id ? { ...u, status: u.status === 'ON' ? 'OFF' : 'ON' } : u));
  };

  const updateUnit = (id: string, field: keyof GeneratorUnit, value: any) => {
      props.setUnits(props.units.map(u => {
          if (u.id === id) {
              const updated = { ...u, [field]: value };
              // Simple logic to auto-set renewable flag based on type
              if (field === 'type') {
                  if (['solar', 'wind', 'hydro'].includes(value)) {
                      updated.isRenewable = true;
                      updated.emissionFactor = 0;
                  } else {
                      updated.isRenewable = false;
                  }
              }
              return updated;
          }
          return u;
      }));
  };

  const addMaintenance = () => {
      const newId = (props.maintenanceWindows.length + 1).toString();
      props.setMaintenanceWindows([...props.maintenanceWindows, {
          id: newId,
          start: "09:00",
          end: "17:00",
          reason: "Low Demand"
      }]);
  };

  const removeMaintenance = (id: string) => {
      props.setMaintenanceWindows(props.maintenanceWindows.filter(w => w.id !== id));
  };

  const updateMaintenance = (id: string, field: keyof MaintenanceWindowConfig, value: string) => {
      props.setMaintenanceWindows(props.maintenanceWindows.map(w => w.id === id ? { ...w, [field]: value } : w));
  };


  return (
    <div className="flex flex-col gap-3 h-full">

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
            <button onClick={() => setActiveTab('data')} className={`flex-1 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest ${activeTab === 'data' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-400'}`}>Data</button>
            <button onClick={() => setActiveTab('fleet')} className={`flex-1 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest ${activeTab === 'fleet' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-400'}`}>Fleet</button>
            <button onClick={() => setActiveTab('maint')} className={`flex-1 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest ${activeTab === 'maint' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-400'}`}>Maint</button>
        </div>

        {/* Forecast Parameters (Data Tab) */}
        {activeTab === 'data' && (
            <div className="flex flex-col gap-2 flex-1 animate-in fade-in duration-300">
                <div className="neo-card p-3 flex flex-col gap-3">
                     <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Prediction Window</label>
                        <input
                            type="number"
                            value={props.horizon}
                            onChange={(e) => props.setHorizon(parseInt(e.target.value))}
                            className="neo-input w-full font-bold text-slate-600 text-xs p-2"
                        />
                     </div>
                     <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Time Unit</label>
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            {(['hours', 'days', 'years'] as const).map((unit) => (
                                <button
                                    key={unit}
                                    onClick={() => props.setHorizonUnit(unit)}
                                    className={`flex-1 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${props.horizonUnit === unit ? 'bg-white shadow-sm text-blue-500' : 'text-slate-400'}`}
                                >
                                    {unit}
                                </button>
                            ))}
                        </div>
                     </div>
                     <div className="pt-1">
                         <FileUpload onDataLoaded={props.onDataLoaded} />
                         <div className="mt-2">
                            <input
                                type="text"
                                value={props.location}
                                onChange={(e) => props.setLocation(e.target.value)}
                                className="neo-input w-full font-bold text-[10px] text-slate-500 p-2 text-center"
                                placeholder="Location (City, Country)"
                            />
                         </div>
                     </div>
                </div>
            </div>
        )}

        {/* Generator Fleet Configuration (Fleet Tab) */}
        {activeTab === 'fleet' && (
            <div className="flex flex-col gap-2 flex-1 min-h-0 animate-in fade-in duration-300">
                 <div className="neo-card p-3 flex flex-col gap-2 h-full flex-1 min-h-0">
                     <button onClick={addUnit} className="neo-btn w-full py-2 text-[10px] font-black text-blue-500 uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 hover:text-blue-600 shrink-0">
                         <Plus size={12} strokeWidth={4} /> Add Unit
                     </button>

                     <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
                         {props.units.map((u) => (
                             <div key={u.id} className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex flex-col gap-2 shrink-0">
                                 <div className="flex justify-between items-center gap-2">
                                     <input
                                        value={u.name}
                                        onChange={(e) => updateUnit(u.id, 'name', e.target.value)}
                                        className="bg-transparent text-[10px] font-bold text-slate-700 w-full focus:outline-none focus:border-b border-blue-200"
                                     />
                                     <div
                                        onClick={() => toggleUnitStatus(u.id)}
                                        className={`cursor-pointer w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${u.status === 'ON' ? 'bg-green-400 justify-end' : 'bg-slate-300 justify-start'}`}
                                     >
                                         <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                     </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-2">
                                     <select
                                        value={u.type}
                                        onChange={(e) => updateUnit(u.id, 'type', e.target.value)}
                                        className="bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-500 p-1"
                                     >
                                         <option value="thermal">Thermal</option>
                                         <option value="solar">Solar</option>
                                         <option value="wind">Wind</option>
                                         <option value="hydro">Hydro</option>
                                         <option value="nuclear">Nuclear</option>
                                     </select>
                                     <div className="flex items-center bg-white border border-slate-200 rounded px-1">
                                         <input
                                            type="number"
                                            value={u.capacityMW}
                                            onChange={(e) => updateUnit(u.id, 'capacityMW', parseInt(e.target.value))}
                                            className="w-full text-[9px] font-bold text-slate-600 text-right p-1 focus:outline-none"
                                         />
                                         <span className="text-[8px] font-bold text-slate-400 ml-1">MW</span>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
            </div>
        )}

        {/* Maintenance Scheduling (Maint Tab) */}
        {activeTab === 'maint' && (
            <div className="flex flex-col gap-2 flex-1 min-h-0 animate-in fade-in duration-300">
                 <div className="neo-card p-3 flex flex-col gap-2 h-full flex-1 min-h-0">
                    <button onClick={addMaintenance} className="neo-btn w-full py-2 text-[10px] font-black text-blue-500 uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 hover:text-blue-600 shrink-0">
                        <Plus size={12} strokeWidth={4} /> Add Window
                    </button>

                    <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
                        {props.maintenanceWindows.length === 0 && (
                            <div className="text-center py-2 text-[9px] font-bold text-slate-300 uppercase">No Manual Schedule</div>
                        )}
                        {props.maintenanceWindows.map((w) => (
                            <div key={w.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 shrink-0">
                                <div className="grid grid-cols-2 gap-1 flex-1">
                                    <input
                                        type="time"
                                        value={w.start}
                                        onChange={(e) => updateMaintenance(w.id, 'start', e.target.value)}
                                        className="bg-white border border-slate-200 rounded text-[9px] text-slate-600 text-center p-1"
                                    />
                                    <input
                                        type="time"
                                        value={w.end}
                                        onChange={(e) => updateMaintenance(w.id, 'end', e.target.value)}
                                        className="bg-white border border-slate-200 rounded text-[9px] text-slate-600 text-center p-1"
                                    />
                                </div>
                                <select
                                    value={w.reason}
                                    onChange={(e) => updateMaintenance(w.id, 'reason', e.target.value)}
                                    className="bg-white border border-slate-200 rounded text-[9px] text-slate-600 p-1 w-20"
                                >
                                    <option value="Low Demand">Low Demand</option>
                                    <option value="Repair">Repair</option>
                                    <option value="Inspection">Inspection</option>
                                </select>
                                <button onClick={() => removeMaintenance(w.id)} className="text-slate-400 hover:text-red-400">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        )}

        {/* Main Action Button */}
        <button
            onClick={props.onRunForecast}
            disabled={props.isLoading || props.dataCount === 0}
            className={`
            group relative w-full py-3 mt-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300
            ${props.isLoading || props.dataCount === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed inner-shadow'
                : 'bg-[#F0F2F5] text-blue-500 neo-btn hover:scale-[1.02] active:scale-[0.98]'}
            `}
        >
            <div className="flex items-center justify-center gap-2 relative z-10">
            {props.isLoading ? (
                <div className="w-3 h-3 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
            ) : (
                <PlayCircle size={14} className={`${props.dataCount > 0 ? 'text-blue-500' : 'text-slate-300'}`} />
            )}
            <span>{props.isLoading ? 'Processing...' : 'Initiate AI Forecast'}</span>
            </div>
        </button>

    </div>
  );
}
