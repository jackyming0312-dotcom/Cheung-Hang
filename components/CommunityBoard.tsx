
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CommunityLog, GeminiAnalysisResult } from '../types';
import { RefreshCw, X, Trash2, Smartphone, Tablet, Monitor, Radio, MapPin, Calendar as CalendarIcon, Zap, Flower, Moon, Sun, Cloud, Coffee, Music, Heart, Star, Leaf, Anchor, ChevronLeft, ChevronRight } from 'lucide-react';
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

const getIconComponent = (iconName?: string) => {
  const size = 32;
  const color = "rgba(0,0,0,0.08)";
  switch (iconName) {
    case 'Flower': return <Flower size={size} color={color} />;
    case 'Moon': return <Moon size={size} color={color} />;
    case 'Sun': return <Sun size={size} color={color} />;
    case 'Cloud': return <Cloud size={size} color={color} />;
    case 'Coffee': return <Coffee size={size} color={color} />;
    case 'Music': return <Music size={size} color={color} />;
    case 'Heart': return <Heart size={size} color={color} />;
    case 'Star': return <Star size={size} color={color} />;
    case 'Leaf': return <Leaf size={size} color={color} />;
    case 'Anchor': return <Anchor size={size} color={color} />;
    default: return <Heart size={size} color={color} />;
  }
};

const getDeviceIcon = (device?: string) => {
    const size = 10;
    if (!device) return <Monitor size={size} />;
    const d = device.toLowerCase();
    if (d.includes('iphone')) return <Smartphone size={size} />;
    if (d.includes('ipad')) return <Tablet size={size} />;
    if (d.includes('android')) return <Smartphone size={size} />;
    return <Monitor size={size} />;
};

