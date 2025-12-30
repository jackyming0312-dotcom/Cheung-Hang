
import React, { useState, useMemo } from 'react';
import { MascotOptions } from '../types';

interface MascotProps {
  expression: 'sleepy' | 'happy' | 'listening' | 'excited';
  options: MascotOptions;
  className?: string;
  onClick?: () => void;
}

// 鎖定使用者提供的「長亨大熊」經典影像
const CHEUNG_HANG_BEAR_PHOTO = "https://images.unsplash.com/photo-1559454403-b8fb88521f11?q=80&w=1000&auto=format&fit=crop";

const Mascot: React.FC<MascotProps> = ({ expression, options, className = '', onClick }) => {
  const [bubbleText, setBubbleText] = useState<string | null>(null);

  // 根據 options.baseColor 計算顏色偏移濾鏡，讓大熊隨能量換色
  const dynamicStyle = useMemo(() => {
    const color = options.baseColor.toUpperCase();
    let filter = 'saturate(1.1) contrast(1.05)';
    
    // 透過 hue-rotate 與亮度調整，在單一照片上呈現多樣色彩變化
    if (color.includes('C4A484')) filter += ' hue-rotate(0deg)'; // 原色
    else if (color.includes('D7CCC8')) filter += ' hue-rotate(15deg) brightness(1.1)'; // 淺金
    else if (color.includes('BCAAA4')) filter += ' hue-rotate(-10deg) saturate(1.2)'; // 紅棕
    else if (color.includes('A1887F')) filter += ' hue-rotate(30deg) brightness(0.9)'; // 深巧
    else if (color.includes('8D6E63')) filter += ' hue-rotate(45deg) saturate(0.8)'; // 煙燻
    else filter += ' hue-rotate(5deg)';

    return { filter };
  }, [options.baseColor]);

  const bearQuotes = [
    "長亨站永遠為你開著喔...",
    "需要一個熊抱嗎？",
    "坐下來，喝口茶吧。",
    "今天辛苦了，你做得很好。",
    "我就在這裡，慢慢說沒關係。",
    "聽說長亨的風今天很溫柔呢。",
    "別擔心，這一切都會過去的。",
    "無論發生什麼，大熊都在這裡。"
  ];

  const triggerBubble = () => {
    setBubbleText(bearQuotes[Math.floor(Math.random() * bearQuotes.length)]);
    setTimeout(() => setBubbleText(null), 3500);
  };

  const handleMascotClick = () => {
    triggerBubble();
    if (onClick) onClick();
  };

  const getAnimationClass = () => {
    switch (expression) {
      case 'sleepy': return 'animate-pulse opacity-90 scale-95 transition-all duration-1000';
      case 'excited': return 'animate-bounce';
      case 'listening': return 'animate-float';
      default: return 'animate-float';
    }
  };

  return (
    <div 
      onClick={handleMascotClick}
      className={`relative transition-all duration-700 active:scale-90 cursor-pointer group ${className}`}
    >
      {/* 對話氣泡 */}
      {bubbleText && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-stone-100 text-stone-700 font-bold text-xs md:text-sm whitespace-nowrap z-[100] animate-soft-in">
          {bubbleText}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-r border-b border-stone-100 rotate-45"></div>
        </div>
      )}

      {/* 互動提示 */}
      {!bubbleText && (
        <div className="absolute -top-6 right-0 bg-stone-800 text-white px-2 py-0.5 rounded-full shadow-lg text-[7px] opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-[100] font-bold transform -rotate-6">
          🧸 摸摸長亨大熊
        </div>
      )}

      {/* 熊仔核心容器 */}
      <div className={`relative w-full h-full flex items-center justify-center ${getAnimationClass()}`}>
        
        {/* 底層色彩光暈 */}
        <div 
           className="absolute inset-4 rounded-full blur-[40px] opacity-25 transition-all duration-1000 scale-125"
           style={{ backgroundColor: options.baseColor }}
        ></div>

        {/* 經典長亨大熊照片 */}
        <img 
          src={CHEUNG_HANG_BEAR_PHOTO} 
          alt="The Classic Cheung Hang Bear"
          className="w-full h-full object-contain drop-shadow-2xl transition-all duration-1000 relative z-10"
          style={dynamicStyle}
        />
        
        {/* 情感增強特效 */}
        {expression === 'excited' && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-full h-full absolute animate-ping bg-amber-400/10 rounded-full scale-150"></div>
              <div className="absolute -top-8 -left-8 text-2xl animate-float">✨</div>
              <div className="absolute -bottom-8 -right-8 text-2xl animate-float" style={{animationDelay:'0.5s'}}>💖</div>
           </div>
        )}
      </div>

      {/* 底部柔和投影 */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[65%] h-2.5 bg-stone-900/10 blur-lg rounded-full"></div>
    </div>
  );
};

export default Mascot;
