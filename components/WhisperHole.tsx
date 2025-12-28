import React, { useState } from 'react';
import { Send, Sparkles, PenTool, Hash } from 'lucide-react';

interface WhisperHoleProps {
  onComplete: (text: string) => void;
}

const WhisperHole: React.FC<WhisperHoleProps> = ({ onComplete }) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    setIsSending(true);
    setTimeout(() => {
        onComplete(text);
    }, 800);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center animate-soft-in">
      <div className="text-center mb-8">
        <h3 className="text-2xl text-stone-700 font-semibold serif-font mb-1 italic">
          Soul Whispers
        </h3>
        <p className="text-stone-400 text-xs tracking-widest uppercase">分享這份空間帶給你的細微感動</p>
      </div>

      <div className="w-full relative paper-stack group">
        {/* Washi Tape Decorations */}
        <div className="absolute -top-3 left-10 w-20 h-6 washi-tape rotate-[-2deg] z-20"></div>
        <div className="absolute -bottom-3 right-10 w-24 h-6 washi-tape rotate-[3deg] z-20"></div>

        <div className="relative bg-[#fffdfa] rounded-2xl shadow-xl border border-stone-200/60 p-8 overflow-hidden">
            {/* Ruled lines for writing feel */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(transparent 39px, #4a4036 1px)', backgroundSize: '100% 40px' }}>
            </div>

            <div className="flex items-center gap-2 mb-4 relative z-10 text-stone-400">
                <PenTool size={16} />
                <span className="text-[10px] uppercase tracking-widest font-bold">Diary Entry</span>
                <div className="flex-1 border-t border-dashed border-stone-200 ml-2"></div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="今天在這裡，有一瞬間我覺得..."
              className="w-full h-48 bg-transparent outline-none resize-none transition-all text-stone-700 placeholder:text-stone-300 text-lg leading-[40px] font-handwriting relative z-10"
              disabled={isSending}
            />
            
            <div className="mt-4 flex justify-end relative z-10">
                <div className="flex items-center gap-1 text-[10px] text-stone-300 font-mono">
                   <Hash size={10} />
                   <span>{text.length} chars</span>
                </div>
            </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!text.trim() || isSending}
        className={`mt-12 px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all duration-500 shadow-xl
          ${!text.trim() || isSending 
            ? 'bg-stone-100 text-stone-300 cursor-not-allowed grayscale' 
            : 'bg-stone-800 text-white hover:bg-stone-700 hover:scale-105 active:scale-95 hover:shadow-2xl'}
        `}
      >
        {isSending ? (
          <>
            <Sparkles className="animate-spin" size={20}/> 能量轉化中...
          </>
        ) : (
          <>
            封存心聲 <Send size={20} className="rotate-12" />
          </>
        )}
      </button>
    </div>
  );
};

export default WhisperHole;