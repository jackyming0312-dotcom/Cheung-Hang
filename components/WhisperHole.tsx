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
    }, 1200);
  };

  const charCount = text.length;
  const isEnabled = text.trim().length > 0 && !isSending;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center animate-soft-in">
      <div className="text-center mb-10">
        <div className="inline-block px-3 py-1 bg-stone-100 rounded-full mb-3">
           <span className="text-[10px] text-stone-400 font-bold tracking-[0.2em] uppercase">Step 03 // Journaling</span>
        </div>
        <h3 className="text-3xl text-stone-700 font-semibold serif-font mb-2 italic">
          Soul Whispers
        </h3>
        <p className="text-stone-400 text-xs tracking-widest uppercase">在平靜的紙面上，留下你此刻真實的感觸</p>
      </div>

      <div className="w-full relative paper-stack group transition-transform duration-500">
        {/* Washi Tape Decorations - Enhanced with better rotation */}
        <div className="absolute -top-4 left-1/4 -translate-x-1/2 w-24 h-7 washi-tape rotate-[-1.5deg] z-20 opacity-90"></div>
        
        <div className="relative bg-[#fffdfa] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-stone-200/50 p-8 pt-12 overflow-hidden flex flex-col">
            {/* Ruled lines for writing feel */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(transparent 39px, #4a4036 1px)', backgroundSize: '100% 40px' }}>
            </div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-stone-50 rounded-lg text-stone-400">
                   <PenTool size={18} />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-300">Diary Entry</span>
                   <span className="text-[9px] text-stone-400 font-mono">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex-1 border-t border-dashed border-stone-100 ml-4"></div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="此刻在這裡，我感覺到..."
              className="w-full h-56 bg-transparent outline-none resize-none transition-all text-stone-700 placeholder:text-stone-200 text-xl leading-[40px] font-handwriting relative z-10 custom-scrollbar"
              disabled={isSending}
            />
            
            {/* Integrated Action Bar at the bottom of the paper */}
            <div className="mt-8 flex items-center justify-between relative z-10 border-t border-stone-50 pt-6">
                <div className={`flex items-center gap-2 transition-opacity duration-300 ${text.length > 0 ? 'opacity-100' : 'opacity-30'}`}>
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
                   <span className="text-[11px] text-stone-400 font-mono tracking-tighter">
                      {charCount} / 200 words
                   </span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!isEnabled}
                  className={`relative px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all duration-500 overflow-hidden
                    ${!isEnabled 
                      ? 'bg-stone-50 text-stone-200 cursor-not-allowed' 
                      : 'bg-stone-800 text-white hover:bg-stone-700 hover:shadow-lg active:scale-95 group/btn'}
                  `}
                >
                  <span className="relative z-10 flex items-center gap-2 tracking-widest uppercase text-[11px]">
                    {isSending ? (
                      <>
                        <Sparkles className="animate-spin" size={14}/> Processing
                      </>
                    ) : (
                      <>
                        Seal & Send <Send size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </span>
                  
                  {/* Subtle shine effect on hover */}
                  {isEnabled && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                  )}
                </button>
            </div>
        </div>
        
        {/* Decorative corner element */}
        <div className="absolute -bottom-2 -left-2 w-12 h-12 border-l-2 border-b-2 border-stone-200/50 rounded-bl-3xl -z-10"></div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-[10px] text-stone-300 uppercase tracking-[0.3em] font-bold">
         <div className="w-2 h-2 rounded-full border border-stone-200"></div>
         End of Message
         <div className="w-2 h-2 rounded-full border border-stone-200"></div>
      </div>
    </div>
  );
};

export default WhisperHole;