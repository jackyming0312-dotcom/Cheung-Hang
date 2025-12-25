import React, { useState } from 'react';
import { Send, Sparkles, MessageCircle } from 'lucide-react';
// Note: We moved the actual API call to App.tsx to allow parallel processing
// import { analyzeWhisper } from '../services/geminiService'; 

interface WhisperHoleProps {
  onComplete: (text: string) => void;
}

const WhisperHole: React.FC<WhisperHoleProps> = ({ onComplete }) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    
    // IMMEDIATE feedback - don't wait for API here
    setIsSending(true);
    
    // Add a tiny artificial delay just for the button animation feel (optional)
    setTimeout(() => {
        onComplete(text);
    }, 500);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      <h3 className="text-xl text-slate-700 font-medium mb-2">意見與心情回饋</h3>
      <p className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <MessageCircle size={14}/> 您的回饋將採匿名處理，請安心填寫
      </p>

      <div className="w-full relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="今天有發生什麼讓您開心，或是覺得可以改進的地方嗎？..."
          className="w-full h-40 p-5 rounded-xl bg-white border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none resize-none transition-all text-slate-700 placeholder:text-slate-300 shadow-sm text-base leading-relaxed"
          disabled={isSending}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!text.trim() || isSending}
        className={`mt-8 px-8 py-3 rounded-lg font-medium text-base flex items-center gap-2 transition-all duration-300
          ${!text.trim() || isSending 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-slate-800 text-white hover:bg-slate-700 hover:shadow-lg hover:scale-105 active:scale-95'}
        `}
      >
        {isSending ? (
          <>
            <Sparkles className="animate-spin" size={18}/> 傳送心聲中...
          </>
        ) : (
          <>
            送出回饋 <Send size={18} />
          </>
        )}
      </button>
    </div>
  );
};

export default WhisperHole;