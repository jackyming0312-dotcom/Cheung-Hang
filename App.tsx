import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw, Grid, Volume2, VolumeX, Sparkles, ChevronLeft } from 'lucide-react';

import Mascot from './components/Mascot';
import MoodWater from './components/MoodWater';
import VibeMap from './components/VibeMap';
import WhisperHole from './components/WhisperHole';
import EnergyCard from './components/EnergyCard';
import CommunityBoard from './components/CommunityBoard';

import { generateEnergyCard, analyzeWhisper, generateHealingImage } from './services/geminiService';
import { AppStep, GeminiAnalysisResult, EnergyCardData, CommunityLog, MascotOptions } from './types';

const generateMascotConfig = (): MascotOptions => {
    const hats = ['none', 'party', 'beret', 'beanie', 'crown', 'hoodie'] as const;
    const glasses = ['none', 'round', 'sunglasses', 'reading'] as const;
    const accessories = ['none', 'scarf', 'bowtie', 'flower', 'badge', 'backpack', 'tablet'] as const;
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

  const handleBack = () => {
    if (step === AppStep.MOOD_WATER) setStep(AppStep.WELCOME);
    else if (step === AppStep.VIBE_MAP) setStep(AppStep.MOOD_WATER);
    else if (step === AppStep.WHISPER_HOLE) setStep(AppStep.VIBE_MAP);
    else if (step === AppStep.COMMUNITY) setStep(AppStep.WELCOME);
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
            generateHealingImage(text, mood, zone) // 傳入 zone 以優化圖片背景
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
    const props = { options: mascotConfig, className: "w-24 h-24 md:w-32 md:h-32 drop-shadow-xl transition-all duration-700 hover:scale-105", onClick: handleMascotClick };
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

  const showBackButton = [AppStep.MOOD_WATER, AppStep.VIBE_MAP, AppStep.WHISPER_HOLE, AppStep.COMMUNITY].includes(step);

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">
      <button 
        onClick={toggleMusic}
        className="fixed top-6 right-6 z-50 p-3.5 bg-white/40 backdrop-blur-xl rounded-full shadow-xl border border-white/60 text-stone-600 hover:bg-stone-50 hover:scale-110 transition-all active:scale-95 group"
      >
        {isMusicPlaying ? <Volume2 size={20} className="text-amber-500 animate-pulse" /> : <VolumeX size={20} />}
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[7px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-stone-400">Audio</div>
      </button>

      <main className="w-full max-w-2xl min-h-[720px] glass-panel rounded-[2.5rem] p-6 md:p-12 shadow-2xl flex flex-col relative transition-all duration-700 animate-soft-in overflow-hidden">
        
        {/* Back Button - Neatly aligned top left */}
        {showBackButton && (
          <button 
            onClick={handleBack}
            className="absolute top-8 left-8 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-full transition-all group flex items-center gap-1 z-50"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">Back</span>
          </button>
        )}

        {/* Progress Bar - Sleek top alignment */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-stone-100/20 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 transition-all duration-1000 ease-out" style={{ width: getProgressWidth() }}></div>
        </div>

        <header className="w-full flex flex-col items-center mb-6 pt-2">
           <div className="mb-2">{renderMascot()}</div>
           <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-stone-800 tracking-tight serif-font">心靈充電站</h1>
              <div className="flex items-center justify-center gap-3 mt-2">
                  <div className="h-[1px] w-6 bg-stone-100"></div>
                  <span className="text-[9px] text-stone-400 font-bold tracking-[0.4em] uppercase">Youth Sanctuary</span>
                  <div className="h-[1px] w-6 bg-stone-100"></div>
              </div>
           </div>
        </header>

        <div className="w-full flex-1 flex flex-col items-center justify-start py-2">
          {step === AppStep.WELCOME && (
            <div className="w-full flex flex-col justify-between h-full animate-soft-in max-w-md mx-auto">
              <div className="relative paper-stack mt-6">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 washi-tape opacity-50"></div>
                  <div className="bg-white/90 p-8 md:p-10 rounded-[2rem] border border-stone-100 shadow-xl text-center">
                    <p className="text-stone-600 leading-relaxed serif-font text-base md:text-lg italic">
                      "在這個步調飛快的城市裡，<br/>給自己留下一分鐘的留白。"
                    </p>
                  </div>
              </div>

              <div className="space-y-3 w-full mt-10">
                <button 
                  onClick={() => { if (!isMusicPlaying) toggleMusic(); setStep(AppStep.MOOD_WATER); }}
                  className="w-full py-4.5 font-bold text-white text-lg bg-stone-800 rounded-2xl shadow-[0_6px_0_rgb(44,40,36)] active:shadow-none active:translate-y-[6px] hover:bg-stone-700 transition-all flex items-center justify-center group"
                >
                  開始檢測 <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                </button>
                <button 
                    onClick={() => setStep(AppStep.COMMUNITY)} 
                    className="w-full py-3.5 font-bold text-stone-400 bg-transparent border border-stone-100 rounded-2xl flex items-center justify-center gap-2 text-xs hover:bg-stone-50 hover:text-stone-600 transition-all"
                >
                  <Grid size={16} /> 瀏覽歷史心聲
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
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-2 border-stone-50 rounded-full"></div>
                        <div className="absolute inset-0 border-2 border-amber-300 rounded-full border-t-transparent animate-spin"></div>
                        <Sparkles className="absolute inset-0 m-auto text-amber-300 animate-pulse" size={24} />
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold text-xl text-stone-700 serif-font italic">能量轉化中</p>
                        <p className="text-stone-400 text-[10px] tracking-[0.3em] uppercase">Tuning your soul prescription</p>
                    </div>
                 </div>
              ) : (
                <>
                  <EnergyCard data={cardData!} analysis={whisperData.analysis} moodLevel={mood} />
                  <div className="w-full max-w-sm flex gap-3 mt-10 pb-2">
                    <button onClick={() => setStep(AppStep.COMMUNITY)} className="flex-1 py-3.5 bg-stone-50 hover:bg-stone-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"><Grid size={16} /> 回憶網格</button>
                    <button onClick={handleRestart} className="flex-1 py-3.5 bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-[0_4px_0_rgb(44,40,36)] active:translate-y-[4px] active:shadow-none transition-all"><RotateCcw size={16} /> 再試一次</button>
                  </div>
                </>
              )}
            </div>
          )}
          
          {step === AppStep.COMMUNITY && <CommunityBoard onBack={() => setStep(AppStep.WELCOME)} />}
        </div>
      </main>
      <footer className="mt-8 text-stone-300 text-[9px] font-bold tracking-[0.5em] uppercase opacity-50">Soul Station // Daily Vibes</footer>
    </div>
  );
};

export default App;