import React from 'react';
import { Download, Share2, Sparkle } from 'lucide-react';
import { EnergyCardData, GeminiAnalysisResult } from '../types';

interface EnergyCardProps {
  data: EnergyCardData;
  analysis: GeminiAnalysisResult | null;
  moodLevel: number;
}

const EnergyCard: React.FC<EnergyCardProps> = ({ data, analysis, moodLevel }) => {
  
  const getGradient = () => {
    if (moodLevel > 70) return "from-[#fffcf0] to-[#fff4e0] border-amber-100"; 
    if (moodLevel > 40) return "from-[#f8fafc] to-[#f1f5f9] border-slate-100";
    return "from-[#fcfcfc] to-[#f5f5f5] border-stone-100"; 
  };

  const getAccentColor = () => {
      if (moodLevel > 70) return "text-amber-600";
      if (moodLevel > 40) return "text-slate-600";
      return "text-stone-600";
  }

  return (
    <div className="flex flex-col items-center animate-soft-in w-full py-4">
      <div className={`
        relative w-full max-w-sm bg-gradient-to-br ${getGradient()} 
        p-10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border-4
        flex flex-col items-center text-center group transition-transform duration-700 hover:rotate-1
      `}>
        {/* Washi Tape */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-8 washi-tape opacity-80 z-20"></div>

        {/* Header Label */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full px-10 flex justify-between items-center opacity-30">
          <Sparkle size={12} />
          <div className="h-[1px] flex-1 bg-stone-400 mx-4"></div>
          <Sparkle size={12} />
        </div>

        {/* AI Image with Polaroid Style */}
        <div className="relative z-10 w-full mb-8 mt-4">
            <div className="bg-white p-3 pb-10 shadow-xl border border-stone-100 transform rotate-[-2deg] transition-all duration-700 group-hover:rotate-0">
                {data.imageUrl ? (
                    <img 
                        src={data.imageUrl} 
                        alt="AI Generated Mood" 
                        className="w-full aspect-square object-cover filter contrast-[1.05] brightness-[1.05] saturate-[0.9]" 
                    />
                ) : (
                    <div className="w-full aspect-square bg-stone-50 flex items-center justify-center text-5xl">
                        🎨
                    </div>
                )}
                <div className="mt-3 text-[10px] font-mono text-stone-300 tracking-widest text-left ml-1 italic uppercase">
                    Captured By Soul AI // {new Date().toLocaleTimeString()}
                </div>
            </div>
        </div>
        
        {/* Content Section */}
        <div className="relative z-10 w-full space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-stone-300 tracking-[0.3em] uppercase">Today's Reflection</p>
            <h1 className={`text-4xl font-bold ${getAccentColor()} serif-font tracking-tight`}>
              {data.theme}
            </h1>
          </div>
          
          <div className="relative px-4">
            <p className="text-stone-700 italic serif-font text-xl leading-relaxed">
              {data.quote}
            </p>
          </div>

          <div className="pt-6 border-t border-dashed border-stone-200 flex flex-col items-center gap-2">
             <span className="text-[9px] font-bold text-stone-300 tracking-widest uppercase">Lucky Charm</span>
             <span className="px-4 py-1.5 bg-white/50 rounded-full text-stone-600 font-bold text-sm shadow-sm border border-white">
                ✨ {data.luckyItem}
             </span>
          </div>
        </div>
      </div>
      
      {/* Sticky Note Feedback */}
      {analysis?.replyMessage && (
        <div className="mt-10 max-w-[280px] w-full relative bg-[#fffdf0] p-6 shadow-xl rotate-[1.5deg] transform transition-all duration-500 hover:rotate-0 hover:scale-105 border-l-4 border-yellow-200">
           <p className="text-stone-600 font-handwriting leading-relaxed">
               <span className="font-bold text-stone-800 text-lg">水豚君筆記：</span><br/>
               {analysis.replyMessage}
           </p>
        </div>
      )}
    </div>
  );
};

export default EnergyCard;