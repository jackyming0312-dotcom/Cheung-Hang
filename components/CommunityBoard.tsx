
import React, { useState, useMemo } from 'react';
import { CommunityLog, GeminiAnalysisResult } from '../types';
import { Clock, RefreshCw, X, Trash2, Smartphone, Tablet, Monitor, Radio, CheckCircle, MapPin } from 'lucide-react';
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

  // 排序優化：確保跨裝置的 localTimestamp 能被正確解析，新訊息永遠在最上方
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      const tA = a.localTimestamp || new Date(a.timestamp).getTime();
      const tB = b.localTimestamp || new Date(b.timestamp).getTime();
      return tB - tA;
    });
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
                        />
                    )}
                </div>
            </div>
        )}

        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-stone-800 serif-font tracking-tight italic">靈魂燈火：即時串流牆</h2>
            <div className="flex items-center justify-center gap-3 mt-3">
                 <div className="flex items-center gap-2 px-4 py-1.5 bg-rose-50 rounded-full border border-rose-100 shadow-sm">
                    <Radio size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">iPad/手機 同步中</span>
                 </div>
                 <button onClick={onRefresh} className={`p-2 rounded-full hover:bg-stone-100 transition-colors ${isSyncing ? 'animate-spin text-amber-500' : 'text-stone-400'}`}>
                    <RefreshCw size={16} />
                 </button>
            </div>
        </div>

        <div className="w-full flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[420px] pb-10">
            {sortedLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 py-16 bg-stone-50/40 rounded-[3rem] border-2 border-dashed border-stone-200 mx-4">
                    <div className="p-5 bg-white rounded-full shadow-inner mb-4">
                        <MapPin size={32} className="text-stone-200" />
                    </div>
                    <p className="font-bold italic text-stone-500">心聲正在飛向這裡...</p>
                    <p className="text-[10px] mt-2 text-stone-400 text-center px-10 leading-relaxed uppercase tracking-widest">請在手機或 iPad 輸入訊息，<br/>這裡會立刻跨裝置自動顯示。</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 pb-6 px-1">
                    {sortedLogs.map((log) => {
                        const isLocal = log.id.startsWith('local-');
                        return (
                            <div key={log.id} className="relative group animate-soft-in">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteLog(log.id); }}
                                    className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg text-stone-200 hover:text-rose-500 z-20 transition-all opacity-0 group-hover:opacity-100 border border-stone-100 hover:scale-110"
                                >
                                    <Trash2 size={12} />
                                </button>
                                
                                <div 
                                    onClick={() => log.fullCard && setActiveCard(log)} 
                                    className={`
                                        p-6 rounded-[2.2rem] border transition-all duration-500 flex flex-col gap-4 relative overflow-hidden bg-white shadow-sm hover:shadow-2xl hover:-translate-y-1 cursor-pointer
                                        ${isLocal ? 'border-amber-200 ring-2 ring-amber-100 ring-opacity-50' : 'border-stone-100'}
                                    `}
                                >
                                    {isLocal && (
                                        <div className="absolute top-0 right-0 px-3 py-1 bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-tighter rounded-bl-xl animate-pulse">
                                            傳送中...
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-[12px] font-bold shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform" style={{ backgroundColor: log.authorColor || '#8d7b68' }}>
                                                {log.authorSignature?.substring(0, 1) || '旅'}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-stone-800 tracking-tight">{log.authorSignature}</span>
                                                    {!isLocal && (
                                                        <CheckCircle size={10} className="text-emerald-500 fill-emerald-50" title="已成功儲存至雲端" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-stone-100 rounded text-stone-500 border border-stone-200 shadow-inner">
                                                        {getDeviceIcon(log.deviceType)}
                                                        <span className="text-[8px] font-black uppercase tracking-tighter leading-none">{log.deviceType}</span>
                                                    </div>
                                                    <span className="text-[9px] font-mono text-stone-300 flex items-center gap-1">
                                                        <Clock size={9} /> {new Date(log.timestamp).toLocaleTimeString('zh-TW', {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase border bg-stone-50 text-stone-400 border-stone-100">
                                            {log.theme}
                                        </div>
                                    </div>

                                    <div className="relative pl-5 border-l-2 border-stone-100 py-1">
                                        <p className="text-base font-medium leading-relaxed serif-font italic text-stone-700 group-hover:text-stone-900 transition-colors">
                                            {log.text}
                                        </p>
                                    </div>

                                    {log.replyMessage && (
                                        <div className="mt-2 p-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200 transform rotate-[0.5deg] group-hover:rotate-0 transition-all duration-500">
                                            <p className="text-[13px] leading-relaxed handwriting-font font-bold text-stone-500">
                                                {log.replyMessage}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        <button onClick={onBack} className="w-full max-w-xs px-8 py-5 bg-stone-800 text-white rounded-3xl font-black shadow-[0_6px_0_rgb(44,40,36)] active:translate-y-[6px] transition-all mt-4 mb-2 text-xs tracking-[0.3em] uppercase">
            離開長廊
        </button>
    </div>
  );
};

export default CommunityBoard;
