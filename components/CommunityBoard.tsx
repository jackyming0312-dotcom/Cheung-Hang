
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CommunityLog, GeminiAnalysisResult } from '../types';
import { RefreshCw, X, Trash2, Smartphone, Tablet, Monitor, Radio, MapPin, Zap, Flower, Moon, Sun, Cloud, Coffee, Music, Heart, Star, Leaf, Anchor } from 'lucide-react';
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
  const size = 52;
  const color = "rgba(74, 64, 54, 0.04)"; 
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
        const d = new Date(log.timestamp || log.localTimestamp);
        const dateKey = d.toLocaleDateString('zh-TW', { 
            month: 'long', 
            day: 'numeric',
            weekday: 'short'
        });
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(log);
    });
    return groups;
  }, [logs]);

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
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md animate-soft-in">
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

        {/* 頂部標題與狀態 */}
        <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-stone-800 serif-font tracking-tight italic">時光導覽長廊</h2>
            <div className="flex items-center justify-center gap-3 mt-2">
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-white/60 rounded-full border border-stone-100 shadow-sm">
                    <Radio size={10} className="text-emerald-500 fill-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest leading-none">實時連線中</span>
                 </div>
                 <button onClick={onRefresh} className={`p-1 transition-all ${isSyncing ? 'animate-spin text-amber-500' : 'text-stone-300 hover:text-stone-800'}`}>
                    <RefreshCw size={14} />
                 </button>
            </div>
        </div>

        {/* 2. 橫向滾動日期導覽列 */}
        <div className="w-full mb-8 px-1 overflow-hidden">
            <div 
              ref={scrollRef}
              className="flex items-center gap-3 overflow-x-auto pb-4 px-2 no-scrollbar scroll-smooth"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {dateKeys.length === 0 ? (
                   <div className="w-full text-center py-4 text-[10px] text-stone-200 font-bold uppercase tracking-[0.4em]">正在尋回歷史記憶...</div>
                ) : (
                  dateKeys.map((date) => (
                    <button
                        key={date}
                        onClick={() => setSelectedDateKey(date)}
                        className={`
                            flex-shrink-0 px-6 py-3 rounded-2xl border transition-all duration-500 flex flex-col items-center gap-0.5
                            ${selectedDateKey === date 
                                ? 'bg-stone-800 border-stone-800 text-white shadow-xl scale-105' 
                                : 'bg-white/80 border-stone-100 text-stone-400 hover:border-stone-300'}
                        `}
                    >
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                            {date.split('（')[1]?.replace('）', '') || 'WEEK'}
                        </span>
                        <span className="text-sm font-bold whitespace-nowrap serif-font">
                            {date.split('（')[0]}
                        </span>
                        {groupedLogs[date].length > 0 && (
                            <div className={`w-1 h-1 rounded-full mt-1 ${selectedDateKey === date ? 'bg-amber-300' : 'bg-stone-200'}`}></div>
                        )}
                    </button>
                  ))
                )}
            </div>
        </div>

        {/* 3. 心聲內容顯示區：顯示手動情緒能量 */}
        <div className="w-full flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[400px] pb-10">
            {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 py-20 bg-stone-50/30 rounded-[3rem] border-2 border-dashed border-stone-100 mx-2 animate-soft-in">
                    <MapPin size={32} className="text-stone-100 mb-4" />
                    <p className="font-bold italic text-stone-300 serif-font">這一天還靜悄悄的</p>
                    <p className="text-[10px] mt-2 text-stone-300 text-center px-10 leading-relaxed uppercase tracking-widest">
                        點擊返回，成為這天的第一道微光。
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6 px-2 animate-soft-in">
                    {filteredLogs.map((log) => (
                        <div 
                            key={log.id} 
                            onClick={() => log.fullCard && setActiveCard(log)}
                            className="group relative p-6 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col gap-4"
                        >
                            {/* 裝飾水印 */}
                            <div className="absolute -top-2 -right-2 opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                                {getIconComponent(log.authorIcon)}
                            </div>

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-md bg-stone-800 transform rotate-2 group-hover:rotate-0 transition-transform">
                                        {log.authorSignature?.substring(0, 1) || '旅'}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-stone-800 tracking-tight">{log.authorSignature}</span>
                                        <div className="flex items-center gap-2 mt-0.5 opacity-60">
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-stone-50 rounded-lg text-stone-400 border border-stone-100">
                                                {getDeviceIcon(log.deviceType)}
                                                <span className="text-[7px] font-black uppercase tracking-tighter leading-none">{log.deviceType || '未知'}</span>
                                            </div>
                                            <span className="text-[8px] font-mono font-bold text-stone-300">
                                                {new Date(log.timestamp || log.localTimestamp).toLocaleTimeString('zh-TW', {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 即時手動情緒能量顯示 */}
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <Zap size={12} className={log.moodLevel > 70 ? "text-amber-400 fill-amber-400" : "text-stone-300"} />
                                        <span className="text-[11px] font-black font-mono tracking-tighter text-stone-800">{log.moodLevel}%</span>
                                    </div>
                                    <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${log.moodLevel > 60 ? 'bg-emerald-400' : log.moodLevel > 30 ? 'bg-amber-400' : 'bg-rose-400'}`}
                                            style={{ width: `${log.moodLevel}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative pl-4 border-l-2 border-stone-100 z-10">
                                <p className="text-base font-medium leading-relaxed serif-font italic text-stone-700/90">
                                    {log.text}
                                </p>
                            </div>

                            {/* 動態生成的 Hashtags */}
                            <div className="flex flex-wrap gap-2 mt-1 z-10">
                                {log.tags?.map((tag, i) => (
                                    <span key={i} className="text-[9px] font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded-xl border border-stone-100">
                                        {tag.startsWith('#') ? tag : `#${tag}`}
                                    </span>
                                ))}
                            </div>

                            <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteLog(log.id); }}
                                className="absolute bottom-6 right-6 p-2 text-stone-50 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity z-20"
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
