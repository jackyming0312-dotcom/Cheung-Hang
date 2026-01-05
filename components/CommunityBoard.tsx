
import React, { useState, useMemo } from 'react';
import { CommunityLog, GeminiAnalysisResult } from '../types';
import { Clock, RefreshCw, X, Trash2, Smartphone, Tablet, Monitor, Radio, CheckCircle, MapPin, Calendar as CalendarIcon, Zap } from 'lucide-react';
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

const getDeviceIcon = (device?: string) => {
    if (!device) return <Monitor size={10} />;
    const d = device.toLowerCase();
    if (d.includes('iphone')) return <Smartphone size={10} />;
    if (d.includes('ipad')) return <Tablet size={10} />;
    if (d.includes('android')) return <Smartphone size={10} />;
    return <Monitor size={10} />;
};

const CommunityBoard: React.FC<CommunityBoardProps> = ({ logs, onBack, onDeleteLog, onRefresh, isSyncing }) => {
  const [activeCard, setActiveCard] = useState<CommunityLog | null>(null);

  // 按日期分組心聲
  const groupedLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => {
      const tA = a.localTimestamp || (a.timestamp ? new Date(a.timestamp).getTime() : 0);
      const tB = b.localTimestamp || (b.timestamp ? new Date(b.timestamp).getTime() : 0);
      return tB - tA;
    });

    const groups: { [key: string]: CommunityLog[] } = {};
    sorted.forEach(log => {
        const date = new Date(log.timestamp || log.localTimestamp).toLocaleDateString('zh-TW', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'short'
        });
        if (!groups[date]) groups[date] = [];
        groups[date].push(log);
    });
    return groups;
  }, [logs]);

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

        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-stone-800 serif-font tracking-tight italic">心靈日曆長廊</h2>
            <div className="flex items-center justify-center gap-3 mt-3">
                 <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 rounded-full border border-amber-100 shadow-sm">
                    <Radio size={12} className="text-amber-500 fill-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">實時同步中</span>
                 </div>
                 <button onClick={onRefresh} className={`p-2 rounded-full hover:bg-stone-100 transition-colors ${isSyncing ? 'animate-spin text-amber-500' : 'text-stone-400'}`}>
                    <RefreshCw size={16} />
                 </button>
            </div>
        </div>

        <div className="w-full flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[420px] pb-10">
            {Object.keys(groupedLogs).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 py-16 bg-stone-50/40 rounded-[3rem] border-2 border-dashed border-stone-200 mx-4">
                    <MapPin size={32} className="text-stone-200 mb-4" />
                    <p className="font-bold italic text-stone-500">尚無留言紀錄</p>
                    <p className="text-[10px] mt-2 text-stone-400 text-center px-10 leading-relaxed uppercase tracking-widest">這裡將會顯示當日所有人的心聲同步牆</p>
                </div>
            ) : (
                <div className="flex flex-col gap-10">
                    {Object.entries(groupedLogs).map(([date, items]) => (
                        <div key={date} className="space-y-4">
                            <div className="flex items-center gap-3 px-4 py-2 sticky top-0 bg-stone-50/90 backdrop-blur-sm z-30 rounded-full border border-stone-100 shadow-sm mx-2">
                                <CalendarIcon size={14} className="text-stone-500" />
                                <span className="text-[11px] font-black text-stone-600 tracking-widest uppercase">{date}</span>
                                <div className="ml-auto flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[9px] font-bold text-stone-400">{items.length} 則心聲</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4 px-1">
                                {items.map((log) => (
                                    <div 
                                        key={log.id} 
                                        onClick={() => log.fullCard && setActiveCard(log)}
                                        className="group relative bg-white p-5 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col gap-3"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[10px] font-bold shadow-md transform -rotate-3 group-hover:rotate-0 transition-transform" style={{ backgroundColor: log.authorColor || '#8d7b68' }}>
                                                    {log.authorSignature?.substring(0, 1) || '旅'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-stone-800">{log.authorSignature}</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <div className="flex items-center gap-1 px-1 bg-stone-50 rounded text-stone-400 border border-stone-100">
                                                            {getDeviceIcon(log.deviceType)}
                                                            <span className="text-[7px] font-black uppercase tracking-tighter leading-none">{log.deviceType || '未知'}</span>
                                                        </div>
                                                        <span className="text-[8px] font-mono text-stone-300">
                                                            {new Date(log.timestamp || log.localTimestamp).toLocaleTimeString('zh-TW', {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 重點：手動輸入的心情能量顯示 */}
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1 mb-1 text-stone-400">
                                                    <Zap size={10} className={log.moodLevel > 70 ? "text-amber-400 fill-amber-400" : ""} />
                                                    <span className="text-[10px] font-black font-mono">{log.moodLevel}%</span>
                                                </div>
                                                <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden border border-stone-100">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ${log.moodLevel > 60 ? 'bg-emerald-400' : log.moodLevel > 30 ? 'bg-amber-400' : 'bg-rose-400'}`}
                                                        style={{ width: `${log.moodLevel}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative pl-3 border-l-2 border-stone-100">
                                            <p className="text-sm font-medium leading-relaxed serif-font italic text-stone-700">
                                                {log.text}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {log.tags?.map((tag, i) => (
                                                <span key={i} className="text-[9px] font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded-lg border border-stone-100">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeleteLog(log.id); }}
                                            className="absolute bottom-4 right-4 p-2 text-stone-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <button onClick={onBack} className="w-full max-w-xs px-8 py-5 bg-stone-800 text-white rounded-[2rem] font-black shadow-[0_6px_0_rgb(44,40,36)] active:translate-y-[6px] transition-all mt-4 mb-2 text-xs tracking-[0.3em] uppercase">
            離開日曆
        </button>
    </div>
  );
};

export default CommunityBoard;
