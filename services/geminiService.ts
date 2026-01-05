
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
 * Phase 1: Generate Text Content and Image Prompt
 */
export const generateSoulText = async (text: string, moodLevel: number): Promise<{ 
  analysis: GeminiAnalysisResult, 
  card: EnergyCardData,
  imagePrompt: string 
}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const forcedStyle = STYLE_HINTS[Math.floor(Math.random() * STYLE_HINTS.length)];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `你現在是一位名為「亨仔」的溫暖熊仔（Teddy Bear），也是一位治癒系插畫家。
      你的任務是聆聽使用者的心聲，並將其轉化為溫暖的文字與繪圖指令。

      使用者心聲：「${text}」
      心情電力：${moodLevel}%

      請嚴格按照以下 JSON 格式回傳：
      {
        "reply_text": "亨仔給使用者的溫暖回應（中文，50字以內）",
        "hashtags": ["#標籤1", "#標籤2", "#標籤3"],
        "image_prompt": "A cute brown teddy bear named Hang Zai drawing on a wall in hand-drawn crayon style. [Specific scenario: if user is sad, draw an umbrella; if happy, draw stars]. Warm atmosphere, healing vibes, high quality.",
        "card_theme": "2-4字主題",
        "lucky_item": "療癒小物",
        "relaxation": "一項簡單的放鬆建議"
      }`,
      config: {
        temperature: 1.0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply_text: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            image_prompt: { type: Type.STRING },
            card_theme: { type: Type.STRING },
            lucky_item: { type: Type.STRING },
            relaxation: { type: Type.STRING }
          },
          required: ["reply_text", "hashtags", "image_prompt", "card_theme", "lucky_item", "relaxation"]
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
      },
      imagePrompt: result.image_prompt
    };
  } catch (e) {
    console.error("Text Generation Error:", e);
    const fallback = getRandomFallbackContent();
    return { ...fallback, imagePrompt: "" };
  }
};

/**
 * Phase 2: Generate Image from Prompt
 */
export const generateSoulImage = async (prompt: string): Promise<string | undefined> => {
  if (!prompt) return undefined;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error("Image Generation Error:", e);
  }
  return undefined;
};

// Keep old function for compatibility but mark as deprecated or just wrap the new ones
export const generateFullSoulContent = async (text: string, moodLevel: number, zone: string | null): Promise<FullSoulContent> => {
  const textData = await generateSoulText(text, moodLevel);
  const imageUrl = await generateSoulImage(textData.imagePrompt);
  return {
    analysis: textData.analysis,
    card: { ...textData.card, imageUrl }
  };
};
