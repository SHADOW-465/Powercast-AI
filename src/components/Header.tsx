"use client";

import { Moon, Sun, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
            <h1 className="font-bold text-xl text-white tracking-tight">P</h1>
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
              PowerCast <span className="text-blue-600 dark:text-cyan-400">AI</span>
            </h1>
            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
              Load Forecasting & Support
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
          >
            {mounted && theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-md shadow-blue-600/20">
            Run Forecast Analysis
          </div>
        </div>
      </div>
    </header>
  );
}
