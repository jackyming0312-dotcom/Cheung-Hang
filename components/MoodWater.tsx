
import React, { useState } from 'react';
import { BatteryLow, Coffee, Sun, Sparkles, Zap } from 'lucide-react';

interface MoodWaterProps {
  value: number;
  onChange: (val: number) => void;
  readonly?: boolean;
}

const MoodWater: React.FC<MoodWaterProps> = ({ value, onChange, readonly = false }) => {
  const [isDragging, setIsDragging] = useState(false);

  const totalBlocks = 10;
  const activeBlocks = Math.ceil(value / 10);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (readonly) return;
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
    if (value <= 20) return { icon: <BatteryLow size={24} />, label: "需要充電", color: "text-rose-400", bg: "bg-rose-300" };
    if (value <= 50) return { icon: <Coffee size={24} />, label: "緩慢恢復", color: "text-amber-500", bg: "bg-amber-300" };
    if (value <= 80) return { icon: <Sun size={24} />, label: "能量穩定", color: "text-emerald-500", bg: "bg-emerald-300" };
    return { icon: <Sparkles size={24} />, label: "狀態極佳", color: "text-indigo-500", bg: "bg-indigo-300" };
  };

  const status = getEnergyStatus();

  return (
    <div className={`flex flex-col items-center w-full animate-soft-in ${readonly ? 'gap-4' : 'gap-8'}`}>
      <div className="text-center">
        <h3 className={`text-xl font-bold serif-font mb-1 transition-colors duration-500 ${status.color}`}>
          {readonly ? `AI 分析情緒電力：${value}%` : status.label}
        </h3>
        {!readonly && <p className="text-stone-400 text-[10px] tracking-widest uppercase">滑動調整今日心靈電力</p>}
      </div>
      
      <div className="relative flex items-center justify-center py-2 w-full">
        {/* Horizontal Battery Display for results */}
        <div className={`
          relative ${readonly ? 'w-full h-12' : 'w-24 h-64'} 
          bg-white/40 rounded-2xl border-2 border-white shadow-inner p-1.5 
          flex ${readonly ? 'flex-row' : 'flex-col-reverse'} gap-1 backdrop-blur-sm
          ${!readonly ? 'cursor-pointer touch-none' : ''}
        `}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseMove={handleInteraction}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleInteraction}
        onClick={handleInteraction}
        >
          {Array.from({ length: totalBlocks }).map((_, i) => (
            <div 
              key={i} 
              className={`
                flex-1 rounded-lg transition-all duration-700 ease-out
                ${i < activeBlocks ? status.bg : 'bg-stone-200/20'}
                ${i < activeBlocks ? 'scale-100 opacity-100' : 'scale-90 opacity-20'}
                ${i === activeBlocks - 1 && !readonly ? 'animate-pulse' : ''}
              `}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodWater;
