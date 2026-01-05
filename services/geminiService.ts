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
 * Generate Healing Text Content
 */
export const generateSoulText = async (text: string, moodLevel: number): Promise<{ 
  analysis: GeminiAnalysisResult, 
  card: EnergyCardData
}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const forcedStyle = STYLE_HINTS[Math.floor(Math.random() * STYLE_HINTS.length)];

  try {
    // Fixed: Using gemini-3-pro-preview for complex emotional reasoning task.
    // Fixed: Moved character-defining instructions to config.systemInstruction.
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `使用者心聲：「${text}」\n當前心情電力：${moodLevel}%`,
      config: {
        systemInstruction: `你現在是一位名為「亨仔」的溫暖熊仔（Teddy Bear），也是一位治癒系專家。
        你的任務是聆聽使用者的心聲，並將其轉化為溫暖的文字。
        請根據使用者的心聲和心情電力，提供療癒的回應。
        請嚴格按照以下 JSON 格式回傳，不要包含額外的 Markdown 標記：
        {
          "reply_text": "亨仔給使用者的溫暖回應（中文，50字以內）",
          "hashtags": ["#標籤1", "#標籤2", "#標籤3"],
          "card_theme": "2-4字主題",
          "lucky_item": "療癒小物",
          "relaxation": "一項簡單的放鬆建議"
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
  } catch (e) {
    console.error("Text Generation Error:", e);
    return getRandomFallbackContent();
  }
};

export const generateFullSoulContent = async (text: string, moodLevel: number, zone: string | null): Promise<FullSoulContent> => {
  return await generateSoulText(text, moodLevel);
};
