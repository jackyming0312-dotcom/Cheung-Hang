
import React, { useState, useMemo } from 'react';
import { CommunityLog, EnergyCardData, GeminiAnalysisResult } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Clock, Loader2, Trash2, Sparkles, X, Heart, RefreshCw, Eraser, Footprints, Moon, Sun, Star } from 'lucide-react';
import EnergyCard from './EnergyCard';

interface CommunityBoardProps {
  logs: CommunityLog[];
  onBack: () => void;
  onClearDay: () => void;
  onDeleteLog: (id: string) => void;
  onRefresh: () => void;
  isSyncing: boolean;
  onGenerateSyncLink: () => void;
}

const NOTE_THEMES = [
  { bg: 'bg-[#fff9e6]', border: 'border-amber-200', text: 'text-amber-900', icon: <Star size={12} />, accent: 'text-amber-500' },
  { bg: 'bg-[#f0fff4]', border: 'border-emerald-200', text: 'text-emerald-900', icon: <Footprints size={12} />, accent: 'text-emerald-500' },
  { bg: 'bg-[#f5f3ff]', border: 'border-indigo-200', text: 'text-indigo-900', icon: <Moon size={12} />, accent: 'text-indigo-500' },
  { bg: 'bg-[#fff5f5]', border: 'border-rose-200', text: 'text-rose-900', icon: <Heart size={12} />, accent: 'text-rose-500' },
  { bg: 'bg-[#f0f9ff]', border: 'border-blue-200', text: 'text-blue-900', icon: <Sun size={12} />, accent: 'text-blue-500' },
];

const CommunityBoard: React.FC<CommunityBoardProps> = ({ logs, onBack, onClearDay, onDeleteLog, onRefresh, isSyncing }) => {
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
      if (avg > 70) return "暖心療癒";
      if (avg > 40) return "寧靜安穩";
      return "需要溫柔";
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
                            analysis={activeCard.replyMessage ? { replyMessage: activeCard.replyMessage, tags: activeCard.tags } as GeminiAnalysisResult : null}
                        />
                    </div>
                </div>
            </div>
        )}

        <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-stone-800 serif-font tracking-tight">靈魂燈火：心聲長廊</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
                 {collectiveMood && (
                    <div className="flex items-center gap-1.5 px-3 py-0.5 bg-white/60 rounded-full border border-stone-100 shadow-sm">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">今日場域</span>
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1"><Heart size={10}/> {collectiveMood}</span>
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
               <button onClick={onClearDay} className="p-1.5 rounded-full text-stone-300 hover:text-rose-400 hover:bg-rose-50 transition-colors" title="清除今日紀錄">
                  <Eraser size={14} />
               </button>
            )}
        </div>

        <div className="w-full flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[300px]">
            {displayLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 py-10 bg-white/30 rounded-[2rem] border border-dashed border-stone-200 mx-4">
                    <p className="font-medium text-stone-400 text-sm italic">此處目前靜悄悄的...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 pb-6 px-1">
                    {displayLogs.map((log, index) => {
                        const isAnalyzing = log.tags.includes("同步中") || log.theme === "感應中...";
                        // 確保每個 Log 都有穩定的視覺樣式
                        const theme = NOTE_THEMES[index % NOTE_THEMES.length];
                        
                        return (
                            <div key={log.id} className="relative group animate-soft-in">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onDeleteLog(log.id); }}
                                  className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-md text-stone-300 hover:text-rose-500 hover:scale-110 z-20 transition-all opacity-0 group-hover:opacity-100 border border-stone-100"
                                >
                                  <Trash2 size={12} />
                                </button>
                                
                                <div 
                                    onClick={() => !isAnalyzing && log.fullCard && setActiveCard(log)} 
                                    className={`
                                        p-6 rounded-[1.8rem] border transition-all duration-500 flex flex-col gap-4 relative overflow-hidden
                                        ${isAnalyzing 
                                            ? 'bg-stone-50 border-stone-200 cursor-default' 
                                            : 'bg-white border-stone-100 hover:shadow-xl hover:-translate-y-1 cursor-pointer shadow-sm'}
                                    `}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm`} style={{ backgroundColor: log.authorColor || '#8d7b68' }}>
                                                {log.authorSignature?.substring(0, 1) || '旅'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-stone-800">{log.authorSignature || "旅人"}</span>
                                                <span className="text-[8px] font-mono text-stone-300 flex items-center gap-1 uppercase tracking-tighter">
                                                    <Clock size={8} /> {new Date(log.timestamp).toLocaleTimeString('zh-TW', {hour: '2-digit', minute:'2-digit'})} • {log.deviceType}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${isAnalyzing ? 'bg-stone-100 text-stone-300' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {log.theme}
                                        </div>
                                    </div>

                                    <div className="relative pl-5 border-l-2 border-stone-100 py-1">
                                        <p className={`text-base font-medium leading-relaxed serif-font italic ${isAnalyzing ? 'text-stone-300' : 'text-stone-700'}`}>
                                            {log.text}
                                        </p>
                                    </div>

                                    <div className={`
                                      mt-2 p-6 rounded-[1.5rem] transition-all duration-1000 relative shadow-inner-lg
                                      ${isAnalyzing ? 'bg-stone-50 animate-pulse' : `${theme.bg} border border-dashed ${theme.border} transform rotate-[0.5deg]`}
                                    `}>
                                        {isAnalyzing ? (
                                            <div className="flex items-center gap-3 text-stone-300">
                                                <Loader2 size={14} className="animate-spin" />
                                                <span className="text-[10px] font-bold italic">亨仔正在為你提筆留言...</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                   <div className="flex items-center gap-2 opacity-40">
                                                      {theme.icon}
                                                      <span className={`text-[9px] font-black ${theme.text} uppercase tracking-widest`}>Bear's Healing Art</span>
                                                   </div>
                                                   <div className="w-6 h-6 rounded-full border border-stone-200/50 flex items-center justify-center opacity-30 rotate-12">
                                                      <Sparkles size={10} />
                                                   </div>
                                                </div>
                                                
                                                <p className={`text-[15px] handwriting-font leading-relaxed font-bold ${theme.text}`}>
                                                   {log.replyMessage || "亨仔聽到了，這份心情很珍貴。"}
                                                </p>
                                                
                                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-stone-900/5">
                                                    {log.tags.map((t, idx) => (
                                                        <span key={idx} className={`
                                                            text-[9px] px-2 py-0.5 rounded-md font-bold tracking-tight
                                                            ${theme.bg} border ${theme.border} ${theme.text} opacity-70
                                                            hover:opacity-100 transition-opacity
                                                        `}>
                                                            {t.startsWith('#') ? t : `#${t}`}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* 裝飾性的小細節 */}
                                                <div className="absolute -bottom-2 -right-1 opacity-20 pointer-events-none">
                                                    <Star className={theme.accent} size={24} fill="currentColor" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        <button onClick={onBack} className="w-full max-w-xs px-6 py-4 bg-stone-800 text-white rounded-2xl font-bold shadow-[0_4px_0_rgb(44,40,36)] active:translate-y-[4px] mt-4 mb-2 text-sm tracking-widest uppercase">
            離開長廊
        </button>
    </div>
  );
};

export default CommunityBoard;
