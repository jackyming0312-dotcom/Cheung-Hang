
import React, { useState } from 'react';
import { Send, Sparkles, PenTool } from 'lucide-react';

interface WhisperHoleProps {
  onComplete: (text: string) => void;
}

const WhisperHole: React.FC<WhisperHoleProps> = ({ onComplete }) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = () => {
    if (!text.trim() || isSending) return;
    setIsSending(true);
    // 立即調用回調，由 App 層處理切換，移除視覺延遲
    onComplete(text);
  };

  const charCount = text.length;
  const isEnabled = text.trim().length > 0 && !isSending;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center animate-soft-in">
      <div className="text-center mb-6 md:mb-10">
        <div className="inline-block px-3 py-1 bg-stone-100 rounded-full mb-3">
           <span className="text-[10px] text-stone-400 font-bold tracking-[0.2em] uppercase">Step 03 // Journaling</span>
        </div>
        <h3 className="text-2xl md:text-3xl text-stone-700 font-semibold serif-font mb-2 italic">
          Soul Whispers
        </h3>
        <p className="text-stone-400 text-[10px] md:text-xs tracking-widest uppercase">在平靜的紙面上，留下你此刻真實的感觸</p>
      </div>

      <div className="w-full relative paper-stack group">
        <div className="absolute -top-3 left-1/4 -translate-x-1/2 w-20 h-6 washi-tape rotate-[-1deg] z-20 opacity-90"></div>
        
        <div className="relative bg-[#fffdfa] rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-stone-200/50 p-6 md:p-8 pt-10 overflow-hidden flex flex-col">
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(transparent 34px, #4a4036 1px)', backgroundSize: '100% 35px' }}>
            </div>

            <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-1.5 bg-stone-50 rounded-lg text-stone-400">
                   <PenTool size={16} />
                </div>
                <div className="flex flex-col">
                   <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-stone-300">Diary Entry</span>
                </div>
                <div className="flex-1 border-t border-dashed border-stone-100 ml-4"></div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="此刻在這裡，我感覺到..."
              className="w-full h-48 md:h-56 bg-transparent outline-none resize-none text-stone-700 placeholder:text-stone-200 text-lg md:text-xl leading-[35px] font-handwriting relative z-10 custom-scrollbar"
              disabled={isSending}
              autoFocus
            />
            
            <div className="mt-6 flex items-center justify-between relative z-10 border-t border-stone-50 pt-4">
                <div className={`flex items-center gap-1.5 transition-opacity duration-300 ${text.length > 0 ? 'opacity-100' : 'opacity-30'}`}>
                   <span className="text-[10px] text-stone-400 font-mono tracking-tighter">
                      {charCount} chars
                   </span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!isEnabled}
                  className={`relative px-6 md:px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300
                    ${!isEnabled 
                      ? 'bg-stone-50 text-stone-200 cursor-not-allowed' 
                      : 'bg-stone-800 text-white active:scale-95 group/btn'}
                  `}
                >
                  <span className="relative z-10 flex items-center gap-2 tracking-widest uppercase text-[10px]">
                    {isSending ? (
                      <>
                        <Sparkles className="animate-spin" size={14}/> Processing
                      </>
                    ) : (
                      <>
                        Seal & Send <Send size={14} />
                      </>
                    )}
                  </span>
                </button>
            </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-[9px] text-stone-300 uppercase tracking-[0.3em] font-bold opacity-60">
         End of Entry
      </div>
    </div>
  );
};

export default WhisperHole;
