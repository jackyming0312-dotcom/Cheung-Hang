import React, { useEffect, useState } from 'react';
import { CommunityLog } from '../types';
import { ChevronLeft, ChevronRight, Calendar, User, PenLine } from 'lucide-react';

interface CommunityBoardProps {
  onBack: () => void;
}

const CommunityBoard: React.FC<CommunityBoardProps> = ({ onBack }) => {
  const [logs, setLogs] = useState<CommunityLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [displayLogs, setDisplayLogs] = useState<CommunityLog[]>([]);

  useEffect(() => {
    // 1. Get real user logs from localStorage only
    const savedLogs = JSON.parse(localStorage.getItem('vibe_logs') || '[]');
    setLogs(savedLogs);
  }, []);

  // Filter logs when date changes
  useEffect(() => {
    const targetDateStr = selectedDate.toLocaleDateString();
    
    const filtered = logs.filter(log => {
        const logDate = new Date(log.timestamp).toLocaleDateString();
        return logDate === targetDateStr;
    });

    // Sort by newest first
    setDisplayLogs(filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, [selectedDate, logs]);

  const changeDate = (offset: number) => {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + offset);
      // Prevent going into future
      if (newDate > new Date()) return;
      setSelectedDate(newDate);
  };

  const getMoodColor = (level: number) => {
      if (level > 70) return 'bg-orange-50/80 border-orange-200 text-orange-900';
      if (level > 40) return 'bg-amber-50/80 border-amber-200 text-amber-900';
      return 'bg-stone-50/80 border-stone-200 text-stone-700';
  };

  const getMoodIcon = (level: number) => {
    if (level > 70) return '🌞';
    if (level > 40) return '🍵';
    return '🌧️';
  }

  const isToday = selectedDate.toLocaleDateString() === new Date().toLocaleDateString();

  return (
    <div className="w-full flex flex-col items-center animate-fade-in h-full">
        <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-stone-800 serif-font">Daily Vibe Grid</h2>
            <p className="text-stone-500 text-sm mt-1">紀錄每一天的感動與連結</p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-4 mb-6 bg-white/50 px-4 py-2 rounded-full border border-stone-200 shadow-sm">
            <button 
                onClick={() => changeDate(-1)}
                className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-600"
            >
                <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2 text-stone-700 font-medium w-32 justify-center">
                <Calendar size={16} />
                <span>{selectedDate.toLocaleDateString('zh-TW')}</span>
            </div>
            <button 
                onClick={() => changeDate(1)}
                disabled={isToday}
                className={`p-1 rounded-full transition-colors ${isToday ? 'text-stone-300 cursor-not-allowed' : 'text-stone-600 hover:bg-stone-200'}`}
            >
                <ChevronRight size={20} />
            </button>
        </div>

        {/* Empty State - Now more prominent as there is no fake data */}
        {displayLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 w-full text-stone-400 py-10 bg-white/30 rounded-xl border border-dashed border-stone-300 mx-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <PenLine size={28} className="text-amber-400" />
                </div>
                <p className="font-medium text-stone-500">這一天還是一張白紙</p>
                {isToday ? (
                    <p className="text-xs mt-2 text-stone-400">您將成為今天第一位分享故事的人！</p>
                ) : (
                    <p className="text-xs mt-2 text-stone-400">這一天沒有留下紀錄</p>
                )}
            </div>
        )}

        {/* Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar content-start">
            {displayLogs.map((log) => (
                <div 
                    key={log.id} 
                    className={`p-4 rounded-xl border ${getMoodColor(log.moodLevel)} shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-2 relative overflow-hidden group`}
                >
                    {/* Decorative bg element */}
                    <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/20 rounded-full"></div>
                    
                    <div className="flex justify-between items-start relative z-10">
                        <span className="text-xl filter drop-shadow-sm">{getMoodIcon(log.moodLevel)}</span>
                        <span className="text-[10px] opacity-60 uppercase tracking-wider font-bold">
                            {new Date(log.timestamp).toLocaleTimeString('zh-TW', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    <p className="text-sm font-medium line-clamp-3 leading-relaxed relative z-10">
                        {log.text || "......"}
                    </p>
                    <div className="mt-auto pt-2 flex flex-wrap gap-1 relative z-10">
                        {log.tags.map(t => (
                            <span key={t} className="text-[10px] px-2 py-0.5 bg-white/60 rounded-full backdrop-blur-sm">#{t}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        <button 
            onClick={onBack}
            className="w-full max-w-xs px-6 py-3.5 bg-gradient-to-r from-stone-700 to-stone-800 text-white rounded-xl font-bold shadow-[0_4px_0_rgb(68,64,60)] active:shadow-none active:translate-y-[4px] hover:brightness-110 transition-all mt-auto"
        >
            返回
        </button>
    </div>
  );
};

export default CommunityBoard;