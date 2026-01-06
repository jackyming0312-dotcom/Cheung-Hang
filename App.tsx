
import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ShieldCheck, WifiOff, Calendar as CalendarIcon } from 'lucide-react';

import Mascot from './components/Mascot';
import MoodWater from './components/MoodWater';
import VibeMap from './components/VibeMap';
import WhisperHole from './components/WhisperHole';
import EnergyCard from './components/EnergyCard';
import CommunityBoard from './components/CommunityBoard';

import { generateSoulText } from './services/geminiService';
import { saveLogToCloud, subscribeToStation, checkCloudStatus, deleteLog } from './services/firebaseService';
import { AppStep, GeminiAnalysisResult, EnergyCardData, CommunityLog, MascotOptions } from './types';

const SOUL_TITLES = ["夜行的貓", "趕路的人", "夢想的園丁", "沉思的星", "微光的旅人", "溫柔的風", "尋光者", "安靜的樹", "海邊的貝殼"];
const DECORATIVE_ICONS = ["Flower", "Moon", "Sun", "Cloud", "Coffee", "Music", "Heart", "Star", "Leaf", "Anchor"];

const getDeviceType = () => {
    const ua = navigator.userAgent;
    const isIPad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIPad) return "iPad";
    if (/iPhone|iPod/.test(ua)) return "iPhone";
    if (/Android/.test(ua)) return "Android手機";
    return "電腦";
};

