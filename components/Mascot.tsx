import React, { useState, useEffect } from 'react';
import { MascotOptions } from '../types';

interface MascotProps {
  expression: 'sleepy' | 'happy' | 'listening' | 'excited';
  options: MascotOptions;
  className?: string;
  onClick?: () => void;
}

const Mascot: React.FC<MascotProps> = ({ expression, options, className = '', onClick }) => {
  const { role, baseColor, hat, glasses, accessory, makeup } = options;
  const [bubbleText, setBubbleText] = useState<string | null>(null);

  const youthQuotes = ["Chill 一下吧！", "今天也很酷喔", "Keep it real!", "Stay positive!", "這波很可以", "要不要去滑板？"];
  const workerQuotes = ["我在這裡聽你說", "累了就休息一下吧", "你已經做得很棒了", "需要喝杯咖啡嗎？", "一起找回能量吧", "看見你的努力了"];

  const triggerBubble = () => {
    const pool = role === 'youth' ? youthQuotes : workerQuotes;
    setBubbleText(pool[Math.floor(Math.random() * pool.length)]);
    setTimeout(() => setBubbleText(null), 3000);
  };

  const handleMascotClick = () => {
    triggerBubble();
    if (onClick) onClick();
  };

  return (
    <div 
      onClick={handleMascotClick}
      className={`relative w-48 h-48 transition-transform duration-200 active:scale-95 cursor-pointer group ${className}`}
    >
      {/* Dynamic Speech Bubble */}
      {bubbleText && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-2xl shadow-2xl border border-stone-100 text-stone-700 font-bold text-sm whitespace-nowrap z-50 animate-soft-in">
          {bubbleText}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-stone-100 rotate-45"></div>
        </div>
      )}

      {/* Click Hint */}
      {!bubbleText && (
        <div className="absolute -top-4 right-0 bg-white px-3 py-1 rounded-full shadow-md text-[10px] text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 font-bold transform rotate-6 border border-stone-100">
          ✨ Tap to Chat
        </div>
      )}

      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full animate-float">
        
        {/* --- ROLE BACKGROUND DECORATIONS --- */}
        {role === 'youth' ? (
           <g opacity="0.1">
              <path d="M20 150 L50 150 L60 170 L10 170 Z" fill="#333" /> {/* Skateboard vibe */}
              <circle cx="170" cy="40" r="10" fill="#FFD54F" />
              <path d="M10 20 L30 40 M10 40 L30 20" stroke="#333" strokeWidth="2" />
           </g>
        ) : (
           <g opacity="0.1">
              <path d="M30 40 Q50 20 70 40 T110 40" stroke="#E57373" strokeWidth="4" fill="none" /> {/* Heart/Wave vibe */}
              <rect x="20" y="20" width="15" height="20" rx="2" fill="#8D6E63" />
           </g>
        )}

        {/* --- LAYER 1: BACK ACCESSORIES --- */}
        {accessory === 'backpack' && (
           <path d="M40 100 Q30 100 30 120 V160 Q30 170 40 170 H60" stroke="#5D4037" strokeWidth="12" strokeLinecap="round" />
        )}
        {accessory === 'headphones' && (
           <path d="M80 60 Q110 30 150 50 Q180 70 180 100" stroke="#333" strokeWidth="10" fill="none" />
        )}

        {/* --- LAYER 2: BODY --- */}
        <path d="M40 120C40 80 70 50 110 50C150 50 180 80 180 130C180 160 160 180 110 180H60C50 180 40 170 40 160V120Z" fill={baseColor} />
        
        {/* Head Shape nuances */}
        <ellipse cx="150" cy="100" rx="35" ry="40" fill={baseColor} />
        
        {/* Snout Area */}
        <rect x="160" y="90" width="30" height="40" rx="15" fill="#8D6E63" opacity="0.3" /> 
        
        {/* Ear */}
        <path d="M120 60C120 50 130 40 140 50C150 60 140 70 130 70" fill={baseColor} stroke="#5D4037" strokeWidth="3" />

        {/* --- LAYER 3: FACE & MAKEUP --- */}
        {makeup === 'blush' && (
          <g opacity="0.6">
            <ellipse cx="130" cy="115" rx="8" ry="5" fill="#FF8A80" />
            <ellipse cx="170" cy="115" rx="8" ry="5" fill="#FF8A80" />
          </g>
        )}
        
        {makeup === 'star' && (
           <path d="M130 110 L132 115 L137 115 L133 118 L134 123 L130 120 L126 123 L127 118 L123 115 L128 115 Z" fill="#FFD54F" />
        )}

        {/* Eyes based on Expression */}
        {expression === 'sleepy' && (
           <path d="M140 90 Q150 95 160 90" stroke="#3E2723" strokeWidth="4" strokeLinecap="round" />
        )}
        {expression === 'happy' && (
           <path d="M140 95 Q150 85 160 95" stroke="#3E2723" strokeWidth="4" strokeLinecap="round" />
        )}
        {expression === 'listening' && (
           <circle cx="150" cy="92" r="4" fill="#3E2723" />
        )}
        {expression === 'excited' && (
           <>
            <path d="M140 95 Q150 85 160 95" stroke="#3E2723" strokeWidth="4" strokeLinecap="round" />
            <path d="M130 80 L125 70 M165 80 L170 70" stroke="#3E2723" strokeWidth="2" />
           </>
        )}

        {/* Nose */}
        <circle cx="175" cy="100" r="3" fill="#3E2723" /> 

        {/* --- LAYER 4: GLASSES --- */}
        {glasses === 'round' && (
           <g>
             <circle cx="145" cy="92" r="10" stroke="#333" strokeWidth="2" fill="rgba(255,255,255,0.2)" />
             <line x1="155" y1="92" x2="165" y2="92" stroke="#333" strokeWidth="2" />
             <path d="M135 92 L120 90" stroke="#333" strokeWidth="2" />
           </g>
        )}
        {glasses === 'reading' && (
           <g>
             <path d="M138 95 H162 V100 Q150 105 138 100 Z" fill="rgba(0,0,0,0.1)" stroke="#333" strokeWidth="1" />
           </g>
        )}
        {glasses === 'sunglasses' && (
           <g>
             <path d="M135 85 H155 L152 100 Q145 105 138 100 Z" fill="#333" />
             <line x1="155" y1="88" x2="165" y2="88" stroke="#333" strokeWidth="2" />
             <path d="M135 88 L120 86" stroke="#333" strokeWidth="2" />
           </g>
        )}

        {/* --- LAYER 5: NECK ACCESSORIES --- */}
        {accessory === 'badge' && (
           <g>
             <path d="M110 135 L125 155 L140 135" stroke="#333" strokeWidth="2" fill="none" />
             <rect x="115" y="150" width="20" height="25" rx="2" fill="#fff" stroke="#333" strokeWidth="1" />
             <rect x="118" y="155" width="14" height="4" rx="1" fill="#42A5F5" />
             <rect x="118" y="162" width="14" height="2" rx="0.5" fill="#eee" />
             <rect x="118" y="166" width="10" height="2" rx="0.5" fill="#eee" />
           </g>
        )}
        {accessory === 'coffee' && (
           <g transform="translate(140, 140)">
              <path d="M0 0 L5 30 H25 L30 0 Z" fill="#eee" stroke="#ccc" strokeWidth="1" />
              <rect x="-2" y="-5" width="34" height="8" rx="4" fill="#5D4037" />
              <path d="M10 -15 Q15 -25 20 -15" stroke="#fff" strokeWidth="2" opacity="0.5" />
           </g>
        )}
        {accessory === 'tablet' && (
           <g transform="translate(60, 140)">
              <rect x="0" y="0" width="30" height="40" rx="3" fill="#333" />
              <rect x="2" y="2" width="26" height="34" rx="1" fill="#607D8B" />
              <circle cx="15" cy="38" r="1.5" fill="#fff" />
           </g>
        )}
        {accessory === 'scarf' && (
           <g>
             <path d="M100 135 Q145 155 180 135" stroke="#FF7043" strokeWidth="14" strokeLinecap="round" />
             <path d="M115 135 L105 165" stroke="#FF7043" strokeWidth="12" strokeLinecap="round" />
           </g>
        )}

        {/* --- LAYER 6: HATS --- */}
        {hat === 'hoodie' && (
           <g>
             <path d="M40 120 C40 60 180 60 180 120 L180 135 Q110 145 40 135 Z" fill="#90A4AE" opacity="0.8" />
             <circle cx="110" cy="135" r="3" fill="#fff" />
             <circle cx="130" cy="135" r="3" fill="#fff" />
           </g>
        )}
        {hat === 'party' && (
           <g transform="translate(130, 20) rotate(15)">
             <path d="M0 40 L20 0 L40 40 Z" fill="#FFB74D" stroke="#E65100" strokeWidth="2" />
             <circle cx="20" cy="0" r="5" fill="#FF5722" />
           </g>
        )}

        {/* Legs */}
        <path d="M60 180V190" stroke="#8D6E63" strokeWidth="8" strokeLinecap="round" />
        <path d="M90 180V190" stroke="#8D6E63" strokeWidth="8" strokeLinecap="round" />
        <path d="M140 180V190" stroke="#8D6E63" strokeWidth="8" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default Mascot;