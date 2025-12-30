
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw, Grid, Volume2, VolumeX, Sparkles, ChevronLeft, Globe, Wifi, CloudDownload, Link2 } from 'lucide-react';

import Mascot from './components/Mascot';
import MoodWater from './components/MoodWater';
import VibeMap from './components/VibeMap';
import WhisperHole from './components/WhisperHole';
import EnergyCard from './components/EnergyCard';
import CommunityBoard from './components/CommunityBoard';

import { generateEnergyCard, analyzeWhisper, generateHealingImage, fetchCommunityEchoes } from './services/geminiService';
import { AppStep, GeminiAnalysisResult, EnergyCardData, CommunityLog, MascotOptions } from './types';

const SOUL_TITLES = ["夜行的貓", "趕路的人", "夢想的園丁", "沉思的星", "微光的旅人", "溫柔的風", "尋光者", "安靜的樹", "海邊的貝殼"];

const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "iPad / 平板";
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "行動裝置";
    return "電腦端";
};

const generateMascotConfig = (): MascotOptions => {
    const roles = ['youth', 'worker'] as const;
    const selectedRole = roles[Math.floor(Math.random() * roles.length)];
    const hats = ['none', 'party', 'beret', 'beanie', 'crown', 'hoodie'] as const;
    const glasses = ['none', 'round', 'sunglasses', 'reading'] as const;
    const makeups = ['none', 'blush', 'star'] as const;
    const colors = ['#C4A484', '#D7CCC8', '#EFEBE9', '#BCAAA4', '#A1887F'];
    const accessories = selectedRole === 'youth' 
        ? ['none', 'backpack', 'headphones', 'tablet'] as const
        : ['none', 'badge', 'coffee', 'scarf', 'reading'] as const;

    return {
        role: selectedRole,
        baseColor: colors[Math.floor(Math.random() * colors.length)],
        hat: hats[Math.floor(Math.random() * hats.length)],
        glasses: glasses[Math.floor(Math.random() * glasses.length)] as any,
        accessory: accessories[Math.floor(Math.random() * accessories.length)] as any,
        makeup: makeups[Math.floor(Math.random() * makeups.length)],
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
  const [stationId, setStationId] = useState<string>("GLOBAL_STATION");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mascotConfig, setMascotConfig] = useState<MascotOptions>(generateMascotConfig());
  const [logs, setLogs] = useState<CommunityLog[]>([]);

  // 跨設備 Hash 同步邏輯 (Real Sync)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#sync=')) {
        try {
            const encodedData = hash.substring(6);
            const decodedLogs = JSON.parse(decodeURIComponent(atob(encodedData)));
            if (Array.isArray(decodedLogs)) {
                setLogs(prev => {
                    const combined = [...decodedLogs, ...prev];
                    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                    return unique.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                });
                alert("✨ 心靈同步成功！已載入來自其他設備的紀錄。");
                window.location.hash = ''; // 清除 hash
            }
        } catch (e) {
            console.error("同步連結解析失敗", e);
        }
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [step]);

  useEffect(() => {
    const saved = localStorage.getItem(`vibe_logs_${stationId}`);
    if (saved) {
      setLogs(JSON.parse(saved));
    } else {
        setLogs([]);
    }

    const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    return () => {
        if(audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    }
  }, [stationId]);

  useEffect(() => {
    localStorage.setItem(`vibe_logs_${stationId}`, JSON.stringify(logs.slice(0, 100)));
  }, [logs, stationId]);

  // 定期自動同步 (Simulation Pulse)
  useEffect(() => {
    const interval = setInterval(() => {
        if (step === AppStep.COMMUNITY) {
            syncOthers();
        }
    }, 45000); // 每 45 秒嘗試同步一次鄰居
    return () => clearInterval(interval);
  }, [step, stationId]);

  const toggleMusic = () => {
      if (!audioRef.current) return;
      if (isMusicPlaying) {
          audioRef.current.pause();
      } else {
          audioRef.current.play().catch(() => setIsMusicPlaying(false));
      }
      setIsMusicPlaying(!isMusicPlaying);
  };

  const handleBack = () => {
    if (step === AppStep.MOOD_WATER) setStep(AppStep.WELCOME);
    else if (step === AppStep.VIBE_MAP) setStep(AppStep.MOOD_WATER);
    else if (step === AppStep.WHISPER_HOLE) setStep(AppStep.VIBE_MAP);
    else if (step === AppStep.COMMUNITY || step === AppStep.REWARD) setStep(AppStep.WELCOME);
  };

  const handleMascotClick = () => setMascotConfig(generateMascotConfig());
  const handleMoodSubmit = () => setStep(AppStep.VIBE_MAP);
  const handleZoneSubmit = (selectedZone: string) => {
    setZone(selectedZone);
    setTimeout(() => setStep(AppStep.WHISPER_HOLE), 300); 
  };

  const handleWhisperComplete = async (text: string) => {
    setStep(AppStep.REWARD);
    setIsLoadingCard(true);
    setIsSyncing(true); 
    setWhisperData({ text, analysis: null });

    const logId = Date.now().toString();
    const signature = `${SOUL_TITLES[Math.floor(Math.random() * SOUL_TITLES.length)]} #${Math.floor(1000 + Math.random() * 9000)}`;
    const deviceType = getDeviceType();

    const initialLog: CommunityLog = {
        id: logId,
        moodLevel: mood,
        text: text,
        timestamp: new Date().toISOString(),
        theme: "心聲同步中...",
        tags: ["傳輸中"],
        authorSignature: signature,
        authorColor: mascotConfig.baseColor,
        deviceType: deviceType,
        stationId: stationId
    };

    setLogs(prev => [initialLog, ...prev]);

    try {
        const [analysisResult, energyCardResult, imageResult] = await Promise.all([
            analyzeWhisper(text),
            generateEnergyCard(mood, zone),
            generateHealingImage(text, mood, zone)
        ]);

        const fullCard: EnergyCardData = { ...energyCardResult, imageUrl: imageResult || undefined };
        setWhisperData({ text, analysis: analysisResult });
        setCardData(fullCard);

        setLogs(prev => prev.map(l => l.id === logId ? {
            ...l,
            theme: energyCardResult.theme,
            tags: analysisResult.tags,
            fullCard: fullCard,
            replyMessage: analysisResult.replyMessage
        } : l));

        setTimeout(() => setIsSyncing(false), 1200);

    } catch (e) {
        console.error("AI 處理失敗", e);
        setIsSyncing(false);
        const defaultCard = { quote: "即使緩慢，也是在向前行。", theme: "當下", luckyItem: "溫熱的茶" };
        setCardData(defaultCard);
        setLogs(prev => prev.map(l => l.id === logId ? {
            ...l,
            theme: "今日心聲",
            tags: ["本地"]
        } : l));
    } finally {
        setIsLoadingCard(false);
    }
  };

  const syncOthers = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
        const echoes = await fetchCommunityEchoes(stationId, 2);
        const newLogs: CommunityLog[] = echoes.map((e, idx) => ({
            id: `sync-${Date.now()}-${idx}`,
            moodLevel: e.moodLevel || 50,
            text: e.text || "...",
            timestamp: new Date(Date.now() - Math.random() * 500000).toISOString(),
            theme: e.theme || "共鳴",
            tags: e.tags || ["雲端"],
            authorSignature: e.authorSignature,
            authorColor: e.authorColor,
            deviceType: e.deviceType,
            stationId: stationId
        }));
        setLogs(prev => {
            const combined = [...newLogs, ...prev];
            const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
            return unique.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 100);
        });
    } catch (err) {
        console.error("同步失敗", err);
    } finally {
        setTimeout(() => setIsSyncing(false), 1000);
    }
  };

  const handleClearDay = (dateStr: string) => {
      if (window.confirm(`確定要清除 ${dateStr} 的所有紀錄嗎？`)) {
          setLogs(prev => prev.filter(log => new Date(log.timestamp).toLocaleDateString() !== dateStr));
      }
  };

  const handleRestart = () => {
    setStep(AppStep.WELCOME);
    setMood(50);
    setZone(null);
    setWhisperData({text: '', analysis: null});
    setCardData(null);
  };

  const handleGenerateSyncLink = () => {
      try {
          // 只同步最近的 5 筆紀錄以避免 URL 過長
          const dataToSync = logs.filter(l => !l.id.startsWith('sync')).slice(0, 5);
          const encoded = btoa(encodeURIComponent(JSON.stringify(dataToSync)));
          const syncUrl = `${window.location.origin}${window.location.pathname}#sync=${encoded}`;
          
          navigator.clipboard.writeText(syncUrl);
          alert("🔗 同步連結已複製！\n請在手機或 iPad 開啟此連結即可同步你的心聲。");
      } catch (e) {
          alert("連結產生失敗，請稍後再試。");
      }
  };

  const renderMascot = () => {
    const props = { options: mascotConfig, className: "w-16 h-16 md:w-32 md:h-32 drop-shadow-xl transition-all duration-700", onClick: handleMascotClick };
    if (step === AppStep.REWARD) return <Mascot expression="excited" {...props} />;
    if (step === AppStep.WELCOME) return <Mascot expression="sleepy" {...props} />;
    if (step === AppStep.MOOD_WATER || step === AppStep.WHISPER_HOLE) return <Mascot expression="listening" {...props} />;
    return <Mascot expression="happy" {...props} />;
  };

  const getProgressWidth = () => {
      const steps = [AppStep.WELCOME, AppStep.MOOD_WATER, AppStep.VIBE_MAP, AppStep.WHISPER_HOLE, AppStep.REWARD];
      const index = steps.indexOf(step);
      if (index === -1) return "0%";
      return `${(index / (steps.length - 1)) * 100}%`;
  };

  const showBackButton = [AppStep.MOOD_WATER, AppStep.VIBE_MAP, AppStep.WHISPER_HOLE, AppStep.COMMUNITY, AppStep.REWARD].includes(step);

  return (
    <div className="min-h-[100dvh] w-full relative flex flex-col items-center justify-center p-3 md:p-8">
      <div className="fixed inset-0 pointer-events-none opacity-10 overflow-hidden z-0">
          <div className="absolute top-[10%] left-[10%] animate-float"><Sparkles size={30} /></div>
          <div className="absolute top-[60%] right-[10%] animate-float" style={{ animationDelay: '2s' }}><Grid size={24} /></div>
      </div>

      <div className="fixed top-4 left-4 z-[100] flex items-center gap-2 bg-white/60 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white shadow-sm transition-all duration-500">
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-orange-400 animate-pulse' : 'bg-emerald-400'}`}></div>
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
              {isSyncing ? '同步中...' : '心靈雲端已連線'}
              {isSyncing ? <CloudDownload size={10} className="animate-bounce" /> : <Globe size={10} />}
          </span>
      </div>

      <button 
        onClick={toggleMusic}
        className="fixed top-4 right-4 z-[100] p-3 bg-white/60 backdrop-blur-xl rounded-full shadow-lg border border-white text-stone-600 active:scale-90 transition-transform"
      >
        {isMusicPlaying ? <Volume2 size={18} className="text-amber-500 animate-pulse" /> : <VolumeX size={18} />}
      </button>

      <main className="w-full max-w-2xl min-h-[min(680px,85dvh)] glass-panel rounded-[1.8rem] md:rounded-[2.5rem] p-5 md:p-12 shadow-2xl flex flex-col relative transition-all duration-700 animate-soft-in overflow-hidden z-10">
        
        {showBackButton && (
          <button 
            onClick={handleBack}
            className="absolute top-5 left-5 p-2 text-stone-400 hover:text-stone-700 active:bg-stone-50 rounded-full transition-all z-[100] flex items-center gap-1"
          >
            <ChevronLeft size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Back</span>
          </button>
        )}

        <div className="absolute top-0 left-0 right-0 h-1 bg-stone-100/20 overflow-hidden z-[50]">
            <div className="h-full bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 transition-all duration-1000 ease-out" style={{ width: getProgressWidth() }}></div>
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
                    <p className="text-stone-600 leading-relaxed serif-font text-base italic">
                      "在這個步調飛快的城市裡，<br/>給自己留下一分鐘的留白。"
                    </p>
                  </div>
              </div>

              <div className="mt-6 flex flex-col items-center gap-2">
                <span className="text-[9px] text-stone-300 font-bold uppercase tracking-widest">目前連接車站：</span>
                <div className="flex items-center gap-2 px-3 py-1 bg-stone-50 rounded-lg border border-stone-100">
                   <Globe size={12} className="text-stone-400" />
                   <input 
                      type="text" 
                      value={stationId} 
                      onChange={(e) => setStationId(e.target.value.toUpperCase())}
                      className="bg-transparent text-[10px] font-mono text-stone-600 outline-none w-24 text-center"
                   />
                </div>
              </div>

              <div className="space-y-3 w-full mt-8 md:mt-12 pb-2">
                <button 
                  onClick={() => { if (!isMusicPlaying) toggleMusic(); setStep(AppStep.MOOD_WATER); }}
                  className="w-full py-4 font-bold text-white text-lg bg-stone-800 rounded-2xl shadow-[0_4px_0_rgb(44,40,36)] active:shadow-none active:translate-y-[4px] hover:bg-stone-700 transition-all flex items-center justify-center group"
                >
                  開始檢測 <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                </button>
                <div className="flex gap-2">
                    <button 
                        onClick={() => { syncOthers(); setStep(AppStep.COMMUNITY); }} 
                        className="flex-[2] py-3 font-bold text-stone-400 bg-white/40 border border-stone-100 rounded-2xl flex items-center justify-center gap-2 text-xs active:bg-stone-50 transition-all"
                    >
                        <Grid size={14} /> 瀏覽心聲牆
                    </button>
                    <button 
                        onClick={handleGenerateSyncLink}
                        className="flex-1 py-3 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl flex items-center justify-center hover:bg-amber-100 transition-all"
                        title="產生同步連結"
                    >
                        <Link2 size={16} />
                    </button>
                </div>
              </div>
            </div>
          )}

          {step === AppStep.MOOD_WATER && <div className="w-full flex flex-col items-center h-full animate-soft-in pb-4"><MoodWater value={mood} onChange={setMood} /><button onClick={handleMoodSubmit} className="w-full max-w-xs py-4 bg-stone-800 text-white rounded-2xl font-bold mt-6 shadow-[0_4px_0_rgb(44,40,36)] active:translate-y-[4px] active:shadow-none transition-all">確認電量</button></div>}
          {step === AppStep.VIBE_MAP && <div className="w-full animate-soft-in"><VibeMap onZoneSelect={handleZoneSubmit} /></div>}
          {step === AppStep.WHISPER_HOLE && <div className="w-full animate-soft-in"><WhisperHole onComplete={handleWhisperComplete} /></div>}
          
          {step === AppStep.REWARD && (
            <div key="reward-screen" className="w-full animate-soft-in flex flex-col items-center h-full py-2">
              {isLoadingCard ? (
                 <div className="flex flex-col items-center gap-6 py-16 text-center">
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 border-2 border-stone-100 rounded-full"></div>
                        <div className="absolute inset-0 border-2 border-amber-300 rounded-full border-t-transparent animate-spin"></div>
                        <Sparkles className="absolute inset-0 m-auto text-amber-300 animate-pulse" size={18} />
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold text-lg text-stone-700 serif-font italic">心聲封印中...</p>
                        <p className="text-stone-400 text-[8px] tracking-[0.2em] uppercase">Sealing your energy card</p>
                    </div>
                 </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <EnergyCard data={cardData!} analysis={whisperData.analysis} moodLevel={mood} />
                  <div className="w-full max-w-[320px] flex gap-2 mt-6 pb-6">
                    <button onClick={() => { syncOthers(); setStep(AppStep.COMMUNITY); }} className="flex-1 py-3 bg-white/50 hover:bg-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition-all border border-stone-100"><Grid size={12} /> 同步心聲牆</button>
                    <button onClick={handleRestart} className="flex-1 py-3 bg-stone-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 shadow-[0_3px_0_rgb(44,40,36)] active:translate-y-[3px] active:shadow-none transition-all"><RotateCcw size={12} /> 再試一次</button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {step === AppStep.COMMUNITY && (
            <CommunityBoard 
                logs={logs} 
                onBack={() => setStep(AppStep.WELCOME)} 
                onClearDay={handleClearDay} 
                onRefresh={syncOthers} 
                isSyncing={isSyncing} 
                onGenerateSyncLink={handleGenerateSyncLink}
            />
          )}
        </div>
      </main>
      <footer className="mt-4 text-stone-300 text-[8px] font-bold tracking-[0.4em] uppercase opacity-40 text-center">Youth Center // Soul Station // {stationId}</footer>
    </div>
  );
};

export default App;
