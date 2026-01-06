"use client";

import React from 'react';

interface GeneratorUnit {
    id: string;
    name: string;
    capacityMW: number;
    type: string;
    status: 'ON' | 'OFF';
}

interface StatusBoardProps {
    units: GeneratorUnit[];
    commitment?: any[];
}

export default function StatusBoard({ units, commitment }: StatusBoardProps) {
    const getOptimalStatus = (unitName: string) => {
        if (!commitment || commitment.length === 0) return 'ON';
        const latest = commitment[commitment.length - 1];
        return latest.unitsOn.includes(unitName) ? 'ON' : 'OFF';
    };

    return (
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-2">
            <div className="grid grid-cols-[1fr_0.6fr_0.8fr] gap-4 px-2 mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Optimal Status</span>
            </div>

            <div className="flex flex-col gap-3">
                {units.map((unit) => {
                    const optimal = getOptimalStatus(unit.name);
                    return (
                        <div key={unit.id} className="grid grid-cols-[1fr_0.6fr_0.8fr] gap-4 items-center bg-white/30 p-2.5 rounded-xl border border-white/50 shadow-sm">
                            <span className="text-[11px] font-bold text-slate-700">{unit.name}:</span>
                            <div className="flex justify-center">
                                <span className={`text-[10px] font-black uppercase tracking-widest text-slate-500`}>
                                    {unit.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-end gap-2 px-1">
                                <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_6px_rgba(0,0,0,0.1)] ${optimal === 'ON' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}></div>
                                <span className={`text-[10px] font-bold uppercase ${optimal === 'ON' ? 'text-green-600' : 'text-red-500'}`}>
                                    {optimal} ({optimal === 'ON' ? 'Green' : 'Red'})
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
