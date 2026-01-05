import { useState, useEffect } from 'react';
import { Zap, Settings, Calendar } from 'lucide-react';

interface StatusBoardProps {
  unitCommitment: any[];
  maintenance: any[];
  units: any[];
}

export default function StatusBoard({ unitCommitment, maintenance, units }: StatusBoardProps) {
  // Local state to track overrides.
  // We initialize based on the FIRST step of the forecast (recommendation).
  const [manualStatus, setManualStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // When new forecast arrives, reset/update the manual status to match recommendations
    const currentStatus = unitCommitment[0] || { unitsOn: [], unitsOff: [] };
    const newStatus: Record<string, boolean> = {};

    units.forEach(u => {
        // If we previously had no state, or if we want to reset on new run:
        // Let's reset to recommended state on every new forecast run
        newStatus[u.name] = currentStatus.unitsOn.includes(u.name);
    });
    setManualStatus(newStatus);
  }, [unitCommitment, units]);

  const toggleUnit = (unitName: string) => {
      setManualStatus(prev => ({
          ...prev,
          [unitName]: !prev[unitName]
      }));
  };

  return (
    <div className="neo-card w-full h-full p-6 flex flex-col overflow-hidden">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Optimized Unit Commitment & Maintenance</h2>

      {/* Unit List with Toggles */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
          {units.map((unit) => {
              // Default to false if not yet set
              const isOn = manualStatus[unit.name] ?? false;

              return (
                <div key={unit.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded flex items-center justify-center text-slate-300 cursor-move">
                             :::
                        </div>
                        <span className={`text-sm font-bold transition-colors ${isOn ? 'text-slate-700' : 'text-slate-400'}`}>
                            {unit.name}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Interactive Neomorphic Toggle */}
                        <div
                            onClick={() => toggleUnit(unit.name)}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${isOn ? 'bg-blue-100' : 'bg-[#e6e9ef]' } neo-inset`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isOn ? 'translate-x-7 bg-blue-500' : 'translate-x-1 bg-slate-400'}`}></div>
                        </div>

                        <div className="w-8 h-8 rounded-full neo-card flex items-center justify-center text-slate-400 hover:text-blue-500 cursor-pointer active:scale-95 transition-transform">
                            <Zap className={`w-4 h-4 ${isOn ? 'fill-current' : ''}`} />
                        </div>
                        <div className="w-8 h-8 rounded-full neo-card flex items-center justify-center text-slate-400 hover:text-blue-500 cursor-pointer active:scale-95 transition-transform">
                            <Settings className="w-4 h-4" />
                        </div>
                    </div>
                </div>
              );
          })}
      </div>

      {/* Maintenance List at Bottom */}
      <div className="mt-auto border-t border-slate-200 pt-4">
           <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Optimal Maintenance Periods</h3>
           <div className="space-y-2">
               {maintenance && maintenance.length > 0 ? maintenance.slice(0, 3).map((m: any, i: number) => (
                   <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                       <span>{m.startTimestamp ? m.startTimestamp.split(' ')[0] : 'N/A'} - {m.endTimestamp ? m.endTimestamp.split(' ')[0] : 'N/A'}</span>
                   </div>
               )) : (
                   <div className="text-xs text-slate-400 italic">No immediate maintenance windows identified.</div>
               )}
           </div>
      </div>
    </div>
  );
}
