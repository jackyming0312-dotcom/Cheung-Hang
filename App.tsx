import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw, Grid, Volume2, VolumeX } from 'lucide-react';

import Mascot from './components/Mascot';
import MoodWater from './components/MoodWater';
import VibeMap from './components/VibeMap';
import WhisperHole from './components/WhisperHole';
import EnergyCard from './components/EnergyCard';
import CommunityBoard from './components/CommunityBoard';

import { generateEnergyCard, analyzeWhisper, generateHealingImage } from './services/geminiService';
import { AppStep, GeminiAnalysisResult, EnergyCardData, CommunityLog, MascotOptions } from './types';

const BG_IMAGES = [
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&auto=format&fit=crop&q=60", 
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=500&auto=format&fit=crop&q=60", 
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=60", 
    "https://images.unsplash.com/photo-1544642899-f0d6e5f6ed6f?w=500&auto=format&fit=crop&q=60"  
];

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
    // Audio Initialization with proper error handling
    const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3");
    audio.loop = true;
    audio.volume = 0.4;
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
          audioRef.current.play().catch(e => {
            console.warn("Autoplay blocked by browser. User interaction required.");
            setIsMusicPlaying(false);
          });
      }
      setIsMusicPlaying(!isMusicPlaying);
  };

  const handleMascotClick = () => setMascotConfig(generateMascotConfig());
  const handleMoodSubmit = () => setStep(AppStep.VIBE_MAP);
  const handleZoneSubmit = (selectedZone: string) => {
    setZone(selectedZone);
    setTimeout(() => setStep(AppStep.WHISPER_HOLE), 400); 
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
    const props = { options: mascotConfig, className: "w-24 h-24 md:w-32 md:h-32", onClick: handleMascotClick };
    if (step === AppStep.REWARD) return <Mascot expression="excited" {...props} />;
    if (step === AppStep.WELCOME) return <Mascot expression="sleepy" {...props} />;
    if (step === AppStep.MOOD_WATER || step === AppStep.WHISPER_HOLE) return <Mascot expression="listening" {...props} />;
    return <Mascot expression="happy" {...props} />;
  };

  const getStepTitle = () => {
    const titles: Record<string, string> = {
      [AppStep.WELCOME]: "心靈充電站", [AppStep.MOOD_WATER]: "能量檢測",
      [AppStep.VIBE_MAP]: "空間體驗", [AppStep.WHISPER_HOLE]: "心情樹洞",
      [AppStep.REWARD]: "您的能量卡", [AppStep.COMMUNITY]: "心情格子"
    };
    return titles[step] || "";
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-4">
      <button 
        onClick={toggleMusic}
        className="fixed top-6 right-6 z-50 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-stone-200 text-stone-600 hover:bg-stone-100 transition-all active:scale-95"
      >
        {isMusicPlaying ? <Volume2 size={20} className="text-amber-500" /> : <VolumeX size={20} />}
      </button>

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-30">
         <div className="absolute top-[5%] left-[5%] w-48 h-64 bg-white p-2 shadow-lg transform -rotate-6 hidden md:block"><img src={BG_IMAGES[1]} className="w-full h-full object-cover" /></div>
         <div className="absolute bottom-[10%] right-[5%] w-56 h-40 bg-white p-2 shadow-lg transform rotate-3 hidden md:block"><img src={BG_IMAGES[0]} className="w-full h-full object-cover" /></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-100/30 rounded-full blur-[100px]"></div>
      </div>

      <main className="w-full max-w-2xl min-h-[700px] glass-panel rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col relative transition-all duration-500 border border-white/80">
        <div className="w-full flex flex-col items-center mb-4 pt-2">
           <div className="mb-2 transform hover:scale-110 transition-transform duration-300 drop-shadow-lg">{renderMascot()}</div>
           <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-stone-800 tracking-tight serif-font">{getStepTitle()}</h1>
              <div className="h-1.5 w-16 bg-gradient-to-r from-amber-200 to-amber-400 mx-auto my-3 rounded-full"></div>
           </div>
        </div>

        <div className="w-full flex-1 flex flex-col items-center justify-start py-4">
          {step === AppStep.WELCOME && (
            <div className="w-full flex flex-col justify-between h-full animate-fade-in max-w-sm mx-auto">
              <div className="bg-white/60 p-6 rounded-2xl border border-stone-100 shadow-sm text-center mb-8 relative">
                <p className="text-stone-600 leading-relaxed text-sm font-medium">
                  <span className="block mb-2 font-bold text-stone-700 text-lg">今天好嗎？</span>
                  歡迎來到心靈充電站，準備好進行一場情緒微旅行了嗎？
                </p>
              </div>
              <div className="space-y-4 w-full mt-auto">
                <button 
                  onClick={() => { if (!isMusicPlaying) toggleMusic(); setStep(AppStep.MOOD_WATER); }}
                  className="w-full py-4 font-bold text-white text-lg bg-gradient-to-r from-stone-800 to-stone-700 rounded-2xl shadow-[0_6px_0_rgb(68,64,60)] active:shadow-none active:translate-y-[6px] hover:brightness-110 transition-all flex items-center justify-center group"
                >
                  開始檢測 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => setStep(AppStep.COMMUNITY)} className="w-full py-3.5 font-medium text-stone-600 bg-white border-2 border-stone-100 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-sm">
                  <Grid size={16} /> 瀏覽歷史心情
                </button>
              </div>
            </div>
          )}

          {step === AppStep.MOOD_WATER && <div className="w-full flex flex-col items-center h-full animate-fade-in pb-4"><MoodWater value={mood} onChange={setMood} /><button onClick={handleMoodSubmit} className="w-full max-w-xs py-3.5 bg-stone-800 text-white rounded-xl font-bold mt-6 shadow-[0_4px_0_rgb(68,64,60)] active:translate-y-[4px] active:shadow-none transition-all">下一步</button></div>}
          {step === AppStep.VIBE_MAP && <div className="w-full animate-fade-in"><VibeMap onZoneSelect={handleZoneSubmit} /></div>}
          {step === AppStep.WHISPER_HOLE && <div className="w-full animate-fade-in"><WhisperHole onComplete={handleWhisperComplete} /></div>}
          {step === AppStep.REWARD && (
            <div className="w-full animate-fade-in flex flex-col items-center">
              {isLoadingCard ? (
                 <div className="flex flex-col items-center gap-6 text-stone-400 py-16 animate-pulse text-center">
                    <div className="w-16 h-16 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                    <p className="font-bold text-lg text-stone-600">正在調配能量處方...</p>
                 </div>
              ) : (
                <>
                  <EnergyCard data={cardData!} analysis={whisperData.analysis} moodLevel={mood} />
                  <div className="w-full max-w-sm flex gap-3 mt-8">
                    <button onClick={() => setStep(AppStep.COMMUNITY)} className="flex-1 py-3 bg-amber-100/50 hover:bg-amber-100 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"><Grid size={16} /> 瀏覽格子</button>
                    <button onClick={handleRestart} className="flex-1 py-3 border-2 border-stone-200 hover:border-stone-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"><RotateCcw size={16} /> 重新開始</button>
                  </div>
                </>
              )}
            </div>
          )}
          {step === AppStep.COMMUNITY && <CommunityBoard onBack={() => setStep(AppStep.WELCOME)} />}
        </div>
      </main>
      <footer className="mt-6 text-stone-500/80 text-[10px] md:text-xs font-medium tracking-widest uppercase">Soul Station © {new Date().getFullYear()} · Daily Vibes</footer>
    </div>
  );
};

export default App;