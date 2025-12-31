
import React, { useState, useMemo } from 'react';
import { CommunityLog, EnergyCardData, GeminiAnalysisResult } from '../types';
import { ChevronLeft, ChevronRight, Calendar, PenLine, Clock, Loader2, Trash2, Sparkles, X, Smartphone, Tablet, Monitor, RefreshCw, Eraser } from 'lucide-react';
import EnergyCard from './EnergyCard';

interface CommunityBoardProps {
  logs: CommunityLog[];
  onBack: () => void;
  onClearDay: () => void;
  onDeleteLog: (docId: string) => void;
  onRefresh: () => void;
  isSyncing: boolean;
  onGenerateSyncLink: () => void;
}

const CommunityBoard: React.FC<CommunityBoardProps> = ({ logs, onBack, onClearDay, onDeleteLog, onRefresh, isSyncing, onGenerateSyncLink }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeCard, setActiveCard] = useState<CommunityLog | null>(null);
  
  const targetDateStr = selectedDate.toLocaleDateString();

  const displayLogs = useMemo(() => {
    return logs
      .filter(log => new Date(log.timestamp).toLocaleDateString() === targetDateStr)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [targetDateStr, logs]);

  const collectiveMood = useMemo(() => {
      if (displayLogs.length === 0) return null;
      const avg = displayLogs.reduce((acc, log) => acc + log.moodLevel, 0) / displayLogs.length;
      if (avg > 70) return "充滿暖意";
      if (avg > 40) return "平靜沉穩";
      return "需要抱抱";
  }, [displayLogs]);

  const changeDate = (offset: number) => {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + offset);
      if (newDate > new Date()) return;
      setSelectedDate(newDate);
  };

  const isToday = selectedDate.toLocaleDateString() === new Date().toLocaleDateString();

  return (
    <div className="w-full flex flex-col items-center animate-soft-in h-full relative">
        {activeCard && activeCard.fullCard && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-soft-in">
                <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <button onClick={() => setActiveCard(null)} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg z-[1001] text-stone-400 active:scale-90">
                        <X size={20} />
                    </button>
                    <div className="py-8">
                        <EnergyCard 
                            data={activeCard.fullCard} 
                            moodLevel={activeCard.moodLevel}
                            analysis={activeCard.replyMessage ? { replyMessage: activeCard.replyMessage } as GeminiAnalysisResult : null}
                        />
                    </div>
                </div>
            </div>
        )}

        <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-stone-800 serif-font">靈魂燈火：心聲長廊</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
                 {collectiveMood && (
                    <div className="flex items-center gap-1.5 px-3 py-0.5 bg-white/60 rounded-full border border-stone-100 shadow-sm">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">今日共感</span>
                        <span className="text-[10px] font-bold text-amber-600">{collectiveMood}</span>
                    </div>
                 )}
            </div>
        </div>

        <div className="flex items-center gap-2 mb-6 bg-white/50 px-3 py-2 rounded-full border border-stone-200 shadow-sm">
            <button onClick={() => changeDate(-1)} className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-600">
                <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 text-stone-700 font-medium w-32 justify-center">
                <Calendar size={14} className="text-stone-400" />
                <span className="text-[11px] font-bold">{targetDateStr}</span>
            </div>
            <button onClick={() => changeDate(1)} disabled={isToday} className={`p-1 rounded-full transition-colors ${isToday ? 'text-stone-300 cursor-not-allowed' : 'text-stone-600 hover:bg-stone-200'}`}>
                <ChevronRight size={18} />
            </button>
            
            <div className="h-4 w-[1px] bg-stone-200 mx-1"></div>
            
            <button onClick={onRefresh} className={`p-1.5 rounded-full hover:bg-stone-100 ${isSyncing ? 'text-amber-500 animate-spin' : 'text-stone-400'}`}>
                <RefreshCw size={14} />
            </button>

            {isToday && (
               <button 
                  onClick={onClearDay} 
                  className="p-1.5 rounded-full text-stone-300 hover:text-rose-400 hover:bg-rose-50 transition-colors"
                  title="清除今日紀錄"
               >
                  <Eraser size={14} />
               </button>
            )}
        </div>

        <div className="w-full flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[300px]">
            {displayLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 py-10 bg-white/30 rounded-[2rem] border border-dashed border-stone-200 mx-4">
                    <p className="font-medium text-stone-400 text-sm italic">此處目前靜悄悄的</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 px-1">
                    {displayLogs.map((log) => {
                        const isAnalyzing = log.tags.includes("正在感應") || log.theme === "分析中...";
                        return (
                            <div key={log.id} className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col gap-3 relative overflow-hidden group ${isAnalyzing ? 'bg-stone-50 border-stone-200 animate-pulse' : 'bg-white border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1'}`}>
                                
                                {/* Individual Delete Button */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteLog(log.id); }}
                                    className="absolute top-2 right-2 p-2 text-stone-200 hover:text-rose-400 hover:bg-rose-50 rounded-full transition-all z-20 opacity-0 group-hover:opacity-100"
                                    title="刪除此紀錄"
                                >
                                    <Trash2 size={12} />
                                </button>

                                <div onClick={() => log.fullCard && setActiveCard(log)} className="cursor-pointer flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                               <span className="text-xl">{isAnalyzing ? <Loader2 size={16} className="animate-spin text-stone-300" /> : '✨'}</span>
                                               <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isAnalyzing ? 'text-stone-300' : 'text-stone-400'}`}>
                                                  {log.theme}
                                               </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end opacity-40 pr-6">
                                            <div className="flex items-center gap-1 font-mono text-[9px]">
                                                <Clock size={10} /> {new Date(log.timestamp).toLocaleTimeString('zh-TW', {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    </div>
                                    <p className={`text-sm font-medium leading-relaxed line-clamp-3 serif-font italic ${isAnalyzing ? 'text-stone-300' : 'text-stone-700'}`}>
                                        {log.text}
                                    </p>
                                    <div className="mt-auto pt-3 border-t border-stone-50 flex flex-wrap gap-1.5">
                                        {log.tags.map((t, idx) => (
                                            <span key={idx} className="text-[9px] px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full font-bold">
                                                {t.startsWith('#') ? t : `#${t}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        <button onClick={onBack} className="w-full max-w-xs px-6 py-3.5 bg-stone-800 text-white rounded-xl font-bold shadow-[0_4px_0_rgb(44,40,36)] active:translate-y-[4px] mt-4 mb-2 text-xs">
            返回首頁
        </button>
    </div>
  );
};

export default CommunityBoard;
