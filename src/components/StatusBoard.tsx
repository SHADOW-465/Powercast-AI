interface StatusBoardProps {
  unitCommitment: any[];
}

export default function StatusBoard({ unitCommitment }: StatusBoardProps) {
  // Show status for the first forecasted step (Next Hour/Day)
  const currentStatus = unitCommitment[0];

  if (!currentStatus) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex justify-between items-center">
        <span>Generation Status (T+1)</span>
        <span className="text-sm font-normal text-slate-500">{currentStatus.timestamp}</span>
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
           <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Predicted Load</div>
           <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{currentStatus.loadMW.toFixed(1)} <span className="text-sm font-normal text-slate-500">MW</span></div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
           <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Gen. On</div>
           <div className={`text-2xl font-bold mt-1 ${currentStatus.surplus < 0 ? 'text-red-500' : 'text-green-500'}`}>
             {currentStatus.totalCapacityOn} <span className="text-sm font-normal text-slate-500">MW</span>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Units Online</div>
            <div className="flex flex-wrap gap-2">
                {currentStatus.unitsOn.length > 0 ? currentStatus.unitsOn.map((u: string) => (
                    <span key={u} className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30 rounded-full text-sm font-semibold shadow-sm">
                        {u}
                    </span>
                )) : <span className="text-slate-500 italic text-sm">None</span>}
            </div>
        </div>

        <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Units Offline</div>
            <div className="flex flex-wrap gap-2">
                {currentStatus.unitsOff.length > 0 ? currentStatus.unitsOff.map((u: string) => (
                    <span key={u} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full text-sm">
                        {u}
                    </span>
                )) : <span className="text-slate-500 italic text-sm">None</span>}
            </div>
        </div>
      </div>
    </div>
  );
}
