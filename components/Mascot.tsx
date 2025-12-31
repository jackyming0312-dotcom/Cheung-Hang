
import React, { useState } from 'react';
import { MascotOptions } from '../types';

interface MascotProps {
  expression: 'sleepy' | 'happy' | 'listening' | 'excited';
  options: MascotOptions;
  className?: string;
  onClick?: () => void;
}

// 靜態大熊相片
const CHEUNG_HANG_BEAR_PHOTO = "https://images.unsplash.com/photo-1559454403-b8fb88521f11?q=80&w=1000&auto=format&fit=crop";

const Mascot: React.FC<MascotProps> = ({ className = '', onClick }) => {
  const [bubbleText, setBubbleText] = useState<string | null>(null);

  const bearQuotes = [
    "長亨站永遠為你開著喔...",
    "需要一個熊抱嗎？",
    "坐下來，喝口茶吧。",
    "今天辛苦了，你做得很好。",
    "我就在這裡，慢慢說沒關係。",
    "今天長亨的風很溫柔。",
    "別擔心，大熊都在這裡。"
  ];

  const handleMascotClick = () => {
    setBubbleText(bearQuotes[Math.floor(Math.random() * bearQuotes.length)]);
    setTimeout(() => setBubbleText(null), 3000);
    if (onClick) onClick();
  };

  return (
    <div 
      onClick={handleMascotClick}
      className={`relative cursor-pointer select-none ${className}`}
    >
      {/* 氣泡對話框 */}
      {bubbleText && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-stone-100 text-stone-700 font-bold text-xs z-[100] animate-soft-in">
          {bubbleText}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-r border-b border-stone-100 rotate-45"></div>
        </div>
      )}

      {/* 相片容器 - 絕對靜態 */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img 
          src={CHEUNG_HANG_BEAR_PHOTO} 
          alt="The Static Bear"
          className="w-full h-full object-contain drop-shadow-md relative z-10"
          style={{ transition: 'none' }} 
        />
      </div>

      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[50%] h-2 bg-stone-900/5 blur-md rounded-full"></div>
    </div>
  );
};

export default Mascot;
