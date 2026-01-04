
import React, { useState } from 'react';
import { MascotOptions } from '../types';
import { Palette, Sparkles } from 'lucide-react';

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
    if (expression === 'painting') return; 
    setBubbleText(mascotQuotes[Math.floor(Math.random() * mascotQuotes.length)]);
    setTimeout(() => setBubbleText(null), 3000);
    if (onClick) onClick();
  };

  return (
    <div 
      onClick={handleMascotClick}
      className={`relative cursor-pointer select-none transition-all duration-700 ${expression === 'painting' ? 'animate-painting-move' : 'hover:scale-105'} ${className}`}
    >
      <style>
        {`
          @keyframes painting-move {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(15px, -5px) rotate(5deg); }
            50% { transform: translate(-10px, 10px) rotate(-5deg); }
            75% { transform: translate(10px, 5px) rotate(3deg); }
          }
          @keyframes brush-stroke {
            0% { transform: rotate(-20deg) scale(1); }
            50% { transform: rotate(30deg) scale(1.2); }
            100% { transform: rotate(-20deg) scale(1); }
          }
          .animate-painting-move {
            animation: painting-move 2s ease-in-out infinite;
          }
          .animate-brush {
            animation: brush-stroke 0.6s ease-in-out infinite;
          }
        `}
      </style>

      {bubbleText && expression !== 'painting' && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-stone-100 text-stone-700 font-bold text-xs z-[100] animate-soft-in">
          {bubbleText}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-r border-b border-stone-100 rotate-45"></div>
        </div>
      )}

      <div className={`relative w-full h-full flex items-center justify-center`}>
        {expression === 'painting' && (
           <div className="absolute inset-0 flex items-center justify-center z-0">
              <Sparkles className="text-amber-300/40 animate-pulse scale-150" />
           </div>
        )}
        
        <img 
          src={CHEUNG_HANG_BEAR_PHOTO} 
          alt="亨仔"
          className={`w-full h-full object-contain drop-shadow-md relative z-10 rounded-full border-4 border-white/50 transition-all duration-500 ${expression === 'painting' ? 'brightness-110 contrast-125' : ''}`}
        />
        
        {expression === 'painting' && (
          <div className="absolute -right-6 top-0 z-20 text-amber-500 animate-brush">
             <Palette size={44} fill="white" stroke="currentColor" strokeWidth={2} />
          </div>
        )}
      </div>

      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-[60%] h-2 bg-stone-900/5 blur-md rounded-full transition-opacity duration-500 ${expression === 'painting' ? 'opacity-0' : 'opacity-100'}`}></div>
    </div>
  );
};

export default Mascot;
