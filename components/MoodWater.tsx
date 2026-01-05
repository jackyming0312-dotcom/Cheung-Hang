import React, { useState } from 'react';
import { BatteryLow, Coffee, Sun, Sparkles, Zap } from 'lucide-react';

interface MoodWaterProps {
  value: number;
  onChange: (val: number) => void;
}

const MoodWater: React.FC<MoodWaterProps> = ({ value, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);

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
    
    let percentage = 100 - (relativeY / height) * 100;
    percentage = Math.ceil(percentage / 10) * 10;
    percentage = Math.max(10, Math.min(100, percentage));
    
    onChange(percentage);
  };

  const getEnergyStatus = () => {
    if (value <= 20) return { icon: <BatteryLow size={32} />, label: "需要休息", color: "text-rose-400", bg: "bg-rose-300" };
    if (value <= 50) return { icon: <Coffee size={32} />, label: "緩慢修復", color: "text-amber-500", bg: "bg-amber-300" };
    if (value <= 80) return { icon: <Sun size={32} />, label: "能量穩定", color: "text-emerald-500", bg: "bg-emerald-300" };
    return { icon: <Sparkles size={32} />, label: "狀態極佳", color: "text-indigo-500", bg: "bg-indigo-300" };
  };

  const status = getEnergyStatus();

  return (
    <div className="flex flex-col items-center gap-8 w-full animate-soft-in">
      <div className="text-center">
        <h3 className={`text-2xl font-semibold serif-font mb-1 transition-colors duration-500 ${status.color}`}>
          {status.label}
        </h3>
        <p className="text-stone-400 text-xs tracking-widest uppercase">滑動調整今日心靈電力</p>
      </div>
      
      <div className="relative flex items-center justify-center py-4">
        {/* The Capsule Container */}
        <div 
          className="relative w-28 h-[380px] bg-white/40 rounded-[3rem] border-4 border-white shadow-[inset_0_4px_10px_rgba(0,0,0,0.05),0_10px_30px_rgba(0,0,0,0.05)] p-3 cursor-pointer touch-none backdrop-blur-sm flex flex-col-reverse gap-1.5 transition-all hover:scale-[1.02]"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleInteraction}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleInteraction}
          onClick={handleInteraction}
        >
          {/* Glass Reflection */}
          <div className="absolute left-4 top-10 w-2 h-32 bg-white/30 rounded-full z-20 pointer-events-none"></div>

          {Array.from({ length: totalBlocks }).map((_, i) => (
            <div 
              key={i} 
              className={`
                w-full flex-1 rounded-2xl transition-all duration-700 ease-out
                ${i < activeBlocks ? status.bg : 'bg-stone-200/20'}
                ${i < activeBlocks ? 'scale-100 opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.05)]' : 'scale-90 opacity-0'}
                ${i === activeBlocks - 1 ? 'animate-pulse' : ''}
              `}
            ></div>
          ))}
        </div>

        {/* Floating Tooltip with Dynamic Icon */}
        <div 
          className="absolute -right-24 pointer-events-none transition-all duration-700 ease-out flex items-center"
          style={{ bottom: `calc(${value}% + 10px)` }}
        >
          <div className={`bg-white/90 backdrop-blur-md w-16 h-16 rounded-full shadow-2xl border border-stone-100 flex items-center justify-center transition-colors duration-500 ${status.color} animate-bounce`}>
            {status.icon}
          </div>
          <div className="absolute left-[-10px] w-4 h-4 bg-white/90 rotate-45 border-l border-b border-stone-100"></div>
        </div>
      </div>

      <div className="flex items-center gap-6 px-10 py-5 bg-white/70 rounded-3xl shadow-xl border border-white/50 backdrop-blur-sm group transition-all hover:-translate-y-1">
        <div className={`p-4 rounded-2xl transition-colors duration-500 bg-stone-100 ${status.color}`}>
            <Zap size={28} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-stone-400 font-bold tracking-[0.2em] uppercase mb-1">Soul Capacity</span>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-stone-800 text-3xl serif-font">{value}%</span>
            <span className="text-sm font-medium text-stone-500 italic">Charged</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodWater;