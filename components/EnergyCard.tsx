
import React from 'react';
import { Sparkle, Compass, Heart, Wind, Quote, Coffee, Flower, Sun } from 'lucide-react';
import { EnergyCardData, GeminiAnalysisResult } from '../types';

interface EnergyCardProps {
  data: EnergyCardData;
  analysis: GeminiAnalysisResult | null;
  moodLevel: number;
}

const EnergyCard: React.FC<EnergyCardProps> = ({ data, analysis }) => {
  if (!data) return null;

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
        <div className="mt-8 max-w-[320px] w-full relative bg-[#fffdf5] p-6 shadow-xl border-l-4 border-amber-300 transform -rotate-1 animate-soft-in">
           <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 shadow-sm">
              <Quote size={14} />
           </div>
           <p className="text-stone-600 font-handwriting leading-relaxed text-base">
               <span className="font-bold text-stone-800 text-lg border-b-2 border-amber-200 mb-2 inline-block">亨仔悄悄話：</span><br/>
               {analysis.replyMessage}
           </p>
        </div>
      )}
    </div>
  );
};

export default EnergyCard;
