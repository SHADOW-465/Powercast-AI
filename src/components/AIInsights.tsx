import { Send, MoreHorizontal, Sparkles } from 'lucide-react';

interface AIInsightsProps {
  analysis: string;
  recommendations: string;
}

export default function AIInsights({ analysis, recommendations }: AIInsightsProps) {
  return (
    <div className="neo-card w-full h-full p-6 flex flex-col relative">
       {/* Header */}
       <div className="flex justify-between items-start mb-4">
           <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Insights & Reasoning</h2>
           <div className="flex gap-2 text-slate-400">
               <div className="cursor-pointer hover:text-slate-600"><span className="text-lg leading-none">💬</span></div>
               <MoreHorizontal className="w-5 h-5 cursor-pointer hover:text-slate-600" />
           </div>
       </div>

       {/* Content Area - Chat Style */}
       <div className="flex-1 overflow-y-auto pr-2">
           <div className="flex gap-4">
               {/* Gemini Logo / AI Avatar */}
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center shadow-lg shrink-0 text-white">
                   <Sparkles className="w-5 h-5" />
               </div>

               <div className="space-y-4">
                   <div>
                       <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400">Gemini</span>
                       <p className="text-sm text-slate-600 leading-relaxed mt-1">
                           {analysis || "Gemini is analyzing historical load patterns and optimization constraints to provide actionable insights."}
                       </p>
                   </div>

                   {recommendations && (
                       <ul className="list-disc pl-4 space-y-1 text-sm text-slate-600">
                           {/* Split recommendations by sentence or just display */}
                           {recommendations.split('. ').map((rec, i) => (
                               rec.length > 5 && <li key={i}>{rec.replace('.', '')}</li>
                           ))}
                       </ul>
                   )}
               </div>
           </div>
       </div>

       {/* Input Area (Bottom) */}
       <div className="mt-4 relative">
           <input
              type="text"
              placeholder="Type your message..."
              className="w-full h-12 rounded-full neo-inset px-6 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-blue-200/50"
              disabled
           />
           <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
                <button className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors">
                    <Send className="w-4 h-4 ml-0.5" />
                </button>
           </div>
       </div>
    </div>
  );
}
