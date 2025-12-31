
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Grid, Volume2, VolumeX, ChevronLeft, Cloud } from 'lucide-react';

import Mascot from './components/Mascot';
import MoodWater from './components/MoodWater';
import VibeMap from './components/VibeMap';
import WhisperHole from './components/WhisperHole';
import EnergyCard from './components/EnergyCard';
import CommunityBoard from './components/CommunityBoard';

import { generateFullSoulContent } from './services/geminiService';
import { syncLogToCloud, updateLogOnCloud, subscribeToStation, checkCloudStatus } from './services/firebaseService';
import { AppStep, GeminiAnalysisResult, EnergyCardData, CommunityLog, MascotOptions } from './types';

const SOUL_TITLES = ["夜行的貓", "趕路的人", "夢想的園丁", "沉思的星", "微光的旅人", "溫柔的風", "尋光者", "安靜的樹", "海邊的貝殼"];
const FIXED_STATION_ID = "CHEUNG_HANG"; 

const DEFAULT_CARD: EnergyCardData = {
  quote: "無論今天如何，長亨大熊都會在這裡陪你。",
  theme: "陪伴",
  luckyItem: "溫暖的抱抱",
  relaxationMethod: "閉上眼睛，感受心跳的節奏。",
  category: "生活態度"
};

const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "手機";
    return "電腦";
};

