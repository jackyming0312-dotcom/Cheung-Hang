
import React, { useMemo } from 'react';
import { Sparkle, Compass, Heart, Wind, Quote, Coffee, Sun, PenTool, Stars, Cloud, Leaf, Image as ImageIcon } from 'lucide-react';
import { EnergyCardData, GeminiAnalysisResult } from '../types';

interface EnergyCardProps {
  data: EnergyCardData;
  analysis: GeminiAnalysisResult | null;
  moodLevel: number;
}

const STYLE_CONFIGS = {
  warm: { bg: 'bg-[#fff9e6]', border: 'border-amber-200', text: 'text-amber-900', accent: 'bg-amber-400', icon: <Sun size={48} className="text-amber-200" /> },
  fresh: { bg: 'bg-[#f0fff4]', border: 'border-emerald-200', text: 'text-emerald-900', accent: 'bg-emerald-400', icon: <Leaf size={48} className="text-emerald-200" /> },
  calm: { bg: 'bg-[#f5f3ff]', border: 'border-indigo-200', text: 'text-indigo-900', accent: 'bg-indigo-400', icon: <Cloud size={48} className="text-indigo-200" /> },
  energetic: { bg: 'bg-[#fff5f5]', border: 'border-rose-200', text: 'text-rose-900', accent: 'bg-rose-400', icon: <Stars size={48} className="text-rose-200" /> },
  dreamy: { bg: 'bg-[#f0f9ff]', border: 'border-blue-200', text: 'text-blue-900', accent: 'bg-blue-400', icon: <Sparkle size={48} className="text-blue-200" /> },
};

const EnergyCard: React.FC<EnergyCardProps> = ({ data, analysis }) => {
  if (!data) return null;

  const style = useMemo(() => {
    return STYLE_CONFIGS[data.styleHint as keyof typeof STYLE_CONFIGS] || STYLE_CONFIGS.warm;
  }, [data.styleHint]);

  const getCategoryStyles = () => {
    switch(data.category) {
      case '生活態度': return { icon: <Compass size={14} />, label: "Life Attitude", color: "text-amber-600", bgTag: "bg-amber-50" };
      case '情緒共處': return { icon: <Heart size={14} />, label: "Emotional Peace", color: "text-rose-600", bgTag: "bg-rose-50" };
      case '放鬆練習': return { icon: <Wind size={14} />, label: "Daily Ritual", color: "text-cyan-700", bgTag: "bg-cyan-50" };
      default: return { icon: <Sparkle size={14} />, label: "Soul Gift", color: "text-stone-600", bgTag: "bg-stone-50" };
    }
  };

  const cat = getCategoryStyles();

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto animate-soft-in">
      <div className={`
        relative w-full ${style.bg} 
        p-6 md:p-8 rounded-[2.5rem] shadow-2xl border-2 ${style.border}
        flex flex-col items-center text-center transition-all duration-700
      `}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 washi-tape opacity-60 z-20"></div>

        <div className={`absolute top-4 right-4 px-3 py-1 ${cat.bgTag} backdrop-blur-md rounded-full border border-white/50 shadow-sm flex items-center gap-2 z-30`}>
            <span className={cat.color}>{cat.icon}</span>
            <span className={`text-[9px] font-black ${cat.color} tracking-widest uppercase`}>{data.category || 'RECOVERY'}</span>
        </div>

        <div className="relative z-10 w-full space-y-6 mt-4">
          <div className="flex flex-col items-center gap-4">
             {data.imageUrl ? (
               <div className="w-full aspect-square rounded-[2rem] overflow-hidden shadow-lg border-4 border-white relative group">
                  <img src={data.imageUrl} alt="Hung Jai Illustration" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-md p-1.5 rounded-lg">
                    <ImageIcon size={14} className="text-stone-400" />
                  </div>
               </div>
             ) : (
               <div className="p-6 bg-white/80 rounded-full shadow-inner-lg">
                  {style.icon}
               </div>
             )}
             
             <div className="space-y-1">
                <p className="text-[9px] font-black text-stone-300 tracking-[0.4em] uppercase">Healing Theme</p>
                <h1 className={`text-2xl md:text-3xl font-bold ${style.text} serif-font tracking-tight`}>
                  {data.theme}
                </h1>
             </div>
          </div>
          
          <div className="min-h-[4rem] flex flex-col items-center justify-center relative px-2">
            <Quote className="absolute -top-2 -left-2 text-stone-100/50" size={32} />
            <p className="text-stone-700 serif-font text-lg md:text-xl leading-relaxed italic relative z-10">
              {data.quote}
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-dashed border-stone-200">
             <div className="flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-bold text-stone-400 tracking-widest uppercase flex items-center gap-1.5">
                   <Coffee size={10} /> 亨仔推薦練習
                </span>
                <p className="text-xs text-stone-500 leading-relaxed max-w-[260px] italic">
                   {data.relaxationMethod}
                </p>
             </div>

             <div className="flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-bold text-stone-400 tracking-widest uppercase">今日療癒守護者</span>
                <div className={`px-5 py-2 ${cat.bgTag} rounded-full text-stone-800 font-bold text-xs border-2 border-white shadow-sm flex items-center gap-2`}>
                    <span className="animate-bounce">✨</span> {data.luckyItem}
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {analysis?.replyMessage && (
        <div className={`
          mt-8 max-w-[320px] w-full relative ${style.bg} p-6 shadow-2xl ${style.border} border-l-8 
          transform -rotate-1 hover:rotate-0 transition-all duration-500 animate-soft-in
          before:content-[''] before:absolute before:-top-4 before:left-1/2 before:-translate-x-1/2 before:w-16 before:h-6 before:bg-white/40 before:washi-tape
        `}>
           <div className={`absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center ${style.text} shadow-lg border border-stone-100`}>
              <PenTool size={14} />
           </div>
           
           <div className="flex flex-col gap-2">
              <span className={`text-[9px] font-black ${style.text} opacity-30 uppercase tracking-[0.3em]`}>Bear's Healing Note</span>
              <p className={`text-[1rem] leading-relaxed handwriting-font ${style.text} font-bold`}>
                 {analysis.replyMessage}
              </p>
              
              <div className="flex flex-wrap gap-1.5 mt-1 pt-3 border-t border-stone-900/5">
                 {analysis.tags?.map((t, idx) => (
                    <span key={idx} className={`text-[9px] font-bold opacity-60 ${style.text} bg-white/50 px-1.5 py-0.5 rounded`}>
                       {t.startsWith('#') ? t : `#${t}`}
                    </span>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EnergyCard;
