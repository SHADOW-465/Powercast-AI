"use client";

import { useState } from "react";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import FileUpload from "./FileUpload";

interface GeneratorUnit {
    id: string;
    name: string;
    capacityMW: number;
    type: 'solar' | 'wind' | 'hydro' | 'thermal' | 'nuclear' | 'other';
    isRenewable: boolean;
    status: 'ON' | 'OFF';
    marginalCost: number;
    emissionFactor: number;
}

interface MaintenanceWindow {
    id: string;
    start: string;
    end: string;
    reason: string;
}

interface SystemConfigProps {
    onDataLoaded: (data: any[]) => void;
    dataCount: number;
    horizon: number;
    setHorizon: (val: number) => void;
    horizonUnit: 'hours' | 'days' | 'years';
    setHorizonUnit: (val: 'hours' | 'days' | 'years') => void;
    lookback: number;
    setLookback: (val: number) => void;
    units: GeneratorUnit[];
    setUnits: (units: GeneratorUnit[]) => void;
    maintenanceWindows: MaintenanceWindow[];
    setMaintenanceWindows: (windows: MaintenanceWindow[]) => void;
    location: string;
    setLocation: (val: string) => void;
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
    units,
    setUnits,
    maintenanceWindows,
    setMaintenanceWindows,
    location,
    setLocation,
    onRunForecast,
    isLoading
}: SystemConfigProps) {
    const [isConfigOpen, setIsConfigOpen] = useState(true);

    const addUnit = () => {
        const newUnit: GeneratorUnit = {
            id: Math.random().toString(36).substr(2, 9),
            name: `Unit ${units.length + 1}`,
            capacityMW: 500,
            type: 'thermal',
            isRenewable: false,
            status: 'ON',
            marginalCost: 45,
            emissionFactor: 400
        };
        setUnits([...units, newUnit]);
    };

    const updateUnit = (id: string, field: keyof GeneratorUnit, value: any) => {
        setUnits(units.map(u => u.id === id ? { ...u, [field]: value } : u));
    };

    const removeUnit = (id: string) => {
        setUnits(units.filter(u => u.id !== id));
    };

    const addMaintenance = () => {
        const newWindow: MaintenanceWindow = {
            id: Math.random().toString(36).substr(2, 9),
            start: '09:00 AM',
            end: '05:00 PM',
            reason: 'Low Demand'
        };
        setMaintenanceWindows([...maintenanceWindows, newWindow]);
    };

    const removeMaintenance = (id: string) => {
        setMaintenanceWindows(maintenanceWindows.filter(m => m.id !== id));
    };

    const updateMaintenance = (id: string, field: keyof MaintenanceWindow, value: string) => {
        setMaintenanceWindows(maintenanceWindows.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    return (
        <div className="flex flex-col gap-6">

            {/* 1. Forecast Parameters */}
            <div className="neo-card flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Parameters</h3>
                    <button onClick={() => setIsConfigOpen(!isConfigOpen)} className="text-slate-400">
                        {isConfigOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>

                {isConfigOpen && (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Grid Location (City or Lat/Lng)</label>
                            <input
                                type="text"
                                placeholder="e.g. New York, NY"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="neo-input w-full font-bold text-slate-700"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Prediction Window</label>
                                <input
                                    type="number"
                                    value={horizon}
                                    onChange={(e) => setHorizon(Number(e.target.value))}
                                    className="neo-input w-full font-bold text-slate-700"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Time Unit</label>
                                <div className="flex p-1 neo-inset rounded-xl">
                                    {(['hours', 'days', 'years'] as const).map((unit) => (
                                        <button
                                            key={unit}
                                            onClick={() => setHorizonUnit(unit)}
                                            className={`neo-pill flex-1 ${horizonUnit === unit ? 'neo-pill-active' : 'neo-pill-inactive'}`}
                                        >
                                            {unit}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Generator Fleet Configuration */}
            <div className="neo-card flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hybrid Dispatch Fleet</h3>
                    <button onClick={addUnit} className="neo-btn flex items-center justify-center bg-blue-500 text-white rounded-full p-1.5 shadow-none w-full max-w-[80px] text-[9px] py-1">
                        ADD UNIT
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-[1fr_0.8fr_0.4fr_0.4fr_0.4fr_0.2fr] gap-2 px-1">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Unit & Type</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase text-center">Is Green</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase text-center">MW</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase text-center">Cost</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase text-center">CO2</span>
                        <span></span>
                    </div>
                    <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                        {units.map((unit) => (
                            <div key={unit.id} className="grid grid-cols-[1fr_0.8fr_0.4fr_0.4fr_0.4fr_0.2fr] gap-2 items-center">
                                <div className="flex flex-col gap-1">
                                    <input
                                        value={unit.name}
                                        onChange={(e) => updateUnit(unit.id, 'name', e.target.value)}
                                        className="neo-input py-1 text-[9px] font-black uppercase"
                                    />
                                    <select
                                        value={unit.type}
                                        onChange={(e) => updateUnit(unit.id, 'type', e.target.value)}
                                        className="text-[8px] font-bold text-slate-400 bg-transparent border-none outline-none cursor-pointer"
                                    >
                                        <option value="thermal">Thermal</option>
                                        <option value="solar">Solar</option>
                                        <option value="wind">Wind</option>
                                        <option value="hydro">Hydro</option>
                                        <option value="nuclear">Nuclear</option>
                                    </select>
                                </div>
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => updateUnit(unit.id, 'isRenewable', !unit.isRenewable)}
                                        className={`w-8 h-4 rounded-full relative transition-all ${unit.isRenewable ? 'bg-green-400' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${unit.isRenewable ? 'left-[18px]' : 'left-[2px]'}`}></div>
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    value={unit.capacityMW}
                                    onChange={(e) => updateUnit(unit.id, 'capacityMW', Number(e.target.value))}
                                    className="neo-input py-1 text-[9px] font-bold text-center"
                                />
                                <input
                                    type="number"
                                    value={unit.marginalCost}
                                    onChange={(e) => updateUnit(unit.id, 'marginalCost', Number(e.target.value))}
                                    className="neo-input py-1 text-[9px] font-bold text-center"
                                />
                                <input
                                    type="number"
                                    value={unit.emissionFactor}
                                    onChange={(e) => updateUnit(unit.id, 'emissionFactor', Number(e.target.value))}
                                    className="neo-input py-1 text-[9px] font-bold text-center"
                                />
                                <div className="flex items-center justify-end">
                                    <button onClick={() => removeUnit(unit.id)} className="text-slate-300 hover:text-red-500">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Maintenance Scheduling */}
            <div className="neo-card flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Maintenance Scheduling</h3>
                    <button onClick={addMaintenance} className="neo-btn flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg p-1 px-3 shadow-none border border-blue-200 text-[9px] uppercase font-black">
                        Add Window
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-[0.8fr_0.8fr_1fr_0.2fr] gap-2 px-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Start</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">End</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Reason</span>
                        <span></span>
                    </div>
                    <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
                        {maintenanceWindows.map((win) => (
                            <div key={win.id} className="grid grid-cols-[0.8fr_0.8fr_1fr_0.2fr] gap-2 items-center">
                                <input
                                    type="text"
                                    value={win.start}
                                    onChange={(e) => updateMaintenance(win.id, 'start', e.target.value)}
                                    className="neo-input py-1 text-[10px] font-medium"
                                />
                                <input
                                    type="text"
                                    value={win.end}
                                    onChange={(e) => updateMaintenance(win.id, 'end', e.target.value)}
                                    className="neo-input py-1 text-[10px] font-medium"
                                />
                                <select
                                    value={win.reason}
                                    onChange={(e) => updateMaintenance(win.id, 'reason', e.target.value)}
                                    className="neo-input py-1 text-[10px] font-medium bg-transparent"
                                >
                                    <option value="Low Demand">Low Demand</option>
                                    <option value="Refueling">Refueling</option>
                                    <option value="Overhaul">Overhaul</option>
                                </select>
                                <button onClick={() => removeMaintenance(win.id)} className="text-slate-300 hover:text-red-500">
                                    <Trash2 size={11} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <FileUpload onDataLoaded={onDataLoaded} />
            {dataCount > 0 && (
                <p className="text-[10px] text-green-600 font-bold text-center -mt-2 uppercase tracking-widest">✓ {dataCount} Data Points Available</p>
            )}

            <button
                onClick={onRunForecast}
                disabled={isLoading || dataCount === 0}
                className={`neo-btn-primary w-full py-4 uppercase tracking-[0.2em] text-xs font-black ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isLoading ? 'Processing AI Models...' : 'Initiate AI Forecast'}
            </button>

        </div>
    );
}
