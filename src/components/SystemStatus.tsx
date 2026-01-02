"use client";

import { CheckCircle2 } from "lucide-react";

export default function SystemStatus() {
  return (
    <div className="bg-blue-900 dark:bg-blue-950/50 rounded-xl p-6 text-white shadow-lg mt-6">
      <h3 className="text-sm font-bold uppercase tracking-wider mb-4 opacity-80">
        System Status
      </h3>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        <span className="font-bold text-green-400">AI PIPELINE READY</span>
      </div>
      <ul className="space-y-2 text-xs md:text-sm text-blue-100/80">
        <li className="flex items-start gap-2">
            <span className="mt-1 w-1 h-1 bg-blue-400 rounded-full"></span>
            Savitzky-Golay (W11, P2) Active
        </li>
        <li className="flex items-start gap-2">
            <span className="mt-1 w-1 h-1 bg-blue-400 rounded-full"></span>
            LSTM Multi-Horizon Inference Active
        </li>
        <li className="flex items-start gap-2">
            <span className="mt-1 w-1 h-1 bg-blue-400 rounded-full"></span>
            Unit Commitment (Rule-Based) Ready
        </li>
      </ul>
    </div>
  );
}
