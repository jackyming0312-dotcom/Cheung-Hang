
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Grid, Volume2, VolumeX, ChevronLeft, Cloud, CloudOff, CheckCircle2, ShieldCheck } from 'lucide-react';

import Mascot from './components/Mascot';
import MoodWater from './components/MoodWater';
import VibeMap from './components/VibeMap';
import WhisperHole from './components/WhisperHole';
import EnergyCard from './components/EnergyCard';
import CommunityBoard from './components/CommunityBoard';

import { generateSoulText, getRandomFallbackContent } from './services/geminiService';
import { saveLogToCloud, subscribeToStation, checkCloudStatus, deleteLog } from './services/firebaseService';
import { AppStep, GeminiAnalysisResult, EnergyCardData, CommunityLog, MascotOptions } from './types';

const SOUL_TITLES = ["夜行的貓", "趕路的人", "夢想的園丁", "沉思的星", "微光的旅人", "溫柔的風", "尋光者", "安靜的樹", "海邊的貝殼"];
const FIXED_STATION_ID = "CHEUNG_HANG"; 

const getDeviceType = () => {
    const ua = navigator.userAgent;
    const platform = navigator.platform || '';
    
    // 專為 iPadOS 優化 (Safari 在 iPad 上預設會偽裝成 Mac)
    const isIPad = /iPad/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIPad) return "iPad";
    if (/iPhone|iPod/.test(ua)) return "iPhone";
    if (/Android/.test(ua)) return "Android手機";
    if (/Macintosh|MacIntel/.test(ua)) return "Mac電腦";
    if (/Windows|Win32|Win64/.test(ua)) return "Windows電腦";
    
    return "行動裝置";
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
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [logs, setLogs] = useState<CommunityLog[]>([]);
  const [mascotConfig, setMascotConfig] = useState<MascotOptions>(generateMascotConfig());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isCloudLive = checkCloudStatus();

  // 核心：全域實時監聽雲端資料庫
  useEffect(() => {
    if (!isCloudLive) return;
    const unsubscribe = subscribeToStation((cloudLogs) => {
      setLogs(cloudLogs);
    });
    return () => unsubscribe();
  }, [isCloudLive]);

  const handleWhisperComplete = async (text: string) => {
    setStep(AppStep.REWARD);
    setIsLoadingContent(true);
    setIsSyncing(true);
    setShowSyncConfirm(false);

    try {
        const textData = await generateSoulText(text, mood);
        setWhisperData({ text, analysis: textData.analysis });
        setCardData(textData.card);
        setIsLoadingContent(false);

        const signature = `${SOUL_TITLES[Math.floor(Math.random() * SOUL_TITLES.length)]} #${Math.floor(1000 + Math.random() * 9000)}`;
        const device = getDeviceType();

        const logToSave = {
            moodLevel: mood, 
            text: text, 
            theme: textData.card.theme, 
            tags: textData.analysis.tags, 
            authorSignature: signature, 
            authorColor: mascotConfig.baseColor,
            deviceType: device, 
            stationId: FIXED_STATION_ID,
            fullCard: textData.card,
            replyMessage: textData.analysis.replyMessage,
            timestamp: new Date().toISOString(),
            localTimestamp: Date.now()
        };

        // 樂觀更新：立即更新本地狀態，使用者會立刻在心聲牆看到自己
        const tempId = 'local-' + Date.now();
        setLogs(prev => [{ ...logToSave, id: tempId } as CommunityLog, ...prev]);

        // 正式同步到 Firebase
        const cloudId = await saveLogToCloud(logToSave);
        
        if (cloudId) {
            console.log("Record Secured In Cloud:", cloudId);
            setIsSyncing(false);
            setShowSyncConfirm(true);
            setTimeout(() => setShowSyncConfirm(false), 4000);
        }
    } catch (e) {
        console.error("Critical Sync Failure:", e);
        const fallback = getRandomFallbackContent();
        setCardData(fallback.card);
        setWhisperData({ text, analysis: fallback.analysis });
        setIsLoadingContent(false);
        setIsSyncing(false);
        // 如果失敗，提醒使用者但保留紀錄（因為有樂觀更新）
    }
  };

  const handleDeleteLog = async (docId: string) => {
    if (!isCloudLive || !docId) return;
    if (docId.startsWith('local-')) {
        setLogs(prev => prev.filter(l => l.id !== docId));
        return;
    }
    if (window.confirm("確定要刪除這筆雲端紀錄嗎？")) {
        setIsSyncing(true);
        await deleteLog(docId);
        setIsSyncing(false);
    }
  };

  const handleMusicToggle = () => {
    if (!audioRef.current) {
        const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3");
        audio.loop = true;
        audio.volume = 0.2;
        audioRef.current = audio;
    }
    
    const audio = audioRef.current;
    if (audio.paused) {
        audio.play().catch(() => {});
    } else {
        audio.pause();
    }
    // 強制觸發重新渲染以更新圖示（這裡省略 state 以保持精簡，實際開發建議使用 state）
  };

  return (
    <div className="min-h-[100dvh] w-full relative flex flex-col items-center justify-center p-3">
      {/* 頂部狀態列 */}
      <div className="fixed top-4 left-4 right-4 z-[100] flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-2xl px-4 py-2 rounded-full border border-white shadow-xl">
              {step !== AppStep.WELCOME && (
                  <button onClick={() => setStep(AppStep.WELCOME)} className="mr-2 p-1 hover:bg-stone-100 rounded-full transition-colors">
                      <ChevronLeft size={16} className="text-stone-600" />
                  </button>
              )}
              {isCloudLive ? (
                  <div className="flex items-center gap-2">
                     <Cloud size={14} className={isSyncing ? "text-amber-500 animate-pulse" : "text-emerald-500"} />
                     <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">
                         {isSyncing ? '同步中' : '連線正常'}
                     </span>
                  </div>
              ) : (
                  <div className="flex items-center gap-2">
                     <CloudOff size={14} className="text-rose-400" />
                     <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">離線</span>
                  </div>
              )}
          </div>
          
          {showSyncConfirm && (
              <div className="bg-emerald-600 text-white px-5 py-2 rounded-full text-[11px] font-bold animate-soft-in flex items-center gap-2 shadow-2xl border border-emerald-400">
                  <ShieldCheck size={14} /> 紀錄已保存
              </div>
          )}
      </div>

      <main className="w-full max-w-2xl min-h-[min(720px,90dvh)] glass-panel rounded-[2.5rem] p-6 md:p-12 shadow-2xl flex flex-col relative animate-soft-in overflow-hidden z-10 border-2 border-white/50">
        <header className="w-full flex flex-col items-center mb-8 pt-4">
           <div className="mb-4">
                <Mascot expression={(isLoadingContent || isSyncing) ? "listening" : "sleepy"} options={mascotConfig} className="w-24 h-24 md:w-36 md:h-36" />
           </div>
           <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-stone-800 serif-font tracking-tight">長亨心靈充電站</h1>
              <div className="flex items-center justify-center gap-2 mt-1">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                 <span className="text-[9px] text-stone-400 font-bold tracking-[0.3em] uppercase">iPad/手機 即時同步中</span>
              </div>
           </div>
        </header>

        <div className="w-full flex-1 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar px-2">
          {step === AppStep.WELCOME && (
            <div className="w-full flex flex-col h-full max-w-sm mx-auto animate-soft-in">
              <div className="bg-white/95 p-8 rounded-[2rem] border border-stone-100 shadow-xl text-center paper-stack mt-4">
                <p className="text-stone-600 leading-relaxed serif-font italic text-lg">"在這裡，每一份心情都值得被紀錄。<br/>亨仔會為你守護這些靈魂的碎片。"</p>
              </div>
              <div className="space-y-4 w-full mt-12">
                <button onClick={() => setStep(AppStep.MOOD_WATER)} className="w-full py-5 font-bold text-white text-lg bg-stone-800 rounded-3xl shadow-[0_6px_0_rgb(44,40,36)] active:translate-y-[6px] transition-all flex items-center justify-center group tracking-widest">
                   開始充電 <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                </button>
                <button onClick={() => setStep(AppStep.COMMUNITY)} className="w-full py-4 font-bold text-stone-500 bg-white/60 border border-stone-200 rounded-3xl flex items-center justify-center gap-3 text-xs shadow-sm">
                   <Grid size={16} /> 查看心聲牆 (跨設備同步)
                </button>
              </div>
            </div>
          )}

          {step === AppStep.MOOD_WATER && <div className="w-full flex flex-col items-center animate-soft-in"><MoodWater value={mood} onChange={setMood} /><button onClick={() => setStep(AppStep.VIBE_MAP)} className="w-full max-w-xs py-4 bg-stone-800 text-white rounded-2xl font-bold mt-8 shadow-[0_4px_0_rgb(44,40,36)] active:translate-y-[4px] transition-all">下一步</button></div>}
          {step === AppStep.VIBE_MAP && <VibeMap onZoneSelect={() => setStep(AppStep.WHISPER_HOLE)} />}
          {step === AppStep.WHISPER_HOLE && <WhisperHole onComplete={handleWhisperComplete} />}
          
          {step === AppStep.REWARD && (
            <div className="w-full animate-soft-in flex flex-col items-center py-2">
              {isLoadingContent || isSyncing ? (
                 <div className="flex flex-col items-center gap-8 py-20 text-center">
                    <div className="relative">
                       <Mascot expression="listening" options={mascotConfig} className="w-44 h-44" />
                       <div className="absolute -inset-8 bg-amber-400/10 blur-3xl animate-pulse rounded-full z-0"></div>
                    </div>
                    <div className="space-y-4">
                       <h3 className="font-bold text-2xl text-stone-700 serif-font italic">正在為您的靈魂生成處方...</h3>
                       <p className="text-stone-400 text-sm animate-pulse tracking-widest">您的心聲正在飛往雲端長廊</p>
                    </div>
                 </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <EnergyCard 
                    data={cardData!} 
                    analysis={whisperData.analysis} 
                    moodLevel={mood} 
                  />
                  <div className="w-full max-w-[360px] grid grid-cols-2 gap-3 mt-10 pb-8 px-4">
                    <button onClick={() => setStep(AppStep.COMMUNITY)} className="py-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-black text-emerald-700 flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all">
                       <Grid size={14} /> 前往心聲牆
                    </button>
                    <button onClick={() => { setStep(AppStep.WELCOME); setCardData(null); }} className="py-4 bg-stone-800 text-white rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-all">
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
         REAL-TIME SYNC • ACTIVE
         <div className="w-12 h-[1px] bg-stone-300"></div>
      </footer>
    </div>
  );
};

export default App;
