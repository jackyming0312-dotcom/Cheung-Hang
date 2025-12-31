
import React from 'react';
import { Sparkle, Compass, Heart, Wind } from 'lucide-react';
import { EnergyCardData, GeminiAnalysisResult } from '../types';

interface EnergyCardProps {
  data: EnergyCardData;
  analysis: GeminiAnalysisResult | null;
  moodLevel: number;
}

const EnergyCard: React.FC<EnergyCardProps> = ({ data, analysis, moodLevel }) => {
  if (!data) return null;

  const getGradient = () => {
    if (moodLevel > 70) return "from-[#fffdf7] to-[#fffaf2]"; 
    if (moodLevel > 40) return "from-[#fafbfc] to-[#f7f9fa]";
    return "from-[#ffffff] to-[#fafafa]"; 
  };

  const getAccentColor = () => {
      if (moodLevel > 70) return "text-amber-600";
      if (moodLevel > 40) return "text-slate-600";
      return "text-stone-600";
  };

  const getCategoryIcon = () => {
      switch(data.category) {
          case '生活態度': return <Compass size={12} />;
          case '情緒共處': return <Heart size={12} />;
          case '放鬆練習': return <Wind size={12} />;
          default: return <Sparkle size={12} />;
      }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto animate-soft-in">
      <div className={`
        relative w-full bg-gradient-to-br ${getGradient()} 
        p-6 md:p-8 rounded-[2rem] shadow-xl border border-stone-100
        flex flex-col items-center text-center transition-all duration-1000
      `}>
        {/* Washi Tape - 保持水平 */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-5 washi-tape opacity-50 z-20"></div>

        {/* 分類標籤 */}
        {data.category && (
            <div className="absolute top-6 right-6 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full border border-stone-100 shadow-sm flex items-center gap-1.5 z-30">
                <span className={getAccentColor()}>{getCategoryIcon()}</span>
                <span className="text-[9px] font-bold text-stone-500 tracking-wider uppercase">{data.category}</span>
            </div>
        )}

        {/* 靜態相片框 */}
        <div className="relative z-10 w-full mb-6 mt-4">
            <div className="bg-white p-3 pb-12 shadow-md border border-stone-50">
                {data.imageUrl ? (
                    <img 
                        src={data.imageUrl} 
                        alt="Healing Illustration" 
                        className="w-full aspect-square object-cover filter brightness-[1.01]" 
                    />
                ) : (
                    <div className="w-full aspect-square bg-stone-50 flex items-center justify-center text-4xl">
                        🧸
                    </div>
                )}
                <div className="mt-4 text-[7px] font-mono text-stone-300 tracking-[0.2em] text-left ml-1 uppercase">
                    STATION RECORD // {data.category || 'RECOVERY'}
                </div>
            </div>
        </div>
        
        {/* 文字內容 */}
        <div className="relative z-10 w-full space-y-5 px-2">
          <div className="space-y-1">
            <p className="text-[8px] font-bold text-stone-300 tracking-[0.3em] uppercase">Bear's Wisdom</p>
            <h1 className={`text-2xl font-bold ${getAccentColor()} serif-font`}>
              {data.theme}
            </h1>
          </div>
          
          <div className="min-h-[3rem] flex items-center justify-center">
            <p className="text-stone-600 serif-font text-base leading-relaxed italic">
              "{data.quote}"
            </p>
          </div>

          <div className="pt-5 border-t border-dashed border-stone-100 flex flex-col items-center gap-2">
             <span className="text-[8px] font-bold text-stone-300 tracking-widest uppercase">Lucky Guardian</span>
             <span className="px-4 py-1.5 bg-white/80 rounded-full text-stone-600 font-bold text-xs border border-white/50">
                ✨ {data.luckyItem}
             </span>
          </div>
        </div>
      </div>
      
      {/* 靜態悄悄話 */}
      {analysis?.replyMessage && (
        <div className="mt-8 max-w-[280px] w-full relative bg-[#fffef7] p-5 shadow-lg border-l-4 border-amber-200">
           <p className="text-stone-600 font-handwriting leading-relaxed text-sm">
               <span className="font-bold text-stone-800 text-base">🧸 大熊悄悄話：</span><br/>
               {analysis.replyMessage}
           </p>
        </div>
      )}
    </div>
  );
};

export default EnergyCard;
