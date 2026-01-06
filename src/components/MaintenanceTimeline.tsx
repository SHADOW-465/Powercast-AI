"use client";

import React from 'react';

interface MaintenanceWindow {
    startTimestamp: string;
    endTimestamp: string;
    reason: string;
    avgLoad?: number;
}

interface MaintenanceTimelineProps {
    windows: MaintenanceWindow[];
}

export default function MaintenanceTimeline({ windows }: MaintenanceTimelineProps) {
    if (windows.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No Maintenance Scheduled</p>
            </div>
        );
    }

    // Simple representation: list of windows with relative time bars
    return (
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[220px] pr-2">
            {windows.map((win, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-bold text-slate-600">{win.reason}</span>
                        <span className="text-[9px] text-slate-400 font-medium">
                            {win.startTimestamp.split(' ')[1] || win.startTimestamp} - {win.endTimestamp.split(' ')[1] || win.endTimestamp}
                        </span>
                    </div>
                    <div className="h-6 w-full neo-inset relative overflow-hidden flex items-center">
                        <div
                            className="h-full bg-blue-400/30 border-r-2 border-l-2 border-blue-500 rounded-lg flex items-center px-3"
                            style={{
                                marginLeft: `${(idx * 15) % 40}%`, // Mocking positions for demo visual
                                width: '50%'
                            }}
                        >
                            <div className="text-[8px] font-bold text-blue-700 truncate uppercase mt-0.5">
                                {win.reason} • Active
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Time Markers */}
            <div className="flex justify-between px-1 mt-2">
                {[0, 12, 24, 36, 48].map(h => (
                    <span key={h} className="text-[8px] font-black text-slate-300">{h}h</span>
                ))}
            </div>
        </div>
    );
}
