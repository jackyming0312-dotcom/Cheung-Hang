
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw, Grid, Volume2, VolumeX, Sparkles, ChevronLeft, Globe, Wifi, CloudDownload, Link2, Activity, MapPin } from 'lucide-react';

import Mascot from './components/Mascot';
import MoodWater from './components/MoodWater';
import VibeMap from './components/VibeMap';
import WhisperHole from './components/WhisperHole';
import EnergyCard from './components/EnergyCard';
import CommunityBoard from './components/CommunityBoard';

import { generateEnergyCard, analyzeWhisper, generateHealingImage } from './services/geminiService';
import { syncLogToCloud, subscribeToStation, checkCloudStatus } from './services/firebaseService';
import { AppStep, GeminiAnalysisResult, EnergyCardData, CommunityLog, MascotOptions } from './types';

const SOUL_TITLES = ["夜行的貓", "趕路的人", "夢想的園丁", "沉思的星", "微光的旅人", "溫柔的風", "尋光者", "安靜的樹", "海邊的貝殼"];
const FIXED_STATION_ID = "CHEUNG_HANG";

const DEFAULT_CARD: EnergyCardData = {
  quote: "無論今天如何，長亨大熊都會在這裡陪你。",
  theme: "陪伴",
  luckyItem: "溫暖的抱抱"
};

const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "iPad";
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "手機";
    return "電腦";
};