const generateMascotConfig = (): MascotOptions => ({
    role: Math.random() > 0.5 ? 'youth' : 'worker',
    baseColor: ['#C4A484', '#D7CCC8', '#BCAAA4'][Math.floor(Math.random() * 3)],
});

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [mood, setMood] = useState<number>(50);
  const [whisperData, setWhisperData] = useState<{text: string, analysis: GeminiAnalysisResult | null}>({text: '', analysis: null});
  const [cardData, setCardData] = useState<EnergyCardData | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<CommunityLog[]>([]);
  const [mascotConfig, setMascotConfig] = useState<MascotOptions>(generateMascotConfig());

  const isCloudLive = checkCloudStatus();

  useEffect(() => {
    if (!isCloudLive) return;
    const unsubscribe = subscribeToStation((cloudLogs) => {
      setLogs(cloudLogs);
    });
    return () => unsubscribe();
  }, [isCloudLive]);

  const handleDeleteLog = async (id: string) => {
    if (window.confirm("確定要從日曆牆移除這則心聲嗎？")) {
        try { await deleteLog(id); } catch (e) { console.error(e); }
    }
  };

  const handleWhisperComplete = async (text: string) => {
    setStep(AppStep.REWARD);
    setIsLoadingContent(true);
    setIsSyncing(true);
    setSyncStatus('saving');

    try {
        // AI 根據輸入文字生成分析、標籤與卡片內容
        const textData = await generateSoulText(text, mood);
        
        setWhisperData({ text, analysis: textData.analysis });
        setCardData(textData.card);
        setIsLoadingContent(false);

        const randomIcon = DECORATIVE_ICONS[Math.floor(Math.random() * DECORATIVE_ICONS.length)];
        const signature = `${SOUL_TITLES[Math.floor(Math.random() * SOUL_TITLES.length)]} #${Math.floor(1000 + Math.random() * 9000)}`;

        const logToSave = {
            moodLevel: mood, // 手動輸入的電力
            text, 
            theme: textData.card.theme, 
            tags: textData.analysis.tags, // AI 動態生成的標籤
            authorSignature: signature, 
            authorColor: '#FFFFFF', // 統一簡約風格
            authorIcon: randomIcon,  
            deviceType: getDeviceType(), 
            stationId: "CHEUNG_HANG",
            fullCard: textData.card, 
            replyMessage: textData.analysis.replyMessage,
            timestamp: new Date().toISOString(), 
            localTimestamp: Date.now()
        };

        try {
            await saveLogToCloud(logToSave);
            setSyncStatus('success');
            setTimeout(() => setSyncStatus('idle'), 3000);
        } catch (saveError) {
            setSyncStatus('error');
        } finally {
            setIsSyncing(false);
        }
    } catch (e) {
        setSyncStatus('error');
        setIsSyncing(false);
        setIsLoadingContent(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full relative flex flex-col items-center justify-center p-3 overflow-hidden">
      {/* 狀態導覽列 */}
      <div className="fixed top-4 left-4 right-4 z-[100] flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-3xl px-4 py-2 rounded-full border border-stone-100 shadow-2xl pointer-events-auto">
              {step !== AppStep.WELCOME && (
                  <button onClick={() => setStep(AppStep.WELCOME)} className="mr-2 p-1 hover:bg-stone-50 rounded-full transition-all active:scale-90">
                      <ChevronLeft size={16} className="text-stone-600" />
                  </button>
              )}
              <div className="flex items-center gap-2">
                 {isCloudLive ? (
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`}></div>
                        <span className="text-[10px] font-black text-stone-600 tracking-widest uppercase leading-none">
                            {isSyncing ? '同步中' : '即時同步中'}
                        </span>
                     </div>
                 ) : (
                     <div className="flex items-center gap-1.5 text-rose-500">
                        <WifiOff size={12} />
                        <span className="text-[10px] font-black tracking-widest uppercase leading-none">離線</span>
                     </div>
                 )}
              </div>
          </div>
          
          <div className="flex items-center gap-2 pointer-events-auto">
              {syncStatus === 'success' && (
                  <div className="bg-emerald-600 text-white px-5 py-2 rounded-full text-[10px] font-black animate-soft-in shadow-xl flex items-center gap-2">
                      <ShieldCheck size={12} /> 存入成功
                  </div>
              )}
          </div>
      </div>

      <main className="w-full max-w-2xl min-h-[min(720px,90dvh)] glass-panel rounded-[2.5rem] p-6 md:p-12 shadow-2xl flex flex-col relative animate-soft-in overflow-hidden z-10 border-2 border-white/50">
        <header className="w-full flex flex-col items-center mb-6 pt-4">
           <div className="mb-4">
                <Mascot expression={(isLoadingContent || isSyncing) ? "listening" : "sleepy"} options={mascotConfig} className="w-24 h-24 md:w-36 md:h-36" />
           </div>
           <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-stone-800 serif-font tracking-tight">長亨心靈充電站</h1>
              <div className="flex items-center justify-center gap-2 mt-1">
                 <span className={`w-1.5 h-1.5 rounded-full ${isCloudLive ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`}></span>
                 <span className="text-[9px] text-stone-400 font-bold tracking-[0.3em] uppercase italic">日曆長廊數據：iPad / 手機 / 電腦</span>
              </div>
           </div>
        </header>

        <div className="w-full flex-1 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar px-2">
          {step === AppStep.WELCOME && (
            <div className="w-full flex flex-col h-full max-w-sm mx-auto animate-soft-in">
              <div className="bg-white/95 p-8 rounded-[2rem] border border-stone-100 shadow-xl text-center paper-stack mt-4">
                <p className="text-stone-600 leading-relaxed serif-font italic text-lg">"在這裡留下的一字一句，<br/>都會轉化為長廊中的溫柔微光。"</p>
              </div>
              <div className="space-y-4 w-full mt-12">
                <button onClick={() => setStep(AppStep.MOOD_WATER)} className="w-full py-5 font-bold text-white text-lg bg-stone-800 rounded-3xl shadow-[0_6px_0_rgb(44,40,36)] active:translate-y-[6px] transition-all flex items-center justify-center group tracking-widest uppercase">
                   開始體驗 <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                </button>
                <button onClick={() => setStep(AppStep.COMMUNITY)} className="w-full py-4 font-bold text-stone-500 bg-white/60 border border-stone-200 rounded-3xl flex items-center justify-center gap-3 text-xs shadow-sm hover:bg-white transition-all">
                   <CalendarIcon size={16} /> 穿越時光：查看日曆牆
                </button>
              </div>
            </div>
          )}

          {step === AppStep.MOOD_WATER && (
            <div className="w-full flex flex-col items-center animate-soft-in">
                <MoodWater value={mood} onChange={setMood} />
                <button onClick={() => setStep(AppStep.VIBE_MAP)} className="w-full max-w-xs py-5 bg-stone-800 text-white rounded-3xl font-bold mt-10 shadow-[0_6px_0_rgb(44,40,36)] active:translate-y-[6px] transition-all tracking-widest uppercase">
                    下一步
                </button>
            </div>
          )}
          
          {step === AppStep.VIBE_MAP && <VibeMap onZoneSelect={() => setStep(AppStep.WHISPER_HOLE)} />}
          {step === AppStep.WHISPER_HOLE && <WhisperHole onComplete={handleWhisperComplete} />}
          
          {step === AppStep.REWARD && (
            <div className="w-full animate-soft-in flex flex-col items-center py-2">
              {isLoadingContent || (isSyncing && syncStatus === 'saving') ? (
                 <div className="flex flex-col items-center gap-8 py-20 text-center">
                    <div className="relative">
                       <Mascot expression="listening" options={mascotConfig} className="w-44 h-44" />
                       <div className="absolute -inset-8 bg-amber-400/10 blur-3xl animate-pulse rounded-full z-0"></div>
                    </div>
                    <div className="space-y-4">
                       <h3 className="font-bold text-2xl text-stone-700 serif-font italic">正在為你的故事生成標籤...</h3>
                       <p className="text-stone-400 text-[10px] tracking-widest uppercase font-black italic">正在整理今日心靈紀錄牆</p>
                    </div>
                 </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <EnergyCard data={cardData!} analysis={whisperData.analysis} moodLevel={mood} moodLevelDisplay={mood} />
                  <div className="w-full max-w-[360px] grid grid-cols-2 gap-3 mt-10 pb-8 px-4">
                    <button onClick={() => setStep(AppStep.COMMUNITY)} className="py-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-black text-emerald-700 flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all">
                       <CalendarIcon size={14} /> 進入日曆長廊
                    </button>
                    <button onClick={() => { setStep(AppStep.WELCOME); setCardData(null); }} className="py-4 bg-stone-800 text-white rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-all tracking-widest">
                       回到首頁
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {step === AppStep.COMMUNITY && (
            <CommunityBoard 
                logs={logs} 
                onBack={() => setStep(AppStep.WELCOME)} 
                onClearDay={() => {}} 
                onDeleteLog={handleDeleteLog}
                onRefresh={() => { window.location.reload(); }} 
                isSyncing={isSyncing} 
                onGenerateSyncLink={() => {}} 
            />
          )}
        </div>
      </main>
      <footer className="mt-6 text-stone-400 text-[9px] font-bold tracking-[0.5em] uppercase opacity-50 flex items-center gap-3">
         <div className="w-12 h-[1px] bg-stone-300"></div>
         CHEUNG HANG STATION • TIME GALLERY
         <div className="w-12 h-[1px] bg-stone-300"></div>
      </footer>
    </div>
  );
};

export default App;
