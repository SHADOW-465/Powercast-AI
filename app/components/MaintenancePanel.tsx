interface MaintenanceProps {
  maintenance: any[];
}

export default function MaintenancePanel({ maintenance }: MaintenanceProps) {
  return (
    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
       <h3 className="text-lg font-semibold text-slate-200 mb-4">Maintenance Recommendations</h3>

       {maintenance.length === 0 ? (
           <div className="text-slate-500 text-center py-8 italic">
               No low-load periods identified for maintenance in the forecast horizon.
           </div>
       ) : (
           <div className="space-y-4">
               {maintenance.map((m, idx) => (
                   <div key={idx} className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                       <div className="flex justify-between items-start">
                           <div>
                               <div className="text-amber-400 font-medium mb-1">Low Load Window Detected</div>
                               <div className="text-sm text-slate-300">
                                   From: <span className="text-white">{m.startTimestamp}</span>
                               </div>
                               <div className="text-sm text-slate-300">
                                   To: <span className="text-white">{m.endTimestamp}</span>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className="text-xs text-slate-500 uppercase">Avg Load</div>
                               <div className="text-xl font-bold text-amber-200">{m.avgLoad.toFixed(1)} MW</div>
                           </div>
                       </div>
                       <div className="mt-2 text-xs text-amber-500/70 border-t border-amber-500/20 pt-2">
                           {m.reason}
                       </div>
                   </div>
               ))}
           </div>
       )}
    </div>
  );
}
