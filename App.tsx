
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw, Grid, Volume2, VolumeX, Sparkles, ChevronLeft, Activity, MapPin, Wifi, Cloud, CloudOff, AlertCircle, Undo2 } from 'lucide-react';

import Mascot from './components/Mascot';
import MoodWater from './components/MoodWater';
import VibeMap from './components/VibeMap';
import WhisperHole from './components/WhisperHole';
import EnergyCard from './components/EnergyCard';
import CommunityBoard from './components/CommunityBoard';

import { generateEnergyCard, analyzeWhisper, generateHealingImage } from './services/geminiService';
import { syncLogToCloud, updateLogOnCloud, subscribeToStation, checkCloudStatus } from './services/firebaseService';
import { AppStep, GeminiAnalysisResult, EnergyCardData, CommunityLog, MascotOptions } from './types';

const SOUL_TITLES = ["夜行的貓", "趕路的人", "夢想的園丁", "沉思的星", "微光的旅人", "溫柔的風", "尋光者", "安靜的樹", "海邊的貝殼"];
const FIXED_STATION_ID = "CHEUNG_HANG"; 

const DEFAULT_CARD: EnergyCardData = {
  quote: "無論今天如何，長亨大熊都會在這裡陪你。",
  theme: "陪伴",
  luckyItem: "溫暖的抱抱",
  category: "生活態度"
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
  const [syncWarning, setSyncWarning] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mascotConfig, setMascotConfig] = useState<MascotOptions>(generateMascotConfig());
  const [logs, setLogs] = useState<CommunityLog[]>([]);
  const isCloudLive = checkCloudStatus();

  useEffect(() => {
    if (isCloudLive) {
        const unsubscribe = subscribeToStation(FIXED_STATION_ID, (cloudLogs) => {
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
    setSyncWarning(false);
    setIsSyncing(true);

    const signature = `${SOUL_TITLES[Math.floor(Math.random() * SOUL_TITLES.length)]} #${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const initialLog: CommunityLog = {
        id: `local-${Date.now()}`,
        moodLevel: mood, text: text,
        timestamp: now,
        theme: "正在感應...", tags: ["同步中"],
        authorSignature: signature, authorColor: mascotConfig.baseColor,
        deviceType: getDeviceType(), stationId: FIXED_STATION_ID
    };

    // 🚀 第一階段：立刻同步文字 (1秒內)
    let cloudDocId: string | null = null;
    if (isCloudLive) {
        cloudDocId = await syncLogToCloud(FIXED_STATION_ID, initialLog);
        if (!cloudDocId) setSyncWarning(true);
    }

    try {
        // 🚀 第二階段：生成 AI 文本 (約 3 秒)
        const [analysisResult, energyCardResult] = await Promise.all([
            analyzeWhisper(text),
            generateEnergyCard(mood, zone, text)
        ]);

        // 立即展示文本內容，讓使用者不用等圖片
        setWhisperData({ text, analysis: analysisResult });
        setCardData(energyCardResult); 
        setIsLoadingCard(false);

        // 立刻更新雲端 (讓手機端的「感應中」消失)
        if (isCloudLive && cloudDocId) {
            updateLogOnCloud(FIXED_STATION_ID, cloudDocId, {
                theme: energyCardResult.theme,
                tags: analysisResult.tags,
                fullCard: energyCardResult,
                replyMessage: analysisResult.replyMessage
            });
        }

        // 🚀 第三階段：生成 AI 圖像 (約 10-15 秒，背景執行)
        generateHealingImage(text, mood, zone, energyCardResult).then(imageResult => {
            if (imageResult) {
                const finalCard = { ...energyCardResult, imageUrl: imageResult };
                setCardData(finalCard); // 更新本地顯示
                
                // 更新雲端圖像
                if (isCloudLive && cloudDocId) {
                    updateLogOnCloud(FIXED_STATION_ID, cloudDocId, {
                        fullCard: finalCard
                    });
                }
            }
        }).finally(() => {
            setIsSyncing(false);
        });

    } catch (e) {
        console.error("❌ [App] AI 處理失敗", e);
        setCardData(DEFAULT_CARD);
        setIsLoadingCard(false);
        setIsSyncing(false);
    }
  };

  const handleRestart = () => {
    setStep(AppStep.WELCOME);
    setCardData(null);
    setSyncWarning(false);
    setMascotConfig(generateMascotConfig());
  };

  const handleBack = () => {
    if (step === AppStep.MOOD_WATER) setStep(AppStep.WELCOME);
    else if (step === AppStep.VIBE_MAP) setStep(AppStep.MOOD_WATER);
    else if (step === AppStep.WHISPER_HOLE) setStep(AppStep.VIBE_MAP);
    else if (step === AppStep.REWARD) setStep(AppStep.WHISPER_HOLE);
    else if (step === AppStep.COMMUNITY) setStep(AppStep.WELCOME);
  };

  return (
    <div className="min-h-[100dvh] w-full relative flex flex-col items-center justify-center p-3 md:p-8">
      <div className="fixed top-4 left-4 right-4 z-[100] flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xl px-4 py-2 rounded-full border border-white shadow-sm">
              {step !== AppStep.WELCOME && (
                  <button onClick={handleBack} className="mr-2 p-1 hover:bg-stone-100 rounded-full transition-colors">
                      <ChevronLeft size={16} className="text-stone-600" />
                  </button>
              )}
              {isCloudLive ? (
                  <Cloud size={14} className={isSyncing ? "text-amber-500 animate-pulse" : (syncWarning ? "text-rose-400" : "text-emerald-500")} />
              ) : (
                  <CloudOff size={14} className="text-stone-300" />
              )}
              <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">
                  {isCloudLive ? (syncWarning ? '雲端規則未發佈' : (isSyncing ? '秒級同步中' : '已連線')) : '本地模式'}
              </span>
          </div>

          <button 
            onClick={() => {
                if (!audioRef.current) return;
                if (isMusicPlaying) audioRef.current.pause();
                else audioRef.current.play().catch(() => {});
                setIsMusicPlaying(!isMusicPlaying);
            }}
            className="p-3 bg-white/60 backdrop-blur-xl rounded-full shadow-lg border border-white text-stone-600 transition-all"
          >
            {isMusicPlaying ? <Volume2 size={18} className="text-amber-500" /> : <VolumeX size={18} />}
          </button>
      </div>

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
                <p className="text-stone-600 leading-relaxed serif-font italic">"每一段心聲，都值得被溫柔以待。<br/>在這裡，讓 AI 為你的心情充充電。"</p>
              </div>
              <div className="space-y-3 w-full mt-10">
                <button onClick={() => setStep(AppStep.MOOD_WATER)} className="w-full py-4 font-bold text-white text-lg bg-stone-800 rounded-2xl shadow-[0_4px_0_rgb(44,40,36)] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center group">開始充電 <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" /></button>
                <button onClick={() => setStep(AppStep.COMMUNITY)} className="w-full py-3 font-bold text-stone-400 bg-white/40 border border-stone-100 rounded-2xl flex items-center justify-center gap-2 text-xs hover:bg-white/60 transition-all"><Grid size={14} /> 進入心聲長廊</button>
              </div>
            </div>
          )}

          {step === AppStep.MOOD_WATER && <div className="w-full flex flex-col items-center animate-soft-in"><MoodWater value={mood} onChange={setMood} /><button onClick={() => setStep(AppStep.VIBE_MAP)} className="w-full max-w-xs py-4 bg-stone-800 text-white rounded-2xl font-bold mt-8 shadow-[0_4px_0_rgb(44,40,36)] active:translate-y-[4px] transition-all">下一步</button></div>}
          {step === AppStep.VIBE_MAP && <VibeMap onZoneSelect={(z) => { setZone(z); setTimeout(() => setStep(AppStep.WHISPER_HOLE), 300); }} />}
          {step === AppStep.WHISPER_HOLE && <WhisperHole onComplete={handleWhisperComplete} />}
          
          {step === AppStep.REWARD && (
            <div className="w-full animate-soft-in flex flex-col items-center py-2">
              {isLoadingCard ? (
                 <div className="flex flex-col items-center gap-6 py-20 text-center">
                    <div className="w-12 h-12 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-lg text-stone-700 serif-font italic">AI 正在感應您的頻率...</p>
                 </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  {syncWarning && (
                      <div className="mb-4 flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 text-[10px] font-bold">
                          <AlertCircle size={14} /> 雲端連線失敗。請確認規則已 Publish。
                      </div>
                  )}
                  <EnergyCard data={cardData || DEFAULT_CARD} analysis={whisperData.analysis} moodLevel={mood} />
                  
                  <div className="w-full max-w-[320px] grid grid-cols-2 gap-2 mt-8 pb-6">
                    <button onClick={() => setStep(AppStep.COMMUNITY)} className="py-3 bg-white/50 border border-stone-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2">心聲牆</button>
                    <button onClick={handleRestart} className="py-3 bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">回到首頁</button>
                    <button onClick={() => setStep(AppStep.WHISPER_HOLE)} className="col-span-2 py-3 bg-stone-100 text-stone-500 border border-stone-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 uppercase tracking-widest"><Undo2 size={12} /> 返回修改內容</button>
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
      <footer className="mt-4 text-stone-300 text-[8px] font-bold tracking-[0.4em] uppercase opacity-40 text-center">CHEUNG HANG STATION</footer>
    </div>
  );
};

export default App;