const CommunityBoard: React.FC<CommunityBoardProps> = ({ logs, onBack, onDeleteLog, onRefresh, isSyncing }) => {
  const [activeCard, setActiveCard] = useState<CommunityLog | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. 按日期分組資料
  const groupedLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => {
      const tA = a.localTimestamp || (a.timestamp ? new Date(a.timestamp).getTime() : 0);
      const tB = b.localTimestamp || (b.timestamp ? new Date(b.timestamp).getTime() : 0);
      return tB - tA;
    });

    const groups: { [key: string]: CommunityLog[] } = {};
    sorted.forEach(log => {
        const date = new Date(log.timestamp || log.localTimestamp).toLocaleDateString('zh-TW', { 
            month: 'long', 
            day: 'numeric',
            weekday: 'short'
        });
        if (!groups[date]) groups[date] = [];
        groups[date].push(log);
    });
    return groups;
  }, [logs]);

  // 所有可用的日期鍵
  const dateKeys = useMemo(() => Object.keys(groupedLogs), [groupedLogs]);

  // 初始化選擇最新的日期
  useEffect(() => {
    if (dateKeys.length > 0 && !selectedDateKey) {
      setSelectedDateKey(dateKeys[0]);
    }
  }, [dateKeys, selectedDateKey]);

  const filteredLogs = selectedDateKey ? groupedLogs[selectedDateKey] || [] : [];

  return (
    <div className="w-full flex flex-col items-center animate-soft-in h-full relative">
        {activeCard && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-md animate-soft-in">
                <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto custom-scrollbar py-6">
                    <button onClick={() => setActiveCard(null)} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-2xl z-[1001] text-stone-400 hover:text-stone-800 transition-colors">
                        <X size={20} />
                    </button>
                    {activeCard.fullCard && (
                        <EnergyCard 
                            data={activeCard.fullCard} 
                            moodLevel={activeCard.moodLevel}
                            analysis={activeCard.replyMessage ? { replyMessage: activeCard.replyMessage, tags: activeCard.tags } as GeminiAnalysisResult : null}
                            moodLevelDisplay={activeCard.moodLevel}
                        />
                    )}
                </div>
            </div>
        )}

        {/* 標題與狀態 */}
        <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-stone-800 serif-font tracking-tight italic">心靈日曆長廊</h2>
            <div className="flex items-center justify-center gap-3 mt-3">
                 <div className="flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full border border-stone-100 shadow-sm backdrop-blur-sm">
                    <Radio size={10} className="text-emerald-500 fill-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest leading-none">跨裝置即時同步</span>
                 </div>
                 <button onClick={onRefresh} className={`p-1.5 rounded-full hover:bg-white/80 transition-colors ${isSyncing ? 'animate-spin text-amber-500' : 'text-stone-400'}`}>
                    <RefreshCw size={14} />
                 </button>
            </div>
        </div>

        {/* 2. 互動式日期導覽列 (Time Navigator) */}
        <div className="w-full mb-8 relative px-2">
            <div 
              ref={scrollRef}
              className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-3 scroll-smooth no-scrollbar"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
                {dateKeys.length === 0 ? (
                   <div className="w-full text-center py-2 text-[10px] text-stone-300 font-bold uppercase tracking-widest">載入歷史紀錄中...</div>
                ) : (
                  dateKeys.map((date) => (
                    <button
                        key={date}
                        onClick={() => setSelectedDateKey(date)}
                        className={`
                            flex-shrink-0 px-5 py-2.5 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-1
                            ${selectedDateKey === date 
                                ? 'bg-stone-800 border-stone-800 text-white shadow-lg scale-105' 
                                : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200'}
                        `}
                    >
                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">
                            {date.split('（')[1]?.replace('）', '') || 'DAY'}
                        </span>
                        <span className="text-xs font-bold whitespace-nowrap">
                            {date.split('（')[0]}
                        </span>
                        {groupedLogs[date].some(l => l.moodLevel > 80) && (
                            <div className={`w-1 h-1 rounded-full mt-1 ${selectedDateKey === date ? 'bg-amber-300' : 'bg-amber-400 animate-pulse'}`}></div>
                        )}
                    </button>
                  ))
                )}
            </div>
        </div>

        {/* 3. 心聲內容顯示區 */}
        <div className="w-full flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[420px] pb-10">
            {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 py-16 bg-stone-50/40 rounded-[3rem] border-2 border-dashed border-stone-200 mx-2 animate-soft-in">
                    <MapPin size={32} className="text-stone-200 mb-4" />
                    <p className="font-bold italic text-stone-500">這天還沒有心聲喔</p>
                    <p className="text-[10px] mt-2 text-stone-400 text-center px-10 leading-relaxed uppercase tracking-widest">
                        這裡等待著第一位旅人的故事。<br/>點擊返回，分享你的此刻。
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 px-2 animate-soft-in">
                    {filteredLogs.map((log) => (
                        <div 
                            key={log.id} 
                            onClick={() => log.fullCard && setActiveCard(log)}
                            className="group relative p-6 rounded-[2.5rem] border border-stone-200/50 shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden flex flex-col gap-4 transform hover:-translate-y-1"
                            style={{ backgroundColor: log.authorColor || '#FFFFFF' }}
                        >
                            {/* 裝飾背景圖標 */}
                            <div className="absolute -top-1 -right-1 opacity-40 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
                                {getIconComponent(log.authorIcon)}
                            </div>

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-lg bg-stone-800 transform rotate-2 group-hover:rotate-0 transition-transform">
                                        {log.authorSignature?.substring(0, 1) || '旅'}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-stone-900 tracking-tight">{log.authorSignature}</span>
                                        <div className="flex items-center gap-2 mt-0.5 opacity-60">
                                            <div className="flex items-center gap-1 px-1 bg-white/60 rounded text-stone-600 border border-black/5">
                                                {getDeviceIcon(log.deviceType)}
                                                <span className="text-[7px] font-black uppercase tracking-tighter leading-none">{log.deviceType || '裝置'}</span>
                                            </div>
                                            <span className="text-[8px] font-mono font-bold">
                                                {new Date(log.timestamp || log.localTimestamp).toLocaleTimeString('zh-TW', {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 心情能量計 */}
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1.5 mb-1.5 text-stone-800">
                                        <Zap size={10} className={log.moodLevel > 70 ? "text-amber-500 fill-amber-500" : ""} />
                                        <span className="text-[10px] font-black font-mono tracking-tighter">{log.moodLevel}%</span>
                                    </div>
                                    <div className="w-16 h-2 bg-black/5 rounded-full overflow-hidden border border-black/5 p-0.5">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${log.moodLevel > 60 ? 'bg-emerald-500' : log.moodLevel > 30 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                            style={{ width: `${log.moodLevel}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative pl-4 border-l-2 border-black/10 z-10">
                                <p className="text-base font-medium leading-relaxed serif-font italic text-stone-800/90">
                                    {log.text}
                                </p>
                            </div>

                            {/* Hashtags 根據內容動態生成 */}
                            <div className="flex flex-wrap gap-2 mt-1 z-10">
                                {log.tags?.map((tag, i) => (
                                    <span key={i} className="text-[9px] font-black text-stone-900/40 bg-white/40 px-2 py-1 rounded-xl border border-black/5 backdrop-blur-sm">
                                        {tag.startsWith('#') ? tag : `#${tag}`}
                                    </span>
                                ))}
                            </div>

                            <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteLog(log.id); }}
                                className="absolute bottom-6 right-6 p-2 text-stone-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <button onClick={onBack} className="w-full max-w-xs px-8 py-5 bg-stone-800 text-white rounded-[2rem] font-black shadow-[0_6px_0_rgb(44,40,36)] active:translate-y-[6px] transition-all mt-6 mb-2 text-xs tracking-[0.4em] uppercase">
            回到首頁
        </button>
    </div>
  );
};

export default CommunityBoard;
