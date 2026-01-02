interface StatusBoardProps {
  unitCommitment: any[];
}

export default function StatusBoard({ unitCommitment }: StatusBoardProps) {
  // Show status for the first forecasted step (Next Hour/Day)
  const currentStatus = unitCommitment[0];

  if (!currentStatus) return null;

  return (
    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex justify-between items-center">
        <span>Generation Status (T+1)</span>
        <span className="text-sm font-normal text-slate-400">{currentStatus.timestamp}</span>
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800/50 p-4 rounded-lg">
           <div className="text-sm text-slate-400">Predicted Load</div>
           <div className="text-2xl font-bold text-white">{currentStatus.loadMW.toFixed(1)} <span className="text-sm font-normal text-slate-500">MW</span></div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg">
           <div className="text-sm text-slate-400">Total Generation ON</div>
           <div className={`text-2xl font-bold ${currentStatus.surplus < 0 ? 'text-red-400' : 'text-green-400'}`}>
             {currentStatus.totalCapacityOn} <span className="text-sm font-normal text-slate-500">MW</span>
           </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-slate-300 uppercase tracking-wider">Units Online</div>
        <div className="flex flex-wrap gap-2">
            {currentStatus.unitsOn.length > 0 ? currentStatus.unitsOn.map((u: string) => (
                <span key={u} className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm font-medium">
                    {u}
                </span>
            )) : <span className="text-slate-500 italic">None</span>}
        </div>

        <div className="text-sm font-medium text-slate-300 uppercase tracking-wider mt-4">Units Offline</div>
        <div className="flex flex-wrap gap-2">
            {currentStatus.unitsOff.length > 0 ? currentStatus.unitsOff.map((u: string) => (
                <span key={u} className="px-3 py-1 bg-slate-700/50 text-slate-400 border border-slate-600 rounded-full text-sm">
                    {u}
                </span>
            )) : <span className="text-slate-500 italic">None</span>}
        </div>
      </div>
    </div>
  );
}
