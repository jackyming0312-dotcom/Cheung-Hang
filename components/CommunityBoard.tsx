
import React, { useState, useMemo } from 'react';
import { CommunityLog, EnergyCardData, GeminiAnalysisResult } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Clock, RefreshCw, X, Heart, Trash2, Sun, Moon, Sparkles, Leaf, Stars, Monitor, Smartphone, Tablet, Radio } from 'lucide-react';
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

const STYLE_THEMES = {
  warm: { bg: 'bg-[#fff9e6]', border: 'border-amber-200', text: 'text-amber-900', accent: 'text-amber-500' },
  fresh: { bg: 'bg-[#f0fff4]', border: 'border-emerald-200', text: 'text-emerald-900', accent: 'text-emerald-500' },
  calm: { bg: 'bg-[#f5f3ff]', border: 'border-indigo-200', text: 'text-indigo-900', accent: 'text-indigo-500' },
  energetic: { bg: 'bg-[#fff5f5]', border: 'border-rose-200', text: 'text-rose-900', accent: 'text-rose-500' },
  dreamy: { bg: 'bg-[#f0f9ff]', border: 'border-blue-200', text: 'text-blue-900', accent: 'text-blue-500' },
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDeviceIcon = (device?: string) => {
    if (!device) return <Monitor size={10} />;
    const d = device.toLowerCase();
    if (d.includes('iphone')) return <Smartphone size={10} />;
    if (d.includes('ipad')) return <Tablet size={10} />;
    if (d.includes('android')) return <Smartphone size={10} />;
    return <Monitor size={10} />;
};

const CommunityBoard: React.FC<CommunityBoardProps> = ({ logs, onBack, onDeleteLog, onRefresh, isSyncing }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // null 代表 LIVE 實時串流
  const [activeCard, setActiveCard] = useState<CommunityLog | null>(null);
  
  const targetDateKey = selectedDate ? formatDateKey(selectedDate) : null;

  // 核心改動：LIVE 模式下完全不進行日期過濾，只進行即時排序
  const displayLogs = useMemo(() => {
    let result = [...logs];
    
    if (targetDateKey) {
      result = result.filter(log => {
        if (!log.timestamp) return false;
        try {
          const logDate = new Date(log.timestamp);
          return formatDateKey(logDate) === targetDateKey;
        } catch (e) {
          return false;
        }
      });
    }

    // 毫秒級排序，確保剛發出的內容永遠在最上方
    return result.sort((a, b) => {
      const tA = (a as any).localTimestamp || new Date(a.timestamp).getTime();
      const tB = (b as any).localTimestamp || new Date(b.timestamp).getTime();
      return tB - tA;
    });
  }, [logs, targetDateKey]);

  return (
    <div className="w-full flex flex-col items-center animate-soft-in h-full relative">
        {activeCard && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-soft-in">
                <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <button onClick={() => setActiveCard(null)} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg z-[1001] text-stone-400">
                        <X size={20} />
                    </button>
                    <div className="py-8">
                        {activeCard.fullCard && (
                            <EnergyCard 
                                data={activeCard.fullCard} 
                                moodLevel={activeCard.moodLevel}
                                analysis={activeCard.replyMessage ? { replyMessage: activeCard.replyMessage, tags: activeCard.tags } as GeminiAnalysisResult : null}
                            />
                        )}
                    </div>
                </div>
            </div>
        )}

        <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-stone-800 serif-font tracking-tight">靈魂燈火：心聲長廊</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
                 <div className="flex items-center gap-1.5 px-3 py-0.5 bg-white/60 rounded-full border border-stone-100 shadow-sm">
                    {selectedDate === null ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">
                            <Radio size={10} className="fill-current" /> Live 串流中
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">歷史檔案</span>
                    )}
                 </div>
            </div>
        </div>

        <div className="flex items-center gap-2 mb-6 bg-white/50 px-3 py-2 rounded-full border border-stone-200 shadow-sm">
            <button 
                onClick={() => {
                    const d = selectedDate || new Date();
                    const nd = new Date(d);
                    nd.setDate(nd.getDate() - 1);
                    setSelectedDate(nd);
                }} 
                className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-600"
            >
                <ChevronLeft size={18} />
            </button>
            <button 
                onClick={() => setSelectedDate(null)}
                className={`flex items-center gap-2 font-medium min-w-[140px] justify-center transition-all ${selectedDate === null ? 'text-amber-600 scale-105' : 'text-stone-700'}`}
            >
                <Calendar size={14} className={selectedDate === null ? 'text-amber-500' : 'text-stone-400'} />
                <span className="text-[11px] font-bold">
                    {selectedDate ? selectedDate.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' }) : "最新實時動態"}
                </span>
            </button>
            <button 
              onClick={() => {
                if (!selectedDate) return;
                const nd = new Date(selectedDate);
                nd.setDate(nd.getDate() + 1);
                if (nd >= new Date()) setSelectedDate(null);
                else setSelectedDate(nd);
              }} 
              disabled={selectedDate === null} 
              className={`p-1 rounded-full transition-colors ${selectedDate === null ? 'text-stone-300 cursor-not-allowed' : 'text-stone-600 hover:bg-stone-200'}`}
            >
                <ChevronRight size={18} />
            </button>
            <div className="h-4 w-[1px] bg-stone-200 mx-1"></div>
            <button onClick={onRefresh} className={`p-1.5 rounded-full hover:bg-stone-100 ${isSyncing ? 'text-amber-500 animate-spin' : 'text-stone-400'}`}>
                <RefreshCw size={14} />
            </button>
        </div>

        <div className="w-full flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[300px]">
            {displayLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 py-10 bg-white/30 rounded-[2rem] border border-dashed border-stone-200 mx-4">
                    <p className="font-medium text-stone-400 text-sm italic">此處目前靜悄悄的...</p>
                    <p className="text-[10px] text-stone-300 mt-2 text-center px-6">在手機或 iPad 輸入後，<br/>心聲會跨裝置即時出現在這裡。</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 pb-6 px-1">
                    {displayLogs.map((log) => {
                        const styleHint = log.fullCard?.styleHint || 'warm';
                        const theme = STYLE_THEMES[styleHint as keyof typeof STYLE_THEMES] || STYLE_THEMES.warm;
                        
                        return (
                            <div key={log.id} className="relative group animate-soft-in">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onDeleteLog(log.id); }}
                                  className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-md text-stone-300 hover:text-rose-500 hover:scale-110 z-20 transition-all opacity-0 group-hover:opacity-100 border border-stone-100"
                                >
                                  <Trash2 size={12} />
                                </button>
                                
                                <div 
                                    onClick={() => log.fullCard && setActiveCard(log)} 
                                    className="p-6 rounded-[1.8rem] border transition-all duration-500 flex flex-col gap-4 relative overflow-hidden bg-white border-stone-100 hover:shadow-xl hover:-translate-y-1 cursor-pointer shadow-sm"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm" style={{ backgroundColor: log.authorColor || '#8d7b68' }}>
                                                {log.authorSignature?.substring(0, 1) || '旅'}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-stone-800">{log.authorSignature}</span>
                                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-stone-100 rounded-md text-stone-500 shadow-inner">
                                                        {getDeviceIcon(log.deviceType)}
                                                        <span className="text-[8px] font-black uppercase tracking-tighter leading-none">{log.deviceType}</span>
                                                    </div>
                                                </div>
                                                <span className="text-[8px] font-mono text-stone-300 flex items-center gap-1 uppercase">
                                                    <Clock size={8} /> {new Date(log.timestamp).toLocaleTimeString('zh-TW', {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border bg-amber-50/50 text-amber-600 border-amber-100/50">
                                            {log.theme}
                                        </div>
                                    </div>

                                    <div className="relative pl-5 border-l-2 border-stone-100 py-1">
                                        <p className="text-base font-medium leading-relaxed serif-font italic text-stone-700">
                                            {log.text}
                                        </p>
                                    </div>

                                    <div className={`mt-2 p-5 rounded-[1.5rem] ${theme.bg} border border-dashed ${theme.border} transform rotate-[0.5deg]`}>
                                        <p className={`text-[14px] leading-relaxed handwriting-font font-bold ${theme.text}`}>
                                            {log.replyMessage || "亨仔正在細細品讀..."}
                                        </p>
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
