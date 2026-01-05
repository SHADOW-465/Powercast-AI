import { useState, useEffect } from 'react';
import { Zap, Settings, CheckCircle, XCircle } from 'lucide-react';

interface StatusBoardProps {
  unitCommitment: any[];
  maintenance: any[];
  units: any[];
}

export default function StatusBoard({ unitCommitment, maintenance, units }: StatusBoardProps) {
  // Local state to track overrides.
  const [manualStatus, setManualStatus] = useState<Record<string, boolean>>({});

  // Get the current (first step) recommendation
  const currentRecommendation = unitCommitment && unitCommitment.length > 0
    ? unitCommitment[0]
    : { unitsOn: [], unitsOff: [] };

  useEffect(() => {
    if (unitCommitment && unitCommitment.length > 0) {
        const firstStep = unitCommitment[0];
        const newStatus: Record<string, boolean> = {};
        units.forEach(u => {
            newStatus[u.name] = firstStep.unitsOn.includes(u.name);
        });
        setManualStatus(newStatus);
    }
  }, [unitCommitment, units]);

  const toggleUnit = (unitName: string) => {
      setManualStatus(prev => ({
          ...prev,
          [unitName]: !prev[unitName]
      }));
  };

  return (
    <div className="neo-card w-full h-full p-6 flex flex-col overflow-hidden">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Generator Commitment</h2>

      {/* Header Row */}
      <div className="flex items-center justify-between px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase">
          <div className="w-1/3">Unit</div>
          <div className="w-1/3 text-center">Current Status</div>
          <div className="w-1/3 text-right">Optimal (AI)</div>
      </div>

      {/* Unit List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-4">
          {units.map((unit) => {
              const isOn = manualStatus[unit.name] ?? false;
              const isOptimalOn = currentRecommendation.unitsOn.includes(unit.name);
              const isOptimalOff = currentRecommendation.unitsOff.includes(unit.name); // Explicit check if needed, or just !isOptimalOn

              return (
                <div key={unit.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    {/* Unit Name */}
                    <div className="w-1/3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                        <span className="text-xs font-bold text-slate-700 truncate">{unit.name}</span>
                    </div>

                    {/* Manual Toggle (Center) */}
                    <div className="w-1/3 flex justify-center">
                        <div
                            onClick={() => toggleUnit(unit.name)}
                            className={`relative w-10 h-5 rounded-full transition-colors duration-300 cursor-pointer ${isOn ? 'bg-blue-100' : 'bg-slate-200' } shadow-inner`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow bg-white transform transition-transform duration-300 ${isOn ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                        </div>
                    </div>

                    {/* Optimal Indicator (Right) */}
                    <div className="w-1/3 flex items-center justify-end gap-1">
                        {isOptimalOn ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                ON
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                OFF
                            </span>
                        )}
                    </div>
                </div>
              );
          })}
      </div>

      {/* Maintenance List at Bottom */}
      <div className="mt-auto border-t border-slate-200 pt-4">
           <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Maintenance Schedule Timeline</h3>
           <div className="space-y-2">
               {maintenance && maintenance.length > 0 ? maintenance.slice(0, 3).map((m: any, i: number) => (
                   <div key={i} className="flex flex-col gap-1 p-2 bg-[#F8FAFC] rounded-lg border border-slate-100">
                       <div className="flex justify-between items-center">
                           <span className="text-[10px] font-bold text-slate-600">
                               {m.startTimestamp ? m.startTimestamp.split(' ')[1] || m.startTimestamp : ''} - {m.endTimestamp ? m.endTimestamp.split(' ')[1] || m.endTimestamp : ''}
                           </span>
                           <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">Low Load</span>
                       </div>
                       <div className="text-[9px] text-slate-400 italic truncate">{m.reason}</div>
                   </div>
               )) : (
                   <div className="text-xs text-slate-400 italic text-center py-2">No maintenance windows detected.</div>
               )}
           </div>
      </div>
    </div>
  );
}
