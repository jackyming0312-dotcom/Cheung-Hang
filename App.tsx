
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw, Grid, Volume2, VolumeX, Sparkles, ChevronLeft, Activity, MapPin, Wifi, Cloud, CloudOff, AlertCircle } from 'lucide-react';

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
  const [syncError, setSyncError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mascotConfig, setMascotConfig] = useState<MascotOptions>(generateMascotConfig());
  const [logs, setLogs] = useState<CommunityLog[]>([]);
  const isCloudLive = checkCloudStatus();

  // 即時監聽雲端資料
  useEffect(() => {
    if (isCloudLive) {
        const unsubscribe = subscribeToStation(FIXED_STATION_ID, (cloudLogs) => {
            console.log("📥 [App] 已接收最新雲端資料", cloudLogs.length);
            setLogs(cloudLogs);
        });
        return () => unsubscribe();
    }
  }, [isCloudLive]);

  useEffect(() => {
    const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => { if(audioRef.current) audioRef.current.pause(); }
  }, []);

  const handleWhisperComplete = async (text: string) => {
    setStep(AppStep.REWARD);
    setIsLoadingCard(true);
    setIsSyncing(true);
    setSyncError(false);

    const signature = `${SOUL_TITLES[Math.floor(Math.random() * SOUL_TITLES.length)]} #${Math.floor(1000 + Math.random() * 9000)}`;
    
    try {
        // 1. 同時執行 AI 分析與卡片生成
        const [analysisResult, energyCardResult] = await Promise.all([
            analyzeWhisper(text),
            generateEnergyCard(mood, zone, text)
        ]);

        // 2. 獲取 AI 生成的圖像
        const imageResult = await generateHealingImage(text, mood, zone, energyCardResult);
        const fullCard = { ...energyCardResult, imageUrl: imageResult || undefined };

        setWhisperData({ text, analysis: analysisResult });
        setCardData(fullCard);

        // 3. 準備最終資料並寫入雲端
        const finalLog: CommunityLog = {
            id: `log-${Date.now()}`,
            moodLevel: mood,
            text: text,
            timestamp: new Date().toISOString(),
            theme: energyCardResult.theme,
            tags: analysisResult.tags,
            authorSignature: signature,
            authorColor: mascotConfig.baseColor,
            deviceType: getDeviceType(),
            stationId: FIXED_STATION_ID,
            fullCard: fullCard,
            replyMessage: analysisResult.replyMessage
        };

        if (isCloudLive) {
            await syncLogToCloud(FIXED_STATION_ID, finalLog);
            console.log("☁️ [App] 雲端同步完成");
        } else {
            const updated = [finalLog, ...logs];
            setLogs(updated);
            localStorage.setItem(`vibe_logs_${FIXED_STATION_ID}`, JSON.stringify(updated.slice(0, 50)));
        }
    } catch (e) {
        console.error("❌ [App] 同步流程中斷", e);
        setSyncError(true);
    } finally {
        setIsLoadingCard(false);
        setIsSyncing(false);
    }
  };

  const handleRestart = () => {
    setStep(AppStep.WELCOME);
    setCardData(null);
    setSyncError(false);
    setMascotConfig(generateMascotConfig());
  };

  return (
    <div className="min-h-[100dvh] w-full relative flex flex-col items-center justify-center p-3 md:p-8">
      {/* 頂部狀態 */}
      <div className="fixed top-4 left-4 z-[100] flex items-center gap-2 bg-white/70 backdrop-blur-xl px-4 py-2 rounded-full border border-white shadow-sm transition-all">
          {isCloudLive ? (
              <Cloud size={14} className={isSyncing ? "text-amber-500 animate-pulse" : "text-emerald-500"} />
          ) : (
              <CloudOff size={14} className="text-stone-300" />
          )}
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">
              {isCloudLive ? (isSyncing ? '正在同步雲端...' : '長亨雲端已連線') : '本地離線模式'}
          </span>
      </div>

      <button 
        onClick={() => {
            if (!audioRef.current) return;
            if (isMusicPlaying) audioRef.current.pause();
            else audioRef.current.play().catch(() => {});
            setIsMusicPlaying(!isMusicPlaying);
        }}
        className="fixed top-4 right-4 z-[100] p-3 bg-white/60 backdrop-blur-xl rounded-full shadow-lg border border-white text-stone-600 transition-all"
      >
        {isMusicPlaying ? <Volume2 size={18} className="text-amber-500" /> : <VolumeX size={18} />}
      </button>

      <main className="w-full max-w-2xl min-h-[min(680px,85dvh)] glass-panel rounded-[1.8rem] md:rounded-[2.5rem] p-5 md:p-12 shadow-2xl flex flex-col relative animate-soft-in overflow-hidden z-10">
        <header className="w-full flex flex-col items-center mb-5 md:mb-8 pt-2">
           <div className="mb-2">
                <Mascot 
                    expression={step === AppStep.REWARD ? "excited" : (step === AppStep.WELCOME ? "sleepy" : "listening")} 
                    options={mascotConfig} 
                    className="w-24 h-24 md:w-32 md:h-32" 
                />
           </div>
           <div className="text-center">
              <h1 className="text-xl md:text-2xl font-bold text-stone-800 tracking-tight serif-font">長亨心靈充電站</h1>
              <span className="text-[8px] text-stone-400 font-bold tracking-[0.3em] uppercase">Global Shared Sanctuary</span>
           </div>
        </header>

        <div className="w-full flex-1 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
          {step === AppStep.WELCOME && (
            <div className="w-full flex flex-col justify-between h-full max-w-sm mx-auto animate-soft-in">
              <div className="bg-white/95 p-8 rounded-[1.5rem] border border-stone-100 shadow-md text-center paper-stack mt-4">
                <p className="text-stone-600 leading-relaxed serif-font italic">"這裡匯聚了長亨所有人的心聲。<br/>寫下你的故事，同步到大牆面吧。"</p>
              </div>
              <div className="space-y-3 w-full mt-10">
                <button onClick={() => setStep(AppStep.MOOD_WATER)} className="w-full py-4 font-bold text-white text-lg bg-stone-800 rounded-2xl shadow-[0_4px_0_rgb(44,40,36)] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center group">開始記錄 <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" /></button>
                <button onClick={() => setStep(AppStep.COMMUNITY)} className="w-full py-3 font-bold text-stone-400 bg-white/40 border border-stone-100 rounded-2xl flex items-center justify-center gap-2 text-xs hover:bg-white/60 transition-all"><Grid size={14} /> 進入全域心聲長廊</button>
              </div>
            </div>
          )}

          {step === AppStep.MOOD_WATER && <div className="w-full flex flex-col items-center animate-soft-in"><MoodWater value={mood} onChange={setMood} /><button onClick={() => setStep(AppStep.VIBE_MAP)} className="w-full max-w-xs py-4 bg-stone-800 text-white rounded-2xl font-bold mt-8 shadow-[0_4px_0_rgb(44,40,36)] active:translate-y-[4px] transition-all">確認電量</button></div>}
          {step === AppStep.VIBE_MAP && <VibeMap onZoneSelect={(z) => { setZone(z); setTimeout(() => setStep(AppStep.WHISPER_HOLE), 300); }} />}
          {step === AppStep.WHISPER_HOLE && <WhisperHole onComplete={handleWhisperComplete} />}
          
          {step === AppStep.REWARD && (
            <div className="w-full animate-soft-in flex flex-col items-center py-2">
              {isLoadingCard ? (
                 <div className="flex flex-col items-center gap-6 py-20 text-center">
                    <div className="w-12 h-12 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-lg text-stone-700 serif-font italic">正在為您的心聲充電...</p>
                 </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  {syncError && (
                      <div className="mb-4 flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-2 rounded-lg border border-rose-100 text-[10px] font-bold">
                          <AlertCircle size={14} /> 雲端連線失敗，請確認網路或管理員設定。
                      </div>
                  )}
                  <EnergyCard data={cardData!} analysis={whisperData.analysis} moodLevel={mood} />
                  <div className="w-full max-w-[320px] flex gap-2 mt-8 pb-6">
                    <button onClick={() => setStep(AppStep.COMMUNITY)} className="flex-1 py-3 bg-white/50 border border-stone-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2">查看大家的心聲</button>
                    <button onClick={handleRestart} className="flex-1 py-3 bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">再試一次</button>
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
                onRefresh={() => { window.location.reload(); }} 
                isSyncing={isSyncing} 
                onGenerateSyncLink={() => {}} 
            />
          )}
        </div>
      </main>
      <footer className="mt-4 text-stone-300 text-[8px] font-bold tracking-[0.4em] uppercase opacity-40 text-center">STATION ID: {FIXED_STATION_ID}</footer>
    </div>
  );
};

export default App;
