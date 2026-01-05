import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface FuturePlanningProps {
  expansion: {
    timeframe: string;
    capacityNeededMW: number;
    reasoning: string;
  } | null;
}

export default function FuturePlanning({ expansion }: FuturePlanningProps) {
  if (!expansion) {
    return (
        <div className="neo-card w-full h-full p-6 flex flex-col">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Future Expansion Planning</h2>
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                <TrendingUp className="w-10 h-10 mb-3 text-slate-400" />
                <p className="text-sm font-medium text-slate-500">Awaiting Analysis</p>
            </div>
        </div>
    );
  }

  return (
    <div className="neo-card w-full h-full p-6 flex flex-col">
       <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
           <TrendingUp className="w-4 h-4 text-blue-500" />
           Future Expansion Analysis
       </h2>

       <div className="flex-1 flex flex-col gap-6">
           {/* Timeline Card */}
           <div className="flex items-start gap-4 p-4 neo-inset rounded-xl">
               <div className="w-10 h-10 rounded-full neo-card flex items-center justify-center text-blue-500 shrink-0">
                   <Calendar className="w-5 h-5" />
               </div>
               <div>
                   <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Estimated Timeframe</h3>
                   <div className="text-lg font-bold text-slate-700">{expansion.timeframe}</div>
               </div>
           </div>

           {/* Capacity Card */}
           <div className="flex items-start gap-4 p-4 neo-inset rounded-xl">
               <div className="w-10 h-10 rounded-full neo-card flex items-center justify-center text-orange-500 shrink-0">
                   <AlertCircle className="w-5 h-5" />
               </div>
               <div>
                   <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Additional Capacity Required</h3>
                   <div className="text-lg font-bold text-slate-700">
                       {expansion.capacityNeededMW > 0 ? `+${expansion.capacityNeededMW} MW` : 'No Immediate Need'}
                   </div>
               </div>
           </div>

           {/* Reasoning */}
           <div className="mt-auto">
               <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Strategic Reasoning</h3>
               <p className="text-xs text-slate-600 leading-relaxed italic bg-[#F0F2F5] p-3 rounded-lg border border-slate-200">
                   "{expansion.reasoning}"
               </p>
           </div>
       </div>
    </div>
  );
}
