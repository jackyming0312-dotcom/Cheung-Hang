
import React, { useMemo } from 'react';
import { Sparkle, Compass, Heart, Wind, Quote, Coffee, Flower, Sun, PenTool } from 'lucide-react';
import { EnergyCardData, GeminiAnalysisResult } from '../types';

interface EnergyCardProps {
  data: EnergyCardData;
  analysis: GeminiAnalysisResult | null;
  moodLevel: number;
}

const NOTE_THEMES = [
  { bg: 'bg-[#fff9e6]', border: 'border-amber-200', text: 'text-amber-900', accent: 'bg-amber-400' },
  { bg: 'bg-[#f0fff4]', border: 'border-emerald-200', text: 'text-emerald-900', accent: 'bg-emerald-400' },
  { bg: 'bg-[#f5f3ff]', border: 'border-indigo-200', text: 'text-indigo-900', accent: 'bg-indigo-400' },
  { bg: 'bg-[#fff5f5]', border: 'border-rose-200', text: 'text-rose-900', accent: 'bg-rose-400' },
];

const EnergyCard: React.FC<EnergyCardProps> = ({ data, analysis }) => {
  if (!data) return null;

  const theme = useMemo(() => NOTE_THEMES[Math.floor(Math.random() * NOTE_THEMES.length)], []);

  const getThemeStyles = () => {
    switch(data.category) {
      case '生活態度':
        return {
          gradient: "from-[#fffbf0] to-[#fff5e6]",
          accent: "text-amber-600",
          border: "border-amber-100/50",
          bgTag: "bg-amber-50",
          icon: <Compass size={14} />,
          illustration: <Sun size={48} className="text-amber-200" />,
          label: "Life Attitude"
        };
      case '情緒共處':
        return {
          gradient: "from-[#fffafc] to-[#f7eef2]",
          accent: "text-rose-600",
          border: "border-rose-100/50",
          bgTag: "bg-rose-50",
          icon: <Heart size={14} />,
          illustration: <Flower size={48} className="text-rose-200" />,
          label: "Emotional Peace"
        };
      case '放鬆練習':
        return {
          gradient: "from-[#f5fafb] to-[#e6f2f3]",
          accent: "text-cyan-700",
          border: "border-cyan-100/50",
          bgTag: "bg-cyan-50",
          icon: <Wind size={14} />,
          illustration: <Coffee size={48} className="text-cyan-200" />,
          label: "Daily Ritual"
        };
      default:
        return {
          gradient: "from-white to-stone-50",
          accent: "text-stone-600",
          border: "border-stone-100",
          bgTag: "bg-stone-50",
          icon: <Sparkle size={14} />,
          illustration: <Sparkle size={48} className="text-stone-200" />,
          label: "Soul Gift"
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto animate-soft-in">
      <div className={`
        relative w-full bg-gradient-to-br ${styles.gradient} 
        p-8 md:p-10 rounded-[2.5rem] shadow-2xl border-2 ${styles.border}
        flex flex-col items-center text-center transition-all duration-700
      `}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 washi-tape opacity-60 z-20"></div>

        <div className={`absolute top-6 right-6 px-4 py-1.5 ${styles.bgTag} backdrop-blur-md rounded-full border border-white/50 shadow-sm flex items-center gap-2 z-30`}>
            <span className={styles.accent}>{styles.icon}</span>
            <span className={`text-[10px] font-black ${styles.accent} tracking-widest uppercase`}>{data.category || 'RECOVERY'}</span>
        </div>

        <div className="relative z-10 w-full space-y-8 mt-4">
          <div className="flex flex-col items-center gap-4">
             <div className="p-6 bg-white rounded-full shadow-inner-lg">
                {styles.illustration}
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-black text-stone-300 tracking-[0.4em] uppercase">Today's Theme</p>
                <h1 className={`text-3xl md:text-4xl font-bold ${styles.accent} serif-font tracking-tight`}>
                  {data.theme}
                </h1>
             </div>
          </div>
          
          <div className="min-h-[5rem] flex flex-col items-center justify-center relative px-4">
            <Quote className="absolute -top-4 -left-2 text-stone-100/50" size={48} />
            <p className="text-stone-700 serif-font text-xl md:text-2xl leading-relaxed italic relative z-10">
              {data.quote}
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-dashed border-stone-200">
             <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase flex items-center gap-2">
                   <Coffee size={12} /> 亨仔推薦：放鬆練習
                </span>
                <p className="text-sm text-stone-500 leading-relaxed max-w-[240px] italic">
                   {data.relaxationMethod}
                </p>
             </div>

             <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase">今日療癒守護者</span>
                <div className={`px-6 py-2.5 ${styles.bgTag} rounded-full text-stone-800 font-bold text-sm border-2 border-white shadow-sm flex items-center gap-2 transition-all`}>
                    <span className="animate-bounce">✨</span> {data.luckyItem}
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {analysis?.replyMessage && (
        <div className={`
          mt-10 max-w-[320px] w-full relative ${theme.bg} p-8 shadow-2xl ${theme.border} border-l-8 
          transform -rotate-1 hover:rotate-0 transition-all duration-500 animate-soft-in
          before:content-[''] before:absolute before:-top-4 before:left-1/2 before:-translate-x-1/2 before:w-16 before:h-6 before:bg-white/40 before:washi-tape
        `}>
           <div className={`absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center ${theme.text} shadow-lg border border-stone-100`}>
              <PenTool size={16} />
           </div>
           
           <div className="flex flex-col gap-3">
              <span className={`text-[10px] font-black ${theme.text} opacity-30 uppercase tracking-[0.3em]`}>Bear's Healing Note</span>
              <p className={`text-[1.1rem] leading-relaxed handwriting-font ${theme.text} font-bold`}>
                 {analysis.replyMessage}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-2 pt-4 border-t border-stone-900/5">
                 {analysis.tags?.map((t, idx) => (
                    <span key={idx} className={`text-[10px] font-bold opacity-60 ${theme.text} bg-white/50 px-2 py-0.5 rounded`}>
                       {t.startsWith('#') ? t : `#${t}`}
                    </span>
                 ))}
              </div>
           </div>
           
           {/* Decorative Stamp */}
           <div className="absolute bottom-4 right-4 opacity-10 rotate-12">
              <Sparkle size={40} fill="currentColor" />
           </div>
        </div>
      )}
    </div>
  );
};

export default EnergyCard;
