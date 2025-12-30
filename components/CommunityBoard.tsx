
import React, { useState, useMemo } from 'react';
import { CommunityLog } from '../types';
import { ChevronLeft, ChevronRight, Calendar, PenLine, Clock, Loader2 } from 'lucide-react';

interface CommunityBoardProps {
  logs: CommunityLog[];
  onBack: () => void;
}

const CommunityBoard: React.FC<CommunityBoardProps> = ({ logs, onBack }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // 過濾顯示的紀錄
  const displayLogs = useMemo(() => {
    const targetDateStr = selectedDate.toLocaleDateString();
    return logs
      .filter(log => new Date(log.timestamp).toLocaleDateString() === targetDateStr)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedDate, logs]);

  const changeDate = (offset: number) => {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + offset);
      if (newDate > new Date()) return;
      setSelectedDate(newDate);
  };

  const getMoodColor = (level: number, isAnalyzing: boolean) => {
      if (isAnalyzing) return 'bg-stone-50 border-stone-200 text-stone-400 animate-pulse';
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

  const isRecent = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    return diff < 600000; // 10 minutes
  };

  return (
    <div className="w-full flex flex-col items-center animate-soft-in h-full">
        <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-stone-800 serif-font">心靈回憶網格</h2>
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
            <div className="flex items-center gap-2 text-stone-700 font-medium w-36 justify-center">
                <Calendar size={16} className="text-stone-400" />
                <span className="text-xs">{selectedDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <button 
                onClick={() => changeDate(1)}
                disabled={isToday}
                className={`p-1 rounded-full transition-colors ${isToday ? 'text-stone-300 cursor-not-allowed' : 'text-stone-600 hover:bg-stone-200'}`}
            >
                <ChevronRight size={20} />
            </button>
        </div>

        {/* List Section */}
        <div className="w-full flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[300px]">
            {displayLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 py-10 bg-white/30 rounded-[2rem] border border-dashed border-stone-200 mx-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <PenLine size={28} className="text-stone-200" />
                    </div>
                    <p className="font-medium text-stone-400 text-sm">這一天還沒有紀錄</p>
                    <p className="text-[10px] mt-2 text-stone-300 uppercase tracking-widest">No memories found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 content-start">
                    {displayLogs.map((log) => {
                        const isAnalyzing = log.theme === "分析中...";
                        return (
                            <div 
                                key={log.id} 
                                className={`
                                    p-5 rounded-2xl border transition-all duration-500 flex flex-col gap-3 relative overflow-hidden group
                                    ${getMoodColor(log.moodLevel, isAnalyzing)}
                                    ${isRecent(log.timestamp) && !isAnalyzing ? 'ring-2 ring-amber-200 ring-offset-2' : 'hover:shadow-md'}
                                `}
                            >
                                {isRecent(log.timestamp) && (
                                    <div className="absolute top-0 right-0 bg-amber-400 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1 z-10">
                                        <Clock size={8} /> {isAnalyzing ? 'UPLOADING' : 'JUST NOW'}
                                    </div>
                                )}

                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="text-2xl mb-1">{isAnalyzing ? <Loader2 size={24} className="animate-spin text-stone-300" /> : getMoodIcon(log.moodLevel)}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isAnalyzing ? 'opacity-30' : 'opacity-40'}`}>
                                            {log.theme}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-mono opacity-40">
                                        {new Date(log.timestamp).toLocaleTimeString('zh-TW', {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>

                                <p className={`text-sm font-medium leading-relaxed line-clamp-4 serif-font italic ${isAnalyzing ? 'opacity-50' : ''}`}>
                                    {log.text || "安靜地留下一抹心聲..."}
                                </p>

                                <div className="mt-auto pt-3 border-t border-black/5 flex flex-wrap gap-1.5">
                                    {log.tags.map((t, idx) => (
                                        <span key={idx} className="text-[9px] px-2 py-0.5 bg-white/40 rounded-full backdrop-blur-sm font-bold opacity-70">
                                            #{t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        <button 
            onClick={onBack}
            className="w-full max-w-xs px-6 py-3.5 bg-stone-800 text-white rounded-xl font-bold shadow-[0_4px_0_rgb(44,40,36)] active:shadow-none active:translate-y-[4px] hover:bg-stone-700 transition-all mt-4 mb-2"
        >
            返回首頁
        </button>
    </div>
  );
};

export default CommunityBoard;
