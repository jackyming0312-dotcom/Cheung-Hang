import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw, Grid, Volume2, VolumeX, Sparkles } from 'lucide-react';

import Mascot from './components/Mascot';
import MoodWater from './components/MoodWater';
import VibeMap from './components/VibeMap';
import WhisperHole from './components/WhisperHole';
import EnergyCard from './components/EnergyCard';
import CommunityBoard from './components/CommunityBoard';

import { generateEnergyCard, analyzeWhisper, generateHealingImage } from './services/geminiService';
import { AppStep, GeminiAnalysisResult, EnergyCardData, CommunityLog, MascotOptions } from './types';

const generateMascotConfig = (): MascotOptions => {
    const hats = ['none', 'party', 'beret', 'beanie', 'crown'] as const;
    const glasses = ['none', 'round', 'sunglasses'] as const;
    const accessories = ['none', 'scarf', 'bowtie', 'flower'] as const;
    const makeups = ['none', 'blush', 'star'] as const;
    const colors = ['#C4A484', '#D7CCC8', '#EFEBE9', '#BCAAA4', '#A1887F'];

    return {
        baseColor: colors[Math.floor(Math.random() * colors.length)],
        hat: hats[Math.floor(Math.random() * hats.length)],
        glasses: glasses[Math.floor(Math.random() * glasses.length)],
        accessory: accessories[Math.floor(Math.random() * accessories.length)],
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mascotConfig, setMascotConfig] = useState<MascotOptions>(generateMascotConfig());

  useEffect(() => {
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
  }, []);

  const toggleMusic = () => {
      if (!audioRef.current) return;
      if (isMusicPlaying) {
          audioRef.current.pause();
      } else {
          audioRef.current.play().catch(() => setIsMusicPlaying(false));
      }
      setIsMusicPlaying(!isMusicPlaying);
  };

  const handleMascotClick = () => setMascotConfig(generateMascotConfig());
  const handleMoodSubmit = () => setStep(AppStep.VIBE_MAP);
  const handleZoneSubmit = (selectedZone: string) => {
    setZone(selectedZone);
    setTimeout(() => setStep(AppStep.WHISPER_HOLE), 500); 
  };

  const handleWhisperComplete = async (text: string) => {
    setStep(AppStep.REWARD);
    setIsLoadingCard(true);
    setWhisperData(prev => ({ ...prev, text }));

    try {
        const [analysisResult, energyCardResult, imageResult] = await Promise.all([
            analyzeWhisper(text),
            generateEnergyCard(mood, zone),
            generateHealingImage(text, mood)
        ]);

        setWhisperData({ text, analysis: analysisResult });
        setCardData({ ...energyCardResult, imageUrl: imageResult || undefined });

        const newLog: CommunityLog = {
            id: Date.now().toString(),
            moodLevel: mood,
            text: text,
            timestamp: new Date().toISOString(),
            theme: energyCardResult.theme,
            tags: analysisResult.tags
        };

        const existingLogs = JSON.parse(localStorage.getItem('vibe_logs') || '[]');
        localStorage.setItem('vibe_logs', JSON.stringify([...existingLogs, newLog].slice(-50)));

    } catch (e) {
        console.error("System processing error", e);
    } finally {
        setIsLoadingCard(false);
    }
  };

  const handleRestart = () => {
    setStep(AppStep.WELCOME);
    setMood(50);
    setZone(null);
    setWhisperData({text: '', analysis: null});
    setCardData(null);
  };

  const renderMascot = () => {
    const props = { options: mascotConfig, className: "w-28 h-28 md:w-36 md:h-36 drop-shadow-2xl", onClick: handleMascotClick };
    if (step === AppStep.REWARD) return <Mascot expression="excited" {...props} />;
    if (step === AppStep.WELCOME) return <Mascot expression="sleepy" {...props} />;
    if (step === AppStep.MOOD_WATER || step === AppStep.WHISPER_HOLE) return <Mascot expression="listening" {...props} />;
    return <Mascot expression="happy" {...props} />;
  };

  const getProgressWidth = () => {
      const steps = [AppStep.WELCOME, AppStep.MOOD_WATER, AppStep.VIBE_MAP, AppStep.WHISPER_HOLE, AppStep.REWARD];
      const index = steps.indexOf(step);
      return `${(index / (steps.length - 1)) * 100}%`;
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-12">
      <button 
        onClick={toggleMusic}
        className="fixed top-8 right-8 z-50 p-4 bg-white/60 backdrop-blur-xl rounded-full shadow-2xl border border-white/80 text-stone-600 hover:bg-stone-50 hover:scale-110 transition-all active:scale-95 group"
      >
        {isMusicPlaying ? <Volume2 size={24} className="text-amber-500 animate-pulse" /> : <VolumeX size={24} />}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Audio</div>
      </button>

      <main className="w-full max-w-2xl min-h-[750px] glass-panel rounded-[3rem] p-8 md:p-14 shadow-2xl flex flex-col relative transition-all duration-700 animate-soft-in">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-100/30 overflow-hidden rounded-t-[3rem]">
            <div className="h-full bg-gradient-to-r from-amber-200 to-amber-400 transition-all duration-1000 ease-out" style={{ width: getProgressWidth() }}></div>
        </div>

        <header className="w-full flex flex-col items-center mb-8 pt-4">
           <div className="mb-4 transform hover:scale-110 transition-transform duration-500 cursor-pointer">{renderMascot()}</div>
           <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-stone-800 tracking-tight serif-font">心靈充電站</h1>
              <div className="flex items-center justify-center gap-3 mt-3">
                  <div className="h-[1px] w-8 bg-stone-200"></div>
                  <span className="text-[10px] text-stone-400 font-bold tracking-[0.3em] uppercase">Soul Sanctuary v2</span>
                  <div className="h-[1px] w-8 bg-stone-200"></div>
              </div>
           </div>
        </header>

        <div className="w-full flex-1 flex flex-col items-center justify-start py-2">
          {step === AppStep.WELCOME && (
            <div className="w-full flex flex-col justify-between h-full animate-soft-in max-w-md mx-auto">
              <div className="relative paper-stack mt-8">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 washi-tape opacity-60"></div>
                  <div className="bg-white/90 p-10 rounded-3xl border border-stone-100 shadow-xl text-center">
                    <p className="text-stone-600 leading-relaxed serif-font text-lg md:text-xl italic">
                      "在這個步調飛快的城市裡，<br/>給自己留下一分鐘的留白。"
                    </p>
                    <div className="mt-6 text-stone-400 text-xs font-bold tracking-widest uppercase">準備好進行一場情緒微旅行了嗎？</div>
                  </div>
              </div>

              <div className="space-y-4 w-full mt-12">
                <button 
                  onClick={() => { if (!isMusicPlaying) toggleMusic(); setStep(AppStep.MOOD_WATER); }}
                  className="w-full py-5 font-bold text-white text-xl bg-stone-800 rounded-[1.5rem] shadow-[0_8px_0_rgb(44,40,36)] active:shadow-none active:translate-y-[8px] hover:bg-stone-700 transition-all flex items-center justify-center group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">開始檢測 <ArrowRight className="group-hover:translate-x-2 transition-transform" /></span>
                </button>
                <button 
                    onClick={() => setStep(AppStep.COMMUNITY)} 
                    className="w-full py-4 font-bold text-stone-500 bg-white/50 border-2 border-stone-100 rounded-[1.5rem] flex items-center justify-center gap-3 text-sm hover:bg-white hover:text-stone-800 transition-all"
                >
                  <Grid size={18} /> 瀏覽歷史心聲
                </button>
              </div>
            </div>
          )}

          {step === AppStep.MOOD_WATER && <div className="w-full flex flex-col items-center h-full animate-soft-in pb-4"><MoodWater value={mood} onChange={setMood} /><button onClick={handleMoodSubmit} className="w-full max-w-xs py-4 bg-stone-800 text-white rounded-2xl font-bold mt-10 shadow-[0_6px_0_rgb(44,40,36)] active:translate-y-[6px] active:shadow-none transition-all">確認電量</button></div>}
          {step === AppStep.VIBE_MAP && <div className="w-full animate-soft-in"><VibeMap onZoneSelect={handleZoneSubmit} /></div>}
          {step === AppStep.WHISPER_HOLE && <div className="w-full animate-soft-in"><WhisperHole onComplete={handleWhisperComplete} /></div>}
          
          {step === AppStep.REWARD && (
            <div className="w-full animate-soft-in flex flex-col items-center">
              {isLoadingCard ? (
                 <div className="flex flex-col items-center gap-8 py-20 text-center">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-amber-400 rounded-full border-t-transparent animate-spin"></div>
                        <Sparkles className="absolute inset-0 m-auto text-amber-400 animate-pulse" size={32} />
                    </div>
                    <div className="space-y-2">
                        <p className="font-bold text-2xl text-stone-800 serif-font italic tracking-wide">能量轉化中...</p>
                        <p className="text-stone-400 text-xs tracking-[0.2em] uppercase">正在調配您的專屬處方卡</p>
                    </div>
                 </div>
              ) : (
                <>
                  <EnergyCard data={cardData!} analysis={whisperData.analysis} moodLevel={mood} />
                  <div className="w-full max-w-sm flex gap-4 mt-12 pb-4">
                    <button onClick={() => setStep(AppStep.COMMUNITY)} className="flex-1 py-4 bg-stone-100 hover:bg-stone-200 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all"><Grid size={18} /> 回憶網格</button>
                    <button onClick={handleRestart} className="flex-1 py-4 bg-stone-800 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_0_rgb(44,40,36)] active:translate-y-[4px] active:shadow-none transition-all"><RotateCcw size={18} /> 再試一次</button>
                  </div>
                </>
              )}
            </div>
          )}
          
          {step === AppStep.COMMUNITY && <CommunityBoard onBack={() => setStep(AppStep.WELCOME)} />}
        </div>
      </main>
      <footer className="mt-10 text-stone-400 text-[10px] font-bold tracking-[0.4em] uppercase opacity-60">Soul Station // Daily Vibes // Est. 2024</footer>
    </div>
  );
};

export default App;