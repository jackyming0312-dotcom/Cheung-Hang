
import React from 'react';
import { Sparkle, Compass, Heart, Wind, Quote, Palette } from 'lucide-react';
import { EnergyCardData, GeminiAnalysisResult } from '../types';

interface EnergyCardProps {
  data: EnergyCardData;
  analysis: GeminiAnalysisResult | null;
  moodLevel: number;
  isImageLoading?: boolean;
}

const EnergyCard: React.FC<EnergyCardProps> = ({ data, analysis, moodLevel, isImageLoading = false }) => {
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
          label: "Life Attitude"
        };
      case '情緒共處':
        return {
          gradient: "from-[#fffafc] to-[#f7eef2]",
          accent: "text-rose-600",
          border: "border-rose-100/50",
          bgTag: "bg-rose-50",
          icon: <Heart size={14} />,
          label: "Emotional Peace"
        };
      case '放鬆練習':
        return {
          gradient: "from-[#f5fafb] to-[#e6f2f3]",
          accent: "text-cyan-700",
          border: "border-cyan-100/50",
          bgTag: "bg-cyan-50",
          icon: <Wind size={14} />,
          label: "Daily Ritual"
        };
      default:
        return {
          gradient: "from-white to-stone-50",
          accent: "text-stone-600",
          border: "border-stone-100",
          bgTag: "bg-stone-50",
          icon: <Sparkle size={14} />,
          label: "Cheung Hang"
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto animate-soft-in">
      <div className={`
        relative w-full bg-gradient-to-br ${styles.gradient} 
        p-6 md:p-8 rounded-[2.2rem] shadow-2xl border-2 ${styles.border}
        flex flex-col items-center text-center transition-all duration-700
      `}>
        {/* 紙膠帶 */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 washi-tape opacity-60 z-20"></div>

        {/* 分類標籤 */}
        <div className={`absolute top-6 right-6 px-4 py-1.5 ${styles.bgTag} backdrop-blur-md rounded-full border border-white/50 shadow-sm flex items-center gap-2 z-30`}>
            <span className={styles.accent}>{styles.icon}</span>
            <span className={`text-[10px] font-black ${styles.accent} tracking-widest uppercase`}>{data.category || 'RECOVERY'}</span>
        </div>

        {/* 插畫框優化 */}
        <div className="relative z-10 w-full mb-8 mt-6 px-2">
            <div className="bg-white p-3 pb-14 shadow-xl border border-stone-50 transform rotate-[1deg] transition-all hover:rotate-0 overflow-hidden">
                {isImageLoading ? (
                    <div className="w-full aspect-square bg-stone-50 flex flex-col items-center justify-center gap-3 animate-pulse">
                        <Palette className="text-stone-200 animate-bounce" size={32} />
                        <span className="text-[10px] text-stone-300 font-bold tracking-widest uppercase">大熊正在為你作畫...</span>
                    </div>
                ) : data.imageUrl ? (
                    <img 
                        src={data.imageUrl} 
                        alt="Healing Illustration" 
                        className="w-full aspect-square object-cover animate-soft-in" 
                    />
                ) : (
                    <div className="w-full aspect-square bg-stone-50 flex items-center justify-center text-5xl grayscale opacity-30">
                        🧸
                    </div>
                )}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-40">
                    <span className="text-[8px] font-mono tracking-widest uppercase">{styles.label}</span>
                    <span className="text-[8px] font-mono">CH_STATION_2025</span>
                </div>
            </div>
        </div>
        
        {/* 文字內容 */}
        <div className="relative z-10 w-full space-y-6 px-4">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
                <div className="h-[1px] w-4 bg-stone-200"></div>
                <p className="text-[9px] font-black text-stone-300 tracking-[0.4em] uppercase">Bear's Wisdom</p>
                <div className="h-[1px] w-4 bg-stone-200"></div>
            </div>
            <h1 className={`text-3xl font-bold ${styles.accent} serif-font tracking-tight`}>
              {data.theme}
            </h1>
          </div>
          
          <div className="min-h-[4rem] flex flex-col items-center justify-center relative px-6">
            <Quote className="absolute -top-2 -left-2 text-stone-100" size={32} />
            <p className="text-stone-700 serif-font text-lg md:text-xl leading-relaxed italic relative z-10">
              {data.quote}
            </p>
          </div>

          <div className="pt-6 border-t border-dashed border-stone-200 flex flex-col items-center gap-3">
             <span className="text-[9px] font-bold text-stone-400 tracking-widest uppercase">今日療癒守護者</span>
             <div className={`px-5 py-2 ${styles.bgTag} rounded-full text-stone-800 font-bold text-sm border-2 border-white shadow-sm flex items-center gap-2 transition-all`}>
                <span className="animate-bounce">✨</span> {data.luckyItem}
             </div>
          </div>
        </div>
      </div>
      
      {/* 悄悄話卡片 */}
      {analysis?.replyMessage && (
        <div className="mt-8 max-w-[300px] w-full relative bg-[#fffdf5] p-6 shadow-xl border-l-4 border-amber-300 transform -rotate-1 animate-soft-in">
           <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 shadow-sm">
              <Quote size={14} />
           </div>
           <p className="text-stone-600 font-handwriting leading-relaxed text-base">
               <span className="font-bold text-stone-800 text-lg border-b-2 border-amber-200 mb-2 inline-block">大熊悄悄話：</span><br/>
               {analysis.replyMessage}
           </p>
        </div>
      )}
    </div>
  );
};

export default EnergyCard;
