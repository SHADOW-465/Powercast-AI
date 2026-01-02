"use client";

import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  color: "blue" | "green" | "yellow" | "red";
}

export default function MetricCard({ title, value, unit, subtitle, color }: MetricCardProps) {

  const colorMap = {
      blue: "border-blue-500 text-blue-600 dark:text-blue-400",
      green: "border-green-500 text-green-600 dark:text-green-400",
      yellow: "border-yellow-500 text-yellow-600 dark:text-yellow-400",
      red: "border-red-500 text-red-600 dark:text-red-400",
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 ${colorMap[color].split(" ")[0]}`}>
      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
        {title}
      </h3>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
        {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
