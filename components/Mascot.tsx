
import React, { useState } from 'react';
import { MascotOptions } from '../types';
import { Palette } from 'lucide-react';

interface MascotProps {
  expression: 'sleepy' | 'happy' | 'listening' | 'excited' | 'painting';
  options: MascotOptions;
  className?: string;
  onClick?: () => void;
}

const CHEUNG_HANG_BEAR_PHOTO = "https://images.unsplash.com/photo-1559454403-b8fb88521f11?q=80&w=1000&auto=format&fit=crop";

const Mascot: React.FC<MascotProps> = ({ expression, className = '', onClick }) => {
  const [bubbleText, setBubbleText] = useState<string | null>(null);

  const mascotQuotes = [
    "長亨站永遠為你開著喔...",
    "需要一個熊抱嗎？我是亨仔。",
    "坐下來，亨仔陪你喝口茶吧。",
    "今天辛苦了，你做得很好。",
    "我就在這裡，慢慢說沒關係。",
    "今天長亨的風很溫柔。",
    "別擔心，亨仔都在這裡。"
  ];

  const handleMascotClick = () => {
    if (expression === 'painting') return; // 繪圖中不觸發對話
    setBubbleText(mascotQuotes[Math.floor(Math.random() * mascotQuotes.length)]);
    setTimeout(() => setBubbleText(null), 3000);
    if (onClick) onClick();
  };

  return (
    <div 
      onClick={handleMascotClick}
      className={`relative cursor-pointer select-none transition-transform duration-500 ${expression === 'painting' ? 'animate-bounce' : ''} ${className}`}
    >
      <style>
        {`
          @keyframes brush-stroke {
            0% { transform: rotate(-10deg) translateX(-5px); }
            50% { transform: rotate(20deg) translateX(15px); }
            100% { transform: rotate(-10deg) translateX(-5px); }
          }
          .animate-brush {
            animation: brush-stroke 0.8s ease-in-out infinite;
          }
        `}
      </style>

      {bubbleText && expression !== 'painting' && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-stone-100 text-stone-700 font-bold text-xs z-[100] animate-soft-in">
          {bubbleText}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-r border-b border-stone-100 rotate-45"></div>
        </div>
      )}

      <div className={`relative w-full h-full flex items-center justify-center ${expression === 'painting' ? 'scale-90' : ''}`}>
        <img 
          src={CHEUNG_HANG_BEAR_PHOTO} 
          alt="亨仔"
          className={`w-full h-full object-contain drop-shadow-md relative z-10 rounded-full border-4 border-white/50 ${expression === 'painting' ? 'brightness-110 contrast-110' : ''}`}
        />
        
        {expression === 'painting' && (
          <div className="absolute -right-4 top-0 z-20 text-amber-500 animate-brush">
             <Palette size={40} fill="currentColor" stroke="white" strokeWidth={1} />
          </div>
        )}
      </div>

      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[50%] h-2 bg-stone-900/5 blur-md rounded-full"></div>
    </div>
  );
};

export default Mascot;
