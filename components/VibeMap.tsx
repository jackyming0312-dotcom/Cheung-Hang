import React, { useState } from 'react';
import { Compass, Heart, Users, Lightbulb, Check } from 'lucide-react';
import { MapZone } from '../types';

const ZONES: MapZone[] = [
  { id: 'career', name: '職涯探索區', x: 0, y: 0, width: 0, height: 0, color: 'bg-orange-50/40' },
  { id: 'mental', name: '心靈健康區', x: 0, y: 0, width: 0, height: 0, color: 'bg-blue-50/40' },
  { id: 'social', name: '社會參與區', x: 0, y: 0, width: 0, height: 0, color: 'bg-purple-50/40' },
  { id: 'creative', name: '創意開發區', x: 0, y: 0, width: 0, height: 0, color: 'bg-emerald-50/40' },
];

interface VibeMapProps {
  onZoneSelect: (zoneName: string) => void;
}

const VibeMap: React.FC<VibeMapProps> = ({ onZoneSelect }) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const handleSelect = (zone: MapZone) => {
    setSelectedZone(zone.id);
    onZoneSelect(zone.name);
  };

  const getZoneIcon = (id: string) => {
    switch (id) {
      case 'career': return <Compass size={22} />;
      case 'mental': return <Heart size={22} />;
      case 'social': return <Users size={22} />;
      case 'creative': return <Lightbulb size={22} />;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-soft-in">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h3 className="text-3xl text-stone-700 font-semibold serif-font mb-2 italic">
          Growth Sanctuary
        </h3>
        <p className="text-stone-400 text-[11px] tracking-[0.25em] font-medium uppercase">
          選擇今日最讓你感到受用的領域
        </p>
      </div>

      {/* Main Grid Container */}
      <div className="relative bg-white/40 rounded-[2.5rem] border border-stone-100 shadow-2xl p-6 backdrop-blur-sm overflow-hidden paper-stack">
        
        {/* Subtle Grid Background Decoration */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              onClick={() => handleSelect(zone)}
              className={`
                relative aspect-square sm:aspect-video rounded-3xl border transition-all duration-500 flex flex-col items-center justify-center gap-3 overflow-hidden group
                ${selectedZone === zone.id 
                  ? 'border-stone-800 bg-white shadow-xl scale-[1.02] z-20' 
                  : 'border-stone-100/60 hover:border-stone-200 hover:bg-white/60 shadow-sm z-10'}
                ${zone.color}
              `}
            >
              {/* Subtle Index Text */}
              <div className="absolute top-3 right-4 text-[8px] font-mono text-stone-300 tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">
                YOUTH_{zone.id.toUpperCase().substring(0,3)}
              </div>

              {/* Icon Circle */}
              <div className={`
                p-3.5 rounded-2xl transition-all duration-500
                ${selectedZone === zone.id 
                  ? 'bg-stone-800 text-white scale-110' 
                  : 'bg-white/80 text-stone-400 group-hover:text-stone-600'}
              `}>
                {selectedZone === zone.id ? <Check size={20} strokeWidth={3} /> : getZoneIcon(zone.id)}
              </div>

              {/* Label */}
              <span className={`
                text-sm font-bold tracking-wider transition-colors duration-300
                ${selectedZone === zone.id ? 'text-stone-800' : 'text-stone-500'}
              `}>
                {zone.name}
              </span>

              {/* Selected Highlight Bar */}
              {selectedZone === zone.id && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-stone-800"></div>
              )}
            </button>
          ))}
        </div>

        {/* Legend Footer */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
          <div className="h-[1px] flex-1 bg-stone-400"></div>
          <div className="text-[9px] font-mono tracking-widest text-stone-500 uppercase whitespace-nowrap">
            02 // Center Map Interface
          </div>
          <div className="h-[1px] flex-1 bg-stone-400"></div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
         <p className="text-[10px] text-stone-300 font-bold tracking-[0.4em] uppercase">Select one to proceed</p>
      </div>
    </div>
  );
};

export default VibeMap;