const generateMascotConfig = (): MascotOptions => ({
    role: Math.random() > 0.5 ? 'youth' : 'worker',
    baseColor: ['#C4A484', '#D7CCC8', '#BCAAA4'][Math.floor(Math.random() * 3)],
});

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [mood, setMood] = useState<number>(50);
  const [zone, setZone] = useState<string | null>(null);
  const [whisperData, setWhisperData] = useState<{text: string, analysis: GeminiAnalysisResult | null}>({text: '', analysis: null});
  const [cardData, setCardData] = useState<EnergyCardData | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mascotConfig, setMascotConfig] = useState<MascotOptions>(generateMascotConfig());
  const [logs, setLogs] = useState<CommunityLog[]>([]);
  const isCloudLive = checkCloudStatus();

  useEffect(() => {
    if (isCloudLive) {
        return subscribeToStation(FIXED_STATION_ID, (cloudLogs) => setLogs(cloudLogs));
    }
  }, [isCloudLive]);

  useEffect(() => {
    const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3?key=placeholder");
    audio.loop = true;
    audio.volume = 0.2;
    audioRef.current = audio;
  }, []);

  const handleWhisperComplete = async (text: string) => {
    setStep(AppStep.REWARD);
    setIsLoadingContent(true);
    setIsSyncing(true);

    const signature = `${SOUL_TITLES[Math.floor(Math.random() * SOUL_TITLES.length)]} #${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const initialLog: CommunityLog = {
        id: `local-${Date.now()}`,
        moodLevel: mood, text: text,
        timestamp: now,
        theme: "感應中...", tags: ["正在同步"],
        authorSignature: signature, authorColor: mascotConfig.baseColor,
        deviceType: getDeviceType(), stationId: FIXED_STATION_ID
    };

    const cloudIdPromise = isCloudLive ? syncLogToCloud(FIXED_STATION_ID, initialLog) : Promise.resolve(null);
    const aiAnalysisPromise = generateFullSoulContent(text, mood, zone);

    try {
        const fullContent = await aiAnalysisPromise;
        
        if (fullContent) {
            setWhisperData({ text, analysis: fullContent.analysis });
            setCardData(fullContent.card); 
            setIsLoadingContent(false);
            setIsSyncing(false);

            // 背景更新雲端
            cloudIdPromise.then(async (docId) => {
                if (isCloudLive && docId) {
                    await updateLogOnCloud(FIXED_STATION_ID, docId, {
                        theme: fullContent.card.theme,
                        tags: fullContent.analysis.tags,
                        fullCard: fullContent.card,
                        replyMessage: fullContent.analysis.replyMessage
                    });
                }
            });
        }
    } catch (e) {
        console.error("Critical Analysis Error:", e);
        setIsLoadingContent(false);
        setIsSyncing(false);
        setCardData(DEFAULT_CARD);
    }
  };

  const handleRestart = () => {
    setStep(AppStep.WELCOME);
    setCardData(null);
    setMascotConfig(generateMascotConfig());
  };

  return (
    <div className="min-h-[100dvh] w-full relative flex flex-col items-center justify-center p-3">
      <div className="fixed top-4 left-4 right-4 z-[100] flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xl px-4 py-2 rounded-full border border-white shadow-sm">
              {step !== AppStep.WELCOME && (
                  <button onClick={() => setStep(AppStep.WELCOME)} className="mr-2 p-1 hover:bg-stone-100 rounded-full transition-colors">
                      <ChevronLeft size={16} className="text-stone-600" />
                  </button>
              )}
              <Cloud size={14} className={isSyncing ? "text-amber-500 animate-pulse" : "text-emerald-500"} />
              <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">
                  {isSyncing ? '極速分析中' : '連線穩定'}
              </span>
          </div>

          <button 
            onClick={() => {
                if (!audioRef.current) return;
                isMusicPlaying ? audioRef.current.pause() : audioRef.current.play().catch(() => {});
                setIsMusicPlaying(!isMusicPlaying);
            }}
            className="p-3 bg-white/60 backdrop-blur-xl rounded-full shadow-lg border border-white text-stone-600"
          >
            {isMusicPlaying ? <Volume2 size={18} className="text-amber-500" /> : <VolumeX size={18} />}
          </button>
      </div>

      <main className="w-full max-w-2xl min-h-[min(680px,85dvh)] glass-panel rounded-[2rem] p-5 md:p-12 shadow-2xl flex flex-col relative animate-soft-in overflow-hidden z-10">
        <header className="w-full flex flex-col items-center mb-6 pt-2">
           <div className="mb-2">
                <Mascot expression={isLoadingContent ? "listening" : "sleepy"} options={mascotConfig} className="w-24 h-24 md:w-32 md:h-32" />
           </div>
           <div className="text-center">
              <h1 className="text-xl md:text-2xl font-bold text-stone-800 serif-font">長亨心靈充電站</h1>
              <span className="text-[8px] text-stone-400 font-bold tracking-[0.3em] uppercase">No-Image Speed Mode</span>
           </div>
        </header>

        <div className="w-full flex-1 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
          {step === AppStep.WELCOME && (
            <div className="w-full flex flex-col h-full max-w-sm mx-auto animate-soft-in">
              <div className="bg-white/95 p-8 rounded-[1.5rem] border border-stone-100 shadow-md text-center paper-stack mt-4">
                <p className="text-stone-600 leading-relaxed serif-font italic">"每一次紀錄都是與靈魂的重逢，<br/>大熊在這裡聽你說。"</p>
              </div>
              <div className="space-y-3 w-full mt-10">
                <button onClick={() => setStep(AppStep.MOOD_WATER)} className="w-full py-4 font-bold text-white text-lg bg-stone-800 rounded-2xl shadow-[0_4px_0_rgb(44,40,36)] active:translate-y-[4px] transition-all flex items-center justify-center group text-sm md:text-base">開始充電 <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" /></button>
                <button onClick={() => setStep(AppStep.COMMUNITY)} className="w-full py-3 font-bold text-stone-400 bg-white/40 border border-stone-100 rounded-2xl flex items-center justify-center gap-2 text-[10px] md:text-xs hover:bg-white/60 transition-all"><Grid size={14} /> 進入心聲長廊</button>
              </div>
            </div>
          )}

          {step === AppStep.MOOD_WATER && <div className="w-full flex flex-col items-center animate-soft-in"><MoodWater value={mood} onChange={setMood} /><button onClick={() => setStep(AppStep.VIBE_MAP)} className="w-full max-w-xs py-4 bg-stone-800 text-white rounded-2xl font-bold mt-8 shadow-[0_4px_0_rgb(44,40,36)] active:translate-y-[4px] transition-all">下一步</button></div>}
          {step === AppStep.VIBE_MAP && <VibeMap onZoneSelect={(z) => { setZone(z); setStep(AppStep.WHISPER_HOLE); }} />}
          {step === AppStep.WHISPER_HOLE && <WhisperHole onComplete={handleWhisperComplete} />}
          
          {step === AppStep.REWARD && (
            <div className="w-full animate-soft-in flex flex-col items-center py-2">
              {isLoadingContent ? (
                 <div className="flex flex-col items-center gap-6 py-20 text-center">
                    <div className="w-12 h-12 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-lg text-stone-700 serif-font italic">大熊正在認真感應...</p>
                 </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <EnergyCard 
                    data={cardData || DEFAULT_CARD} 
                    analysis={whisperData.analysis} 
                    moodLevel={mood} 
                  />
                  <div className="w-full max-w-[320px] grid grid-cols-2 gap-2 mt-8 pb-6">
                    <button onClick={() => setStep(AppStep.COMMUNITY)} className="py-3 bg-white/50 border border-stone-100 rounded-xl text-xs font-bold">心聲牆</button>
                    <button onClick={handleRestart} className="py-3 bg-stone-800 text-white rounded-xl text-xs font-bold">回到首頁</button>
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
