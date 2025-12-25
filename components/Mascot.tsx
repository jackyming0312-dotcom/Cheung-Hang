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
        {/* Cape or back items could go here */}

        {/* --- LAYER 2: BODY --- */}
        <path d="M40 120C40 80 70 50 110 50C150 50 180 80 180 130C180 160 160 180 110 180H60C50 180 40 170 40 160V120Z" fill={baseColor} />
        
        {/* Head Shape nuances */}
        <ellipse cx="150" cy="100" rx="35" ry="40" fill={baseColor} />
        
        {/* Snout Area */}
        <rect x="160" y="90" width="30" height="40" rx="15" fill="#8D6E63" opacity="0.3" /> 
        
        {/* Ear */}
        <path d="M120 60C120 50 130 40 140 50C150 60 140 70 130 70" fill={baseColor} stroke="#5D4037" strokeWidth="3" />

        {/* --- LAYER 3: FACE & MAKEUP --- */}

        {/* Makeup: Blush */}
        {makeup === 'blush' && (
          <g opacity="0.6">
            <ellipse cx="130" cy="115" rx="8" ry="5" fill="#FF8A80" />
            <ellipse cx="170" cy="115" rx="8" ry="5" fill="#FF8A80" />
          </g>
        )}
        
        {/* Makeup: Star */}
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
        {glasses === 'sunglasses' && (
           <g>
             <path d="M135 85 H155 L152 100 Q145 105 138 100 Z" fill="#333" />
             <line x1="155" y1="88" x2="165" y2="88" stroke="#333" strokeWidth="2" />
             <path d="M135 88 L120 86" stroke="#333" strokeWidth="2" />
           </g>
        )}

        {/* --- LAYER 5: NECK ACCESSORIES --- */}
        {accessory === 'scarf' && (
           <g>
             <path d="M100 135 Q145 155 180 135" stroke="#FF7043" strokeWidth="14" strokeLinecap="round" />
             <path d="M115 135 L105 165" stroke="#FF7043" strokeWidth="12" strokeLinecap="round" />
             <path d="M100 135 Q145 155 180 135" stroke="#FFCCBC" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 10"/>
           </g>
        )}
        {accessory === 'bowtie' && (
           <path d="M135 135 L125 125 V145 L135 135 Z M135 135 L145 125 V145 L135 135 Z" fill="#EF5350" stroke="#B71C1C" strokeWidth="1" />
        )}
        {accessory === 'flower' && (
           <g transform="translate(110, 130)">
             <circle cx="0" cy="0" r="5" fill="#FFEB3B" />
             <circle cx="0" cy="-7" r="5" fill="#F06292" />
             <circle cx="6" cy="-4" r="5" fill="#F06292" />
             <circle cx="6" cy="4" r="5" fill="#F06292" />
             <circle cx="0" cy="7" r="5" fill="#F06292" />
             <circle cx="-6" cy="4" r="5" fill="#F06292" />
             <circle cx="-6" cy="-4" r="5" fill="#F06292" />
           </g>
        )}

        {/* --- LAYER 6: HATS --- */}
        {hat === 'party' && (
           <g transform="translate(130, 20) rotate(15)">
             <path d="M0 40 L20 0 L40 40 Z" fill="#FFB74D" stroke="#E65100" strokeWidth="2" />
             <circle cx="20" cy="0" r="5" fill="#FF5722" />
             <circle cx="10" cy="20" r="3" fill="#FFF" opacity="0.5"/>
           </g>
        )}
        {hat === 'beret' && (
           <g transform="translate(115, 35)">
             <path d="M-5 20 C-5 0 65 0 65 20 C65 25 50 30 30 30 C10 30 -5 25 -5 20 Z" fill="#D81B60" />
             <path d="M30 0 L30 5" stroke="#D81B60" strokeWidth="3"/>
           </g>
        )}
        {hat === 'beanie' && (
           <path d="M110 55 C110 30 160 30 160 55 L160 60 L110 60 Z" fill="#42A5F5" stroke="#1E88E5" strokeWidth="2" />
        )}
        {hat === 'crown' && (
           <path d="M120 60 L120 40 L130 50 L140 35 L150 50 L160 40 L160 60 Z" fill="#FFD700" stroke="#FFA000" strokeWidth="2" />
        )}

        {/* Legs */}
        <path d="M60 180V190" stroke="#8D6E63" strokeWidth="8" strokeLinecap="round" />
        <path d="M90 180V190" stroke="#8D6E63" strokeWidth="8" strokeLinecap="round" />
        <path d="M140 180V190" stroke="#8D6E63" strokeWidth="8" strokeLinecap="round" />

        {/* VFX */}
        {expression === 'excited' && (
             <text x="10" y="60" className="text-4xl animate-pulse">✨</text>
        )}
        {expression === 'sleepy' && (
             <text x="160" y="40" className="text-2xl animate-pulse">zZZ</text>
        )}
      </svg>
      
      {/* Speech Bubble Shadow */}
      <div className="absolute -bottom-4 w-full h-4 bg-black/10 rounded-[100%] blur-sm"></div>
    </div>
  );
};

export default Mascot;