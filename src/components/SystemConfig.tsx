"use client";

import { useState } from "react";
import { Upload, Trash2, Zap, Settings, Activity, Plus, Edit2, X } from "lucide-react";
import FileUpload from "./FileUpload";

interface GeneratorUnit {
  id: string;
  name: string;
  capacityMW: number;
  type: string;
}

interface SystemConfigProps {
  onDataLoaded: (data: any[]) => void;
  dataCount: number;
  horizon: number;
  setHorizon: (val: number) => void;
  horizonUnit: 'hours' | 'days';
  setHorizonUnit: (val: 'hours' | 'days') => void;
  lookback: number;
  setLookback: (val: number) => void;
  units: GeneratorUnit[];
  setUnits: (units: GeneratorUnit[]) => void;
  onRunForecast: () => void;
  isLoading: boolean;
}

export default function SystemConfig({
  onDataLoaded,
  dataCount,
  horizon,
  setHorizon,
  horizonUnit,
  setHorizonUnit,
  lookback,
  setLookback,
  units,
  setUnits,
  onRunForecast,
  isLoading
}: SystemConfigProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'params' | 'fleet'>('upload');

  // Unit Editing State
  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [unitForm, setUnitForm] = useState({ name: '', capacityMW: '', type: 'Thermal' });

  const startAddUnit = () => {
      setUnitForm({ name: '', capacityMW: '', type: 'Thermal' });
      setEditingUnitId(null);
      setIsEditingUnit(true);
  };

  const startEditUnit = (unit: GeneratorUnit) => {
      setUnitForm({ name: unit.name, capacityMW: unit.capacityMW.toString(), type: unit.type });
      setEditingUnitId(unit.id);
      setIsEditingUnit(true);
  };

  const saveUnit = () => {
      if (!unitForm.name || !unitForm.capacityMW) {
          alert("Please fill in all fields.");
          return;
      }

      const newUnit = {
          id: editingUnitId || Math.random().toString(36).substr(2, 9),
          name: unitForm.name,
          capacityMW: Number(unitForm.capacityMW),
          type: unitForm.type
      };

      if (editingUnitId) {
          setUnits(units.map(u => u.id === editingUnitId ? newUnit : u));
      } else {
          setUnits([...units, newUnit]);
      }
      setIsEditingUnit(false);
  };

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
                { id: 'upload', label: 'DATA' },
                { id: 'params', label: 'PARAMS' },
                { id: 'fleet', label: 'FLEET' }
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
                     <p className="text-xs text-slate-500 mb-2">Prediction Window Control</p>

                     {/* Horizon Input */}
                     <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Length</label>
                            <input
                                type="number"
                                value={horizon}
                                onChange={(e) => setHorizon(Number(e.target.value))}
                                className="w-full neo-inset rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-400"
                            />
                        </div>
                         <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Unit</label>
                            <select
                                value={horizonUnit}
                                onChange={(e) => setHorizonUnit(e.target.value as 'hours' | 'days')}
                                className="w-full neo-inset rounded-lg p-2 text-xs font-bold text-slate-700 outline-none bg-transparent"
                            >
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                            </select>
                        </div>
                     </div>

                     <div className="mt-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Context Look-back ({lookback} pts)</label>
                         <input
                            type="range"
                            min="24" max="168" step="12"
                            value={lookback}
                            onChange={(e) => setLookback(Number(e.target.value))}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200"
                         />
                     </div>
                </div>
            )}

            {activeTab === 'fleet' && !isEditingUnit && (
                 <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-slate-500">Configure Assets ({units.length})</p>
                        <button onClick={startAddUnit} className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1">
                             <Plus className="w-3 h-3" /> Add
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[140px]">
                        {units.map((unit) => (
                          <div key={unit.id} className="neo-card p-2 flex items-center justify-between group">
                              <div className="flex items-center gap-2 overflow-hidden">
                                  <div className="w-6 h-6 rounded-full neo-inset flex items-center justify-center text-slate-400 shrink-0">
                                     <Zap className="w-3 h-3" />
                                  </div>
                                  <div className="min-w-0">
                                      <div className="text-[10px] font-bold text-slate-700 truncate">{unit.name}</div>
                                      <div className="text-[9px] text-slate-500 truncate">{unit.capacityMW} MW • {unit.type}</div>
                                  </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEditUnit(unit)} className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-blue-500">
                                      <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => removeUnit(unit.id)} className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-500">
                                      <Trash2 className="w-3 h-3" />
                                  </button>
                              </div>
                          </div>
                        ))}
                    </div>
                 </div>
            )}

            {activeTab === 'fleet' && isEditingUnit && (
                <div className="flex flex-col gap-2 h-full">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-600">{editingUnitId ? 'Edit Unit' : 'Add Unit'}</span>
                        <button onClick={() => setIsEditingUnit(false)}><X className="w-4 h-4 text-slate-400" /></button>
                    </div>
                    <input
                        placeholder="Name (e.g., Gas Unit A)"
                        value={unitForm.name}
                        onChange={e => setUnitForm({...unitForm, name: e.target.value})}
                        className="neo-inset p-2 rounded text-xs w-full"
                    />
                     <input
                        placeholder="Capacity (MW)"
                        type="number"
                        value={unitForm.capacityMW}
                        onChange={e => setUnitForm({...unitForm, capacityMW: e.target.value})}
                        className="neo-inset p-2 rounded text-xs w-full"
                    />
                    <select
                        value={unitForm.type}
                        onChange={e => setUnitForm({...unitForm, type: e.target.value})}
                        className="neo-inset p-2 rounded text-xs w-full bg-transparent"
                    >
                        <option value="Thermal">Thermal</option>
                        <option value="Hydro">Hydro</option>
                        <option value="Renewable">Renewable</option>
                        <option value="Nuclear">Nuclear</option>
                    </select>
                    <button onClick={saveUnit} className="neo-btn mt-auto py-1 text-xs text-blue-500 font-bold">
                        Save Unit
                    </button>
                </div>
            )}
        </div>
      </div>

      <div className="mt-auto">
          <button
            onClick={onRunForecast}
            disabled={isLoading}
            className={`neo-btn w-full text-xs uppercase tracking-wider py-4 ${isLoading ? 'opacity-70 cursor-wait' : 'hover:text-blue-600'}`}
          >
              {isLoading ? 'Processing...' : 'Initiate AI Forecast'}
          </button>
      </div>

    </div>
  );
}
