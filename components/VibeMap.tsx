import React, { useState } from 'react';
import { MapPin, Check } from 'lucide-react';
import { MapZone } from '../types';

interface VibeMapProps {
  onZoneSelect: (zoneName: string) => void;
}

const ZONES: MapZone[] = [
  { id: 'lounge', name: '交誼休憩區', x: 8, y: 8, width: 42, height: 40, color: 'bg-[#fff5e6]' },
  { id: 'study', name: '安靜閱讀區', x: 55, y: 8, width: 37, height: 40, color: 'bg-[#e6f0ff]' },
  { id: 'game', name: '互動娛樂區', x: 8, y: 53, width: 42, height: 40, color: 'bg-[#f5e6ff]' },
  { id: 'cafe', name: '輕食吧台區', x: 55, y: 53, width: 37, height: 40, color: 'bg-[#e6ffed]' },
];

const VibeMap: React.FC<VibeMapProps> = ({ onZoneSelect }) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const handleSelect = (zone: MapZone) => {
    setSelectedZone(zone.id);
    onZoneSelect(zone.name);
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-soft-in">
      <div className="text-center mb-8">
        <h3 className="text-2xl text-stone-700 font-semibold serif-font mb-1 italic">
          Comfort Sanctuary
        </h3>
        <p className="text-stone-400 text-xs tracking-widest uppercase">選擇今日最讓你感到自在的區域</p>
      </div>

      <div className="relative w-full aspect-[4/3] bg-[#fbfaf8] rounded-[2rem] border-2 border-stone-200 shadow-2xl overflow-hidden p-6 paper-stack">
        {/* Blueprint Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#4a4036 1px, transparent 1px), linear-gradient(90deg, #4a4036 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
        
        {/* Zones Container */}
        <div className="relative w-full h-full">
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              onClick={() => handleSelect(zone)}
              className={`absolute transition-all duration-700 ease-in-out rounded-2xl border-2 flex flex-col items-center justify-center group
                ${selectedZone === zone.id 
                  ? 'border-stone-800 shadow-2xl scale-[1.02] z-30 opacity-100' 
                  : 'border-stone-200/40 shadow-sm hover:shadow-xl hover:scale-[1.01] z-10 opacity-80 hover:opacity-100'}
                ${zone.color} backdrop-blur-[2px] overflow-hidden
              `}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
              }}
            >
              {/* Animated selection circle */}
              {selectedZone === zone.id && (
                <div className="absolute inset-0 bg-stone-800/5 animate-pulse"></div>
              )}
              
              <div className="flex flex-col items-center gap-2 p-2 relative z-10">
                <div className={`transition-all duration-500 rounded-full p-1.5 ${selectedZone === zone.id ? 'bg-stone-800 text-white' : 'bg-stone-200/50 text-stone-400'}`}>
                   {selectedZone === zone.id ? <Check size={16} /> : <MapPin size={16} />}
                </div>
                <span className={`block font-bold text-sm tracking-tight transition-colors duration-300 ${selectedZone === zone.id ? 'text-stone-800' : 'text-stone-500'}`}>
                  {zone.name}
                </span>
              </div>

              {/* Decorative Corner Labels */}
              <div className="absolute top-1 right-2 text-[8px] font-mono text-stone-300 uppercase">
                Zone_{zone.id.substring(0,3)}
              </div>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[9px] text-stone-400 font-mono tracking-tighter uppercase whitespace-nowrap">
          <span>01 // Interior Plan</span>
          <span className="w-8 h-[1px] bg-stone-200"></span>
          <span>Scale 1:50</span>
          <span className="w-8 h-[1px] bg-stone-200"></span>
          <span>Rev. Soul_v2</span>
        </div>
      </div>
    </div>
  );
};

export default VibeMap;