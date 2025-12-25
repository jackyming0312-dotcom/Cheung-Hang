import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { MapZone } from '../types';

interface VibeMapProps {
  onZoneSelect: (zoneName: string) => void;
}

const ZONES: MapZone[] = [
  { id: 'lounge', name: '交誼休憩區', x: 10, y: 10, width: 40, height: 35, color: 'bg-orange-100/90' },
  { id: 'study', name: '安靜閱讀區', x: 55, y: 10, width: 35, height: 35, color: 'bg-blue-100/90' },
  { id: 'game', name: '互動娛樂區', x: 10, y: 50, width: 40, height: 40, color: 'bg-purple-100/90' },
  { id: 'cafe', name: '輕食吧台區', x: 55, y: 50, width: 35, height: 40, color: 'bg-green-100/90' },
];

const VibeMap: React.FC<VibeMapProps> = ({ onZoneSelect }) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const handleSelect = (zone: MapZone) => {
    setSelectedZone(zone.id);
    onZoneSelect(zone.name);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-xl text-stone-700 font-medium text-center mb-6 serif-font italic">
        請標記您今日感到最舒適的區域
      </h3>

      <div className="relative w-full aspect-square bg-[#fbfaf8] rounded-2xl border border-stone-200 shadow-inner overflow-hidden">
        {/* Architectural Background Hints - Subtle Grid */}
        <div className="absolute inset-0 opacity-[0.06]" 
             style={{ backgroundImage: 'linear-gradient(45deg, #888 25%, transparent 25%, transparent 75%, #888 75%, #888), linear-gradient(45deg, #888 25%, transparent 25%, transparent 75%, #888 75%, #888)', backgroundSize: '24px 24px', backgroundPosition: '0 0, 12px 12px' }}>
        </div>

        {/* Zones */}
        {ZONES.map((zone) => (
          <button
            key={zone.id}
            onClick={() => handleSelect(zone)}
            className={`absolute transition-all duration-500 ease-out rounded-xl border flex items-center justify-center group cursor-pointer
              ${selectedZone === zone.id 
                ? 'border-stone-600 shadow-inner scale-[0.96] ring-4 ring-stone-100 z-20 opacity-100 saturate-100' 
                : 'border-stone-200/50 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] hover:border-stone-300 z-10 opacity-90 hover:opacity-100 saturate-[0.85] hover:saturate-100'}
              ${zone.color} backdrop-blur-sm
            `}
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
            }}
          >
            <div className="text-center p-2 relative w-full h-full flex flex-col items-center justify-center">
              <span className={`block font-medium text-sm text-stone-700 transition-all duration-300 group-hover:scale-105 group-hover:font-bold ${selectedZone === zone.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                {zone.name}
              </span>
              
              {/* Visual cue: Icon appears/floats up on hover */}
              <div className={`transition-all duration-500 absolute bottom-2 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 ${selectedZone === zone.id ? '!opacity-100 !translate-y-0' : ''}`}>
                 <Heart className={`${selectedZone === zone.id ? 'fill-rose-500 text-rose-500 animate-pulse' : 'text-stone-400'}`} size={18} />
              </div>
            </div>
          </button>
        ))}

        {/* Floor Label */}
        <div className="absolute bottom-4 left-6 text-[10px] text-stone-400 font-sans tracking-widest uppercase border-t border-stone-200 pt-1">
          Ground Floor Plan
        </div>
      </div>
    </div>
  );
};

export default VibeMap;