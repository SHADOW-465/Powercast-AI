"use client";

import React from 'react';

interface FuturePlanningProps {
    expansion?: {
        timeframe: string;
        capacityNeededMW: number;
        reasoning: string;
    } | null;
}

export default function FuturePlanning({ expansion }: FuturePlanningProps) {
    return (
        <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Long-Term Expansion Forecast</h4>

            <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Estimated Time Frame</span>
                    <div className="neo-inset px-2 py-1.5 text-[10px] font-bold text-slate-600">
                        {expansion?.timeframe || '2026-2028'}
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Additional Capacity</span>
                    <div className="neo-inset px-2 py-1.5 text-[10px] font-bold text-slate-600">
                        {expansion?.capacityNeededMW ? `${expansion.capacityNeededMW} MW` : '500 MW'}
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Reasoning</span>
                    <div className="neo-inset px-2 py-1.5 text-[9px] font-bold text-slate-600 leading-tight">
                        {expansion?.reasoning || 'Sustained 4% Annual Growth'}
                    </div>
                </div>
            </div>
        </div>
    );
}