const generateMascotConfig = (): MascotOptions => {
    const colors = ['#C4A484', '#D7CCC8', '#EFEBE9', '#BCAAA4', '#A1887F', '#8D6E63', '#795548'];
    return {
        role: Math.random() > 0.5 ? 'youth' : 'worker',
        baseColor: colors[Math.floor(Math.random() * colors.length)],
    };
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [mood, setMood] = useState<number>(50);
  const [zone, setZone] = useState<string | null>(null);
  const [whisperData, setWhisperData] = useState<{text: string, analysis: GeminiAnalysisResult | null}>({text: '', analysis: null});
  const [cardData, setCardData] = useState<EnergyCardData | null>(null);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const stationId = FIXED_STATION_ID; 
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mascotConfig, setMascotConfig] = useState<MascotOptions>(generateMascotConfig());
  const [logs, setLogs] = useState<CommunityLog[]>([]);
  const isCloudLive = checkCloudStatus();

  // Fix: defined showBackButton to determine if the back navigation should be visible
  const showBackButton = step !== AppStep.WELCOME;

  // 核心：跨設備即時同步監聽
  useEffect(() => {
    if (isCloudLive) {
        setIsSyncing(true);
        // 啟動 Firebase 訂閱，當任何設備更新資料，這裡都會被觸發
        const unsubscribe = subscribeToStation(stationId, (cloudLogs) => {
            setLogs(prev => {
                // 排除正在本機「同步中」的重複項，以雲端資料為最終真相
                const localOptimisticIds = new Set(prev.filter(l => l.theme.includes("同步")).map(l => l.id));
                const filteredCloud = cloudLogs.filter(cl => !localOptimisticIds.has(cl.id));
                
                const combined = [...filteredCloud, ...prev.filter(l => l.theme.includes("同步"))];
                // 根據 ID 去重並依時間排序
                const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                return unique.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            });
            setIsSyncing(false);
        });
        return () => unsubscribe();
    } else {
        const saved = localStorage.getItem(`vibe_logs_${stationId}`);
        if (saved) setLogs(JSON.parse(saved));
    }
  }, [stationId, isCloudLive]);

  useEffect(() => {
    if (!isCloudLive) {
        localStorage.setItem(`vibe_logs_${stationId}`, JSON.stringify(logs.slice(0, 100)));
    }
  }, [logs, stationId, isCloudLive]);

  useEffect(() => {
    const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => { if(audioRef.current) audioRef.current.pause(); }
  }, []);

  const toggleMusic = () => {
      if (!audioRef.current) return;
      if (isMusicPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(() => setIsMusicPlaying(false));
      setIsMusicPlaying(!isMusicPlaying);
  };

  const handleBack = () => {
    if (step === AppStep.MOOD_WATER) setStep(AppStep.WELCOME);
    else if (step === AppStep.VIBE_MAP) setStep(AppStep.MOOD_WATER);
    else if (step === AppStep.WHISPER_HOLE) setStep(AppStep.VIBE_MAP);
    else if (step === AppStep.COMMUNITY || step === AppStep.REWARD) setStep(AppStep.WELCOME);
    setMascotConfig(generateMascotConfig());
  };

  const handleWhisperComplete = async (text: string) => {
    setStep(AppStep.REWARD);
    setIsLoadingCard(true);
    setIsSyncing(true); 
    setWhisperData({ text, analysis: null });

    const logId = `local-${Date.now()}`; // 暫時 ID
    const signature = `${SOUL_TITLES[Math.floor(Math.random() * SOUL_TITLES.length)]} #${Math.floor(1000 + Math.random() * 9000)}`;
    const deviceType = getDeviceType();

    // 1. 樂觀更新：立即讓本機設備顯示「同步中」，體感速度最快
    const optimisticLog: CommunityLog = {
        id: logId,
        moodLevel: mood,
        text: text,
        timestamp: new Date().toISOString(),
        theme: "同步中...",
        tags: ["傳輸中"],
        authorSignature: signature,
        authorColor: mascotConfig.baseColor,
        deviceType: deviceType,
        stationId: stationId
    };

    setLogs(prev => [optimisticLog, ...prev]);

    try {
        // 2. AI 處理
        const [analysisResult, energyCardResult, imageResult] = await Promise.all([
            analyzeWhisper(text).catch(() => ({ sentiment: 'neutral' as const, tags: ['心情'], replyMessage: '長亨大熊收到了！' })),
            generateEnergyCard(mood, zone).catch(() => DEFAULT_CARD),
            generateHealingImage(text, mood, zone).catch(() => null)
        ]);

        const fullCard: EnergyCardData = { ...energyCardResult, imageUrl: imageResult || undefined };
        const updatedLog: CommunityLog = {
            ...optimisticLog,
            id: Date.now().toString(), // 替換為正式 ID
            theme: energyCardResult.theme,
            tags: analysisResult.tags,
            fullCard: fullCard,
            replyMessage: analysisResult.replyMessage
        };

        setWhisperData({ text, analysis: analysisResult });
        setCardData(fullCard);

        // 3. 真正推送到 Firebase (這會觸發所有其他設備的即時更新)
        if (isCloudLive) {
            await syncLogToCloud(stationId, updatedLog);
            // 移除本機的樂觀項，讓 Firebase 監聽器接手
            setLogs(prev => prev.filter(l => l.id !== logId));
        } else {
            setLogs(prev => prev.map(l => l.id === logId ? updatedLog : l));
        }

    } catch (e) {
        console.error("AI 處理失敗", e);
        setCardData(DEFAULT_CARD);
    } finally {
        setIsSyncing(false);
        setIsLoadingCard(false);
    }
  };

  const handleRestart = () => {
    setStep(AppStep.WELCOME);
    setMood(50);
    setZone(null);
    setWhisperData({ text: '', analysis: null });
    setCardData(null);
    setIsLoadingCard(false);
    setMascotConfig(generateMascotConfig());
  };

  const renderMascot = () => {
    const props = { options: mascotConfig, className: "w-24 h-24 md:w-40 md:h-40 drop-shadow-2xl transition-all duration-700", onClick: () => setMascotConfig(generateMascotConfig()) };
    if (step === AppStep.REWARD) return <Mascot expression="excited" {...props} />;
    if (step === AppStep.WELCOME) return <Mascot expression="sleepy" {...props} />;
    if (step === AppStep.MOOD_WATER || step === AppStep.WHISPER_HOLE) return <Mascot expression="listening" {...props} />;
    return <Mascot expression="happy" {...props} />;
  };

  return (
    <div className="min-h-[100dvh] w-full relative flex flex-col items-center justify-center p-3 md:p-8">
      {/* 狀態列：即時同步指示器 */}
      <div className="fixed top-4 left-4 z-[100] flex items-center gap-2 bg-white/60 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white shadow-sm">
          <div className={`w-2 h-2 rounded-full ${isCloudLive ? (isSyncing ? 'bg-orange-400 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]') : 'bg-stone-300'}`}></div>
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
              {isCloudLive ? (isSyncing ? 'Syncing...' : 'Cheung Hang Live') : 'Local Only'}
              {isCloudLive && <Activity size={10} className={isSyncing ? 'animate-spin' : 'animate-pulse'} />}
          </span>
      </div>

      <button onClick={toggleMusic} className="fixed top-4 right-4 z-[100] p-3 bg-white/60 backdrop-blur-xl rounded-full shadow-lg border border-white text-stone-600 active:scale-90 transition-transform">
        {isMusicPlaying ? <Volume2 size={18} className="text-amber-500 animate-pulse" /> : <VolumeX size={18} />}
      </button>

      <main className="w-full max-w-2xl min-h-[min(680px,85dvh)] glass-panel rounded-[1.8rem] md:rounded-[2.5rem] p-5 md:p-12 shadow-2xl flex flex-col relative transition-all duration-700 animate-soft-in overflow-hidden z-10">
        {showBackButton && (
          <button onClick={handleBack} className="absolute top-5 left-5 p-2 text-stone-400 hover:text-stone-700 active:bg-stone-50 rounded-full transition-all z-[100] flex items-center gap-1">
            <ChevronLeft size={18} /><span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Back</span>
          </button>
        )}

        <div className="absolute top-0 left-0 right-0 h-1 bg-stone-100/20 overflow-hidden z-[50]">
            <div className="h-full bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 transition-all duration-1000 ease-out" style={{ width: `${(['WELCOME','MOOD_WATER','VIBE_MAP','WHISPER_HOLE','REWARD'].indexOf(step) / 4) * 100}%` }}></div>
        </div>

        <header className="w-full flex flex-col items-center mb-5 md:mb-8 pt-2">
           <div className="mb-2">{renderMascot()}</div>
           <div className="text-center">
              <h1 className="text-xl md:text-3xl font-bold text-stone-800 tracking-tight serif-font">心靈充電站</h1>
              <div className="flex items-center justify-center gap-2 mt-1">
                  <div className="h-[1px] w-4 bg-stone-200"></div>
                  <span className="text-[8px] md:text-[9px] text-stone-400 font-bold tracking-[0.3em] uppercase">Healing Sanctuary</span>
                  <div className="h-[1px] w-4 bg-stone-200"></div>
              </div>
           </div>
        </header>

        <div className="w-full flex-1 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
          {step === AppStep.WELCOME && (
            <div className="w-full flex flex-col justify-between h-full animate-soft-in max-w-sm mx-auto">
              <div className="relative paper-stack mt-2">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 washi-tape opacity-50"></div>
                  <div className="bg-white/95 p-6 md:p-10 rounded-[1.5rem] border border-stone-100 shadow-md text-center">
                    <p className="text-stone-600 leading-relaxed serif-font text-base italic">"在這個步調飛快的城市裡，<br/>給自己留下一分鐘的留白。"</p>
                  </div>
              </div>
              <div className="mt-8 flex flex-col items-center gap-3">
                <div className="relative px-6 py-2 bg-stone-800 text-white rounded-full flex items-center gap-2.5 shadow-xl border border-stone-700/50">
                    <MapPin size={14} className="text-amber-300" /><span className="text-xs font-mono font-bold tracking-[0.2em] uppercase">Cheung Hang Station</span>
                </div>
              </div>
              <div className="space-y-3 w-full mt-10 md:mt-12 pb-2">
                <button onClick={() => { if (!isMusicPlaying) toggleMusic(); setStep(AppStep.MOOD_WATER); }} className="w-full py-4 font-bold text-white text-lg bg-stone-800 rounded-2xl shadow-[0_4px_0_rgb(44,40,36)] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center group">開始檢測 <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" /></button>
                <button onClick={() => setStep(AppStep.COMMUNITY)} className="w-full py-3 font-bold text-stone-400 bg-white/40 border border-stone-100 rounded-2xl flex items-center justify-center gap-2 text-xs active:bg-stone-50 transition-all"><Grid size={14} /> 進入心聲長廊</button>
              </div>
            </div>
          )}

          {step === AppStep.MOOD_WATER && <div className="w-full flex flex-col items-center h-full animate-soft-in pb-4"><MoodWater value={mood} onChange={setMood} /><button onClick={() => setStep(AppStep.VIBE_MAP)} className="w-full max-w-xs py-4 bg-stone-800 text-white rounded-2xl font-bold mt-6 shadow-[0_4px_0_rgb(44,40,36)] active:translate-y-[4px] active:shadow-none transition-all">確認電量</button></div>}
          {step === AppStep.VIBE_MAP && <div className="w-full animate-soft-in"><VibeMap onZoneSelect={(z) => { setZone(z); setTimeout(() => setStep(AppStep.WHISPER_HOLE), 300); }} /></div>}
          {step === AppStep.WHISPER_HOLE && <div className="w-full animate-soft-in"><WhisperHole onComplete={handleWhisperComplete} /></div>}
          
          {step === AppStep.REWARD && (
            <div className="w-full animate-soft-in flex flex-col items-center h-full py-2">
              {isLoadingCard ? (
                 <div className="flex flex-col items-center gap-6 py-16 text-center animate-pulse">
                    <div className="w-14 h-14 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-lg text-stone-700 serif-font italic">正在加密同步至長亨站...</p>
                 </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <EnergyCard data={cardData || DEFAULT_CARD} analysis={whisperData.analysis} moodLevel={mood} />
                  <div className="w-full max-w-[320px] flex gap-2 mt-6 pb-6">
                    <button onClick={() => setStep(AppStep.COMMUNITY)} className="flex-1 py-3 bg-white/50 hover:bg-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition-all border border-stone-100"><Grid size={12} /> 查看即時牆面</button>
                    <button onClick={handleRestart} className="flex-1 py-3 bg-stone-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 shadow-[0_3px_0_rgb(44,40,36)] active:translate-y-[3px] active:shadow-none transition-all"><RotateCcw size={12} /> 再試一次</button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {step === AppStep.COMMUNITY && (
            <CommunityBoard logs={logs} onBack={() => setStep(AppStep.WELCOME)} onClearDay={() => {}} onRefresh={() => {}} isSyncing={isSyncing} onGenerateSyncLink={() => {}} />
          )}
        </div>
      </main>
      <footer className="mt-4 text-stone-300 text-[8px] font-bold tracking-[0.4em] uppercase opacity-40 text-center">Community Real-time Hub // Cheung Hang</footer>
    </div>
  );
};

export default App;
