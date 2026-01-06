"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIInsightsProps {
    analysis?: string;
    recommendations?: string;
}

export default function AIInsights({ analysis, recommendations }: AIInsightsProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-blue-500" />
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Gemini</h4>
            </div>

            <div className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {analysis || "The forecasts expansion forecast is sustained by long-term power demand trends. It is not recommended to delay capacity processer improvements. Sustained 4% Annual Growth, obtain the reason for its establishment."}
                <br /><br />
                {recommendations || "Suggest initiating project review for next expansion phase."}
            </div>
        </div>
    );
}
