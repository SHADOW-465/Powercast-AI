interface MaintenanceProps {
  maintenance: any[];
}

export default function MaintenancePanel({ maintenance }: MaintenanceProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
       <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Maintenance Planning</h3>

       {maintenance.length === 0 ? (
           <div className="text-slate-500 text-center py-8 italic text-sm">
               No low-load periods identified for maintenance in the forecast horizon.
           </div>
       ) : (
           <div className="space-y-4">
               {maintenance.map((m, idx) => (
                   <div key={idx} className="bg-yellow-50 dark:bg-amber-950/20 border border-yellow-200 dark:border-amber-500/20 p-4 rounded-lg">
                       <div className="flex justify-between items-start">
                           <div>
                               <div className="text-yellow-700 dark:text-amber-400 font-bold mb-1">Low Load Window Detected</div>
                               <div className="text-sm text-slate-600 dark:text-slate-300">
                                   From: <span className="font-semibold text-slate-900 dark:text-white">{m.startTimestamp}</span>
                               </div>
                               <div className="text-sm text-slate-600 dark:text-slate-300">
                                   To: <span className="font-semibold text-slate-900 dark:text-white">{m.endTimestamp}</span>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className="text-xs text-slate-500 uppercase font-semibold">Avg Load</div>
                               <div className="text-xl font-bold text-yellow-600 dark:text-amber-200">{m.avgLoad.toFixed(1)} MW</div>
                           </div>
                       </div>
                       <div className="mt-2 text-xs text-yellow-600/80 dark:text-amber-500/70 border-t border-yellow-200 dark:border-amber-500/20 pt-2 font-medium">
                           {m.reason}
                       </div>
                   </div>
               ))}
           </div>
       )}
    </div>
  );
}
