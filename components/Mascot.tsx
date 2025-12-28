import React from 'react';
import { MascotOptions } from '../types';

interface MascotProps {
  expression: 'sleepy' | 'happy' | 'listening' | 'excited';
  options: MascotOptions;
  className?: string;
  onClick?: () => void;
}

const Mascot: React.FC<MascotProps> = ({ expression, options, className = '', onClick }) => {
  const { baseColor, hat, glasses, accessory, makeup } = options;

  return (
    <div 
      onClick={onClick}
      className={`relative w-48 h-48 transition-transform duration-200 active:scale-90 cursor-pointer group ${className}`}
      title="點擊我換裝！"
    >
      {/* Click Hint */}
      <div className="absolute -top-4 right-0 bg-white px-3 py-1 rounded-full shadow-md text-xs text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 font-bold transform rotate-6 border border-stone-100">
        ✨ 換個造型？
      </div>

      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full animate-float">
        
        {/* --- LAYER 1: BACK ACCESSORIES --- */}
        {accessory === 'backpack' && (
           <path d="M40 100 Q30 100 30 120 V160 Q30 170 40 170 H60" stroke="#5D4037" strokeWidth="12" strokeLinecap="round" />
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
           <path d="M40 120 C40 60 180 60 180 120 L180 135 Q110 145 40 135 Z" fill="#90A4AE" opacity="0.8" />
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