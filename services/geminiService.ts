
import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult, FullSoulContent } from "../types";

const STYLE_HINTS: ('warm' | 'fresh' | 'calm' | 'energetic' | 'dreamy')[] = ['warm', 'fresh', 'calm', 'energetic', 'dreamy'];

export const getRandomFallbackContent = (): FullSoulContent => {
  const randomStyle = STYLE_HINTS[Math.floor(Math.random() * STYLE_HINTS.length)];
  return {
    analysis: {
      sentiment: 'neutral',
      tags: ['#日常', '#放鬆', '#亨仔陪你'],
      replyMessage: "亨仔看見了你的心聲。無論外面的世界多吵雜，這裡永遠有你的位子。"
    },
    card: {
      quote: "慢一點沒關係，亨仔會陪你慢慢走。",
      theme: "沉穩節奏",
      luckyItem: "溫暖的茶",
      category: "放鬆練習",
      relaxationMethod: "深呼吸三次，感受空氣進入肺部的清涼。",
      styleHint: randomStyle
    }
  };
};

/**
 * 生成純文字療癒內容
 * 每次調用時才實例化 GoogleGenAI 以確保使用最新 Key
 */
export const generateSoulText = async (text: string, moodLevel: number): Promise<{ 
  analysis: GeminiAnalysisResult, 
  card: EnergyCardData
}> => {
  // 核心：每次都重新創建實例以抓取最新 Key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const forcedStyle = STYLE_HINTS[Math.floor(Math.random() * STYLE_HINTS.length)];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `使用者心聲：「${text}」\n當前心情電力：${moodLevel}%`,
      config: {
        systemInstruction: `你現在是一位名為「亨仔」的溫暖熊仔（Teddy Bear），也是一位治癒系專家。
        你的任務是聆聽使用者的心聲，並將其轉化為溫暖的文字與標籤。
        
        請嚴格按照以下 JSON 格式回傳，不要包含額外的 Markdown 標記：
        {
          "reply_text": "亨仔給使用者的溫暖回應（中文，50字以內，口吻要親切像好朋友）",
          "hashtags": ["#標籤1", "#標籤2", "#標籤3"],
          "card_theme": "2-4字主題",
          "lucky_item": "療癒小物（具體且溫馨的物品）",
          "relaxation": "一項簡單且具體的放鬆建議"
        }`,
        temperature: 1.0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply_text: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            card_theme: { type: Type.STRING },
            lucky_item: { type: Type.STRING },
            relaxation: { type: Type.STRING }
          },
          required: ["reply_text", "hashtags", "card_theme", "lucky_item", "relaxation"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      analysis: {
        sentiment: 'neutral',
        tags: result.hashtags,
        replyMessage: result.reply_text
      },
      card: {
        quote: result.reply_text,
        theme: result.card_theme,
        luckyItem: result.lucky_item,
        relaxationMethod: result.relaxation,
        category: '情緒共處',
        styleHint: forcedStyle
      }
    };
  } catch (e: any) {
    console.error("Text Generation Error:", e);
    // 如果是 API Key 相關錯誤，拋出特定訊息讓 UI 處理
    if (e.message?.includes("Requested entity was not found") || e.message?.includes("API key")) {
        throw e;
    }
    return getRandomFallbackContent();
  }
};
