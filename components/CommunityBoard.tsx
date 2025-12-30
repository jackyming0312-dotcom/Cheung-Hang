
import React, { useState, useMemo } from 'react';
import { CommunityLog } from '../types';
import { ChevronLeft, ChevronRight, Calendar, PenLine, Clock, Loader2, Trash2, Sparkles } from 'lucide-react';

interface CommunityBoardProps {
  logs: CommunityLog[];
  onBack: () => void;
  onClearDay: (dateStr: string) => void;
}

const CommunityBoard: React.FC<CommunityBoardProps> = ({ logs, onBack, onClearDay }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const targetDateStr = selectedDate.toLocaleDateString();

  const displayLogs = useMemo(() => {
    return logs
      .filter(log => new Date(log.timestamp).toLocaleDateString() === targetDateStr)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [targetDateStr, logs]);

  const collectiveMood = useMemo(() => {
      if (displayLogs.length === 0) return null;
      const avg = displayLogs.reduce((acc, log) => acc + log.moodLevel, 0) / displayLogs.length;
      if (avg > 70) return "暖洋洋";
      if (avg > 40) return "平靜期";
      return "微雨中";
  }, [displayLogs]);

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

  return (
    <div className="w-full flex flex-col items-center animate-soft-in h-full">
        <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-stone-800 serif-font">萬家燈火：心聲牆</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
                 {collectiveMood && (
                    <div className="flex items-center gap-1.5 px-3 py-0.5 bg-white/60 rounded-full border border-stone-100 shadow-sm">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">今日共感</span>
                        <span className="text-[10px] font-bold text-amber-600">{collectiveMood}</span>
                    </div>
                 )}
            </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 mb-6 bg-white/50 px-3 py-2 rounded-full border border-stone-200 shadow-sm">
            <button onClick={() => changeDate(-1)} className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-600">
                <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 text-stone-700 font-medium w-32 justify-center">
                <Calendar size={14} className="text-stone-400" />
                <span className="text-[11px]">{targetDateStr}</span>
            </div>
            <button onClick={() => changeDate(1)} disabled={isToday} className={`p-1 rounded-full transition-colors ${isToday ? 'text-stone-300 cursor-not-allowed' : 'text-stone-600 hover:bg-stone-200'}`}>
                <ChevronRight size={18} />
            </button>

            {displayLogs.length > 0 && (
                <>
                    <div className="h-4 w-[1px] bg-stone-200 mx-1"></div>
                    <button onClick={() => onClearDay(targetDateStr)} className="p-1.5 text-stone-300 hover:text-rose-400 hover:bg-rose-50 rounded-full transition-all group">
                        <Trash2 size={14} />
                    </button>
                </>
            )}
        </div>

        {/* List Section */}
        <div className="w-full flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[300px]">
            {displayLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 py-10 bg-white/30 rounded-[2rem] border border-dashed border-stone-200 mx-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <PenLine size={28} className="text-stone-200" />
                    </div>
                    <p className="font-medium text-stone-400 text-sm">這一天還靜悄悄的</p>
                    <p className="text-[10px] mt-2 text-stone-300 uppercase tracking-widest">Be the first to whisper</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 content-start px-1">
                    {displayLogs.map((log) => {
                        const isAnalyzing = log.theme === "心聲提取中...";
                        return (
                            <div 
                                key={log.id} 
                                className={`
                                    p-5 rounded-2xl border transition-all duration-500 flex flex-col gap-3 relative overflow-hidden group
                                    ${getMoodColor(log.moodLevel, isAnalyzing)}
                                    hover:shadow-md hover:-translate-y-0.5
                                `}
                            >
                                {/* 微光裝飾 */}
                                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/20 blur-xl group-hover:bg-white/40 transition-all"></div>

                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="text-2xl mb-1">{isAnalyzing ? <Loader2 size={24} className="animate-spin text-stone-300" /> : getMoodIcon(log.moodLevel)}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isAnalyzing ? 'opacity-30' : 'opacity-40'}`}>
                                            {log.theme}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-40">
                                        <Clock size={10} />
                                        <span className="text-[10px] font-mono">
                                            {new Date(log.timestamp).toLocaleTimeString('zh-TW', {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
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
                                    {!isAnalyzing && log.moodLevel > 80 && <Sparkles size={10} className="text-amber-500 ml-auto animate-pulse" />}
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
