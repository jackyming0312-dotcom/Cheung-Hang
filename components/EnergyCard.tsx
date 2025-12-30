
import React from 'react';
import { Download, Share2, Sparkle } from 'lucide-react';
import { EnergyCardData, GeminiAnalysisResult } from '../types';

interface EnergyCardProps {
  data: EnergyCardData;
  analysis: GeminiAnalysisResult | null;
  moodLevel: number;
}

const EnergyCard: React.FC<EnergyCardProps> = ({ data, analysis, moodLevel }) => {
  if (!data) return null;

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
    <div className="flex flex-col items-center animate-soft-in w-full max-w-sm mx-auto">
      <div className={`
        relative w-full bg-gradient-to-br ${getGradient()} 
        p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] border-2
        flex flex-col items-center text-center transition-all duration-700
      `}>
        {/* Washi Tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 washi-tape opacity-80 z-20"></div>

        {/* AI Image with Polaroid Style */}
        <div className="relative z-10 w-full mb-6 mt-2">
            <div className="bg-white p-2.5 pb-8 shadow-lg border border-stone-100 transform rotate-[-1.5deg]">
                {data.imageUrl ? (
                    <img 
                        src={data.imageUrl} 
                        alt="AI Generated Mood" 
                        className="w-full aspect-square object-cover filter contrast-[1.02] brightness-[1.02] saturate-[0.9]" 
                    />
                ) : (
                    <div className="w-full aspect-square bg-stone-50 flex items-center justify-center text-4xl">
                        🧸
                    </div>
                )}
                <div className="mt-2 text-[8px] font-mono text-stone-300 tracking-widest text-left ml-1 italic uppercase">
                    Soul Hub // Cheung Hang Station // {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        </div>
        
        {/* Content Section */}
        <div className="relative z-10 w-full space-y-4">
          <div className="space-y-0.5">
            <p className="text-[8px] font-bold text-stone-300 tracking-[0.2em] uppercase">Today's Reflection</p>
            <h1 className={`text-3xl font-bold ${getAccentColor()} serif-font tracking-tight`}>
              {data.theme || "陪伴"}
            </h1>
          </div>
          
          <div className="relative px-2">
            <p className="text-stone-600 italic serif-font text-base leading-relaxed">
              "{data.quote || "我就在這裡陪伴著你。"}"
            </p>
          </div>

          <div className="pt-4 border-t border-dashed border-stone-100 flex flex-col items-center gap-1.5">
             <span className="text-[8px] font-bold text-stone-300 tracking-widest uppercase">Lucky Charm</span>
             <span className="px-3 py-1 bg-white/60 rounded-full text-stone-600 font-bold text-xs shadow-sm border border-white">
                ✨ {data.luckyItem || "暖心的微笑"}
             </span>
          </div>
        </div>
      </div>
      
      {analysis?.replyMessage && (
        <div className="mt-6 max-w-[260px] w-full relative bg-[#fffef0] p-4 shadow-lg rotate-[1deg] border-l-4 border-amber-200 animate-soft-in">
           <p className="text-stone-600 font-handwriting leading-relaxed text-sm">
               <span className="font-bold text-stone-800 text-base">🧸 長亨大熊筆記：</span><br/>
               {analysis.replyMessage}
           </p>
        </div>
      )}
    </div>
  );
};

export default EnergyCard;
