

import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult, FullSoulContent } from "../types";

const STYLE_HINTS: ('warm' | 'fresh' | 'calm' | 'energetic' | 'dreamy')[] = ['warm', 'fresh', 'calm', 'energetic', 'dreamy'];

export const getRandomFallbackContent = (): FullSoulContent => {
  const randomStyle = STYLE_HINTS[Math.floor(Math.random() * STYLE_HINTS.length)];
  return {
    analysis: {
      sentiment: 'neutral',
      tags: ['#日常', '#放鬆', '#亨仔陪你'],
      replyMessage: "亨仔看見了你的心聲。無論外面的世界多吵雜，這裡永遠有你的位子。",
      // mood_score added to GeminiAnalysisResult interface in types.ts
      mood_score: 50
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
 * 根據輸入文字生成療癒內容與情緒電量
 */
// Simplified return type as GeminiAnalysisResult now includes mood_score
export const generateSoulText = async (text: string): Promise<{ 
  analysis: GeminiAnalysisResult, 
  card: EnergyCardData
}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const forcedStyle = STYLE_HINTS[Math.floor(Math.random() * STYLE_HINTS.length)];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `使用者心聲：「${text}」`,
      config: {
        systemInstruction: `你現在是一位名為「亨仔」的溫暖熊仔。
        你的任務是：
        1. 根據使用者的文字內容，判斷他的情緒電量 (mood_score, 0-100)。
        2. 創作一個溫暖的回應 (reply_text)。
        3. 根據內容生成 3 個相關標籤 (hashtags)。
        4. 提供一個療癒主題、幸運物品及放鬆建議。
        
        請嚴格按照以下 JSON 格式回傳：
        {
          "mood_score": 0-100的數字,
          "reply_text": "50字以內溫馨回應",
          "hashtags": ["#標籤1", "#標籤2", "#標籤3"],
          "card_theme": "2-4字主題",
          "lucky_item": "療癒小物",
          "relaxation": "簡單放鬆建議"
        }`,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood_score: { type: Type.NUMBER },
            reply_text: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            card_theme: { type: Type.STRING },
            lucky_item: { type: Type.STRING },
            relaxation: { type: Type.STRING }
          },
          required: ["mood_score", "reply_text", "hashtags", "card_theme", "lucky_item", "relaxation"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      analysis: {
        sentiment: result.mood_score > 60 ? 'positive' : result.mood_score < 40 ? 'negative' : 'neutral',
        tags: result.hashtags,
        replyMessage: result.reply_text,
        mood_score: result.mood_score
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
    console.error("AI Generation Error:", e);
    const fallback = getRandomFallbackContent();
    return {
      // Simplified returning analysis from fallback
      analysis: fallback.analysis,
      card: fallback.card
    };
  }
};