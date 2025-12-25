import React, { useState } from 'react';
import { Battery, Zap } from 'lucide-react';

interface MoodWaterProps {
  value: number;
  onChange: (val: number) => void;
}

const MoodWater: React.FC<MoodWaterProps> = ({ value, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  // We divide 0-100 into 10 blocks
  const totalBlocks = 10;
  const activeBlocks = Math.ceil(value / 10);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === 'mousemove' && !isDragging) return;

    const container = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    let clientY;
    
    if ('touches' in e) {
      clientY = e.touches[0].clientY;
    } else {
      clientY = (e as React.MouseEvent).clientY;
    }

    const relativeY = clientY - container.top;
    const height = container.height;
    
    // Calculate percentage from bottom
    let percentage = 100 - (relativeY / height) * 100;
    
    // Snap to grid of 10
    percentage = Math.ceil(percentage / 10) * 10;
    
    percentage = Math.max(10, Math.min(100, percentage)); // Min 10%
    
    onChange(percentage);
  };

  const getEmoji = () => {
    if (value <= 20) return "🔌";
    if (value <= 40) return "🔋";
    if (value <= 60) return "⚡️";
    if (value <= 80) return "✨";
    return "🔥";
  };

  const getStatusText = () => {
    if (value <= 20) return "電力不足";
    if (value <= 40) return "需要充電";
    if (value <= 60) return "狀態平穩";
    if (value <= 80) return "能量充沛";
    return "火力全開";
  };

  // Generate color based on block index (0 is bottom)
  const getBlockColor = (index: number) => {
      // Create a gradient from Blue (low) -> Yellow (mid) -> Orange/Pink (high)
      if (index < 3) return "bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,0.6)]";
      if (index < 7) return "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.6)]";
      return "bg-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.8)]";
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h3 className="text-xl text-stone-700 font-medium serif-font italic">
        Slide to charge your energy
      </h3>
      
      <div 
        className="relative w-32 h-[320px] bg-stone-100/50 rounded-2xl border-4 border-stone-200 shadow-inner p-2 cursor-pointer touch-none backdrop-blur-sm flex flex-col justify-end gap-1.5"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleInteraction}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleInteraction}
        onClick={handleInteraction}
      >
        {/* Background Grid Hints */}
        <div className="absolute inset-0 z-0 flex flex-col justify-end gap-1.5 p-2 opacity-20 pointer-events-none">
           {Array.from({ length: totalBlocks }).map((_, i) => (
             <div key={`bg-${i}`} className="w-full flex-1 rounded-lg bg-stone-400"></div>
           ))}
        </div>

        {/* Active Blocks */}
        {Array.from({ length: totalBlocks }).map((_, i) => {
            const isActive = i < activeBlocks;
            const isTopBlock = i === activeBlocks - 1;
            
            return (
                <div 
                    key={i} 
                    className={`
                        w-full flex-1 rounded-lg transition-all duration-300 z-10
                        ${isActive ? getBlockColor(i) : 'bg-transparent'}
                        ${isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
                        ${isTopBlock ? 'animate-pulse' : ''}
                    `}
                >
                </div>
            );
        })}

        {/* Floating Indicator */}
        <div 
            className="absolute -right-16 top-0 bottom-0 pointer-events-none transition-all duration-300 flex items-end pb-2"
            style={{ height: `${value}%` }}
        >
             <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg shadow-md border border-stone-100 text-2xl animate-bounce">
                {getEmoji()}
             </div>
        </div>
      </div>

      <div className="flex items-center gap-4 px-8 py-4 bg-white/90 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-stone-100 transform transition-transform hover:scale-105">
        <div className={`p-3 rounded-full ${value > 60 ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-500'}`}>
            {value > 80 ? <Zap size={24} className="fill-current" /> : <Battery size={24} />}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-stone-400 font-bold tracking-widest uppercase mb-0.5">Energy Level</span>
          <span className="font-bold text-stone-800 text-xl serif-font flex items-center gap-2">
             {value}% 
             <span className="w-1 h-1 rounded-full bg-stone-300"></span>
             <span className="text-base font-normal text-stone-600">{getStatusText()}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MoodWater;