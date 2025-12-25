import React from 'react';
import { Download, Share2 } from 'lucide-react';
import { EnergyCardData, GeminiAnalysisResult } from '../types';

interface EnergyCardProps {
  data: EnergyCardData;
  analysis: GeminiAnalysisResult | null;
  moodLevel: number;
}

const EnergyCard: React.FC<EnergyCardProps> = ({ data, analysis, moodLevel }) => {
  
  const getGradient = () => {
    // Warm, paper-like, sunset gradients
    if (moodLevel > 70) return "from-[#fff1eb] to-[#ace0f9] border-stone-200"; // Warm light to sky
    if (moodLevel > 40) return "from-[#fdfbfb] to-[#ebedee] border-stone-200"; // Clean paper
    return "from-[#e6e9f0] to-[#eef1f5] border-stone-200"; // Soft gray
  };

  const getAccentColor = () => {
      if (moodLevel > 70) return "text-orange-600";
      if (moodLevel > 40) return "text-emerald-700";
      return "text-indigo-600";
  }

  const getIcon = () => {
    if (moodLevel > 70) return '🌞';
    if (moodLevel > 40) return '🌱';
    return '🌙';
  }

  return (
    <div className="flex flex-col items-center animate-fade-in w-full">
      <div className={`
        relative w-full max-w-sm bg-gradient-to-br ${getGradient()} 
        p-8 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border
        flex flex-col items-center text-center
      `}>
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-40 rounded-xl pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

        {/* Header */}
        <div className="relative z-10 w-full flex justify-between items-center mb-6 border-b border-stone-300 pb-4">
          <span className="font-bold text-stone-600 tracking-widest text-xs uppercase">Soul Station</span>
          <span className="text-stone-400 text-xs font-mono">{new Date().toLocaleDateString('zh-TW')}</span>
        </div>

        {/* AI Generated Image (If available) */}
        {data.imageUrl && (
            <div className="relative z-10 w-48 h-48 mb-6 p-2 bg-white shadow-md transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                <img src={data.imageUrl} alt="AI Generated Mood" className="w-full h-full object-cover filter sepia-[0.2]" />
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
        )}
        
        {/* Fallback Icon if image fails or loading */}
        {!data.imageUrl && (
            <div className="relative z-10 w-16 h-16 bg-white/80 rounded-full mx-auto flex items-center justify-center text-3xl shadow-sm ring-4 ring-white/50 mb-6">
                {getIcon()}
            </div>
        )}

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center gap-6 mb-6">
          <div>
            <h2 className="text-sm font-bold text-stone-400 tracking-widest uppercase mb-2">Keyword of the Day</h2>
            <h1 className={`text-4xl font-bold ${getAccentColor()} serif-font tracking-tight`}>
              {data.theme}
            </h1>
          </div>
          
          <div className="relative">
            <span className="absolute -top-4 -left-2 text-6xl text-stone-200 font-serif leading-none">“</span>
            <p className="relative z-10 text-stone-700 italic serif-font text-xl leading-relaxed px-4">
              {data.quote}
            </p>
            <span className="absolute -bottom-8 -right-2 text-6xl text-stone-200 font-serif leading-none">”</span>
          </div>

          <div className="mt-4 pt-6 border-t border-stone-200 flex justify-center items-center gap-2 text-sm text-stone-600">
             <span>✨ 幸運物：</span>
             <span className="font-bold border-b-2 border-amber-200/50">{data.luckyItem}</span>
          </div>
        </div>

        {/* Footer Analysis Tags */}
        <div className="relative z-10 w-full flex justify-center gap-2 flex-wrap">
          {analysis?.tags.map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-white/60 border border-stone-100 rounded-sm text-xs text-stone-500 font-medium uppercase tracking-wider">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* Capybara Note - Styled like a sticky note */}
      {analysis?.replyMessage && (
        <div className="mt-6 max-w-sm w-full relative bg-[#fffdf0] p-4 shadow-md rotate-1 transform transition-transform hover:rotate-0">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-yellow-200/50 opacity-50 rotate-[-2deg]"></div>
           <p className="text-center text-sm text-stone-600 font-handwriting">
               <span className="font-bold text-stone-800">水豚君：</span> {analysis.replyMessage}
           </p>
        </div>
      )}
    </div>
  );
};

export default EnergyCard;