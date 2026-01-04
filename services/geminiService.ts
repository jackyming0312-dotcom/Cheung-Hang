

import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult, FullSoulContent } from "../types";

// Removed local FullSoulContent definition as it is now centrally managed in types.ts

const FALLBACK_CONTENT_POOL = [
  {
    card: {
      quote: "慢一點沒關係，亨仔會陪你慢慢走。",
      theme: "沉穩節奏",
      luckyItem: "溫暖的茶",
      category: "生活態度" as const,
      relaxationMethod: "深呼吸三次，感受空氣進入肺部的清涼。",
      styleHint: "calm" as const
    },
    tags: ['#慢活', '#深呼吸', '#自我陪伴']
  },
  {
    card: {
      quote: "允許自己休息，是為了走更長遠的路。",
      theme: "自我照顧",
      luckyItem: "柔軟的抱枕",
      category: "放鬆練習" as const,
      relaxationMethod: "放下手機，閉眼聆聽周遭的細碎聲音。",
      styleHint: "warm" as const
    },
    tags: ['#休息', '#重新出發', '#愛自己']
  }
];

export const getRandomFallbackContent = (): FullSoulContent => {
  const selection = FALLBACK_CONTENT_POOL[Math.floor(Math.random() * FALLBACK_CONTENT_POOL.length)];
  return {
    analysis: {
      sentiment: 'neutral',
      tags: selection.tags,
      replyMessage: "亨仔看見了你的心聲。無論外面的世界多吵雜，這裡永遠有你的位子。"
    },
    card: selection.card
  };
};

/**
 * Generates soul healing content using Gemini API.
 * Uses gemini-3-flash-preview for high quality text and reasoning tasks.
 */
export const generateFullSoulContent = async (text: string, moodLevel: number, zone: string | null): Promise<FullSoulContent> => {
  // Always initialize GoogleGenAI with a named parameter apiKey.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const personalities = [
    "溫暖的大哥哥：語氣溫潤、充滿包容力，強調陪伴。",
    "睿智的老朋友：語氣沉穩、哲學化，強調透視煩惱。",
    "活潑的小太陽：語氣充滿能量，強調行動與改變。"
  ];
  
  const selectedPersonality = personalities[Math.floor(Math.random() * personalities.length)];

  const timeoutPromise = new Promise<null>((_, reject) => 
    setTimeout(() => reject(new Error("AI_TIMEOUT")), 10000)
  );

  const aiTask = async (): Promise<FullSoulContent> => {
    try {
      // Call ai.models.generateContent directly with model name and configuration.
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你現在是長亨站的守護者「亨仔」。你擅長根據人們的秘密，繪製專屬的「能量卡片」。
        當前人格：${selectedPersonality}
        
        用戶心聲內容：「${text}」
        目前的電力狀態：${moodLevel}%
        
        任務：請根據內容「繪製」並生成一個 JSON 對象。
        要求：
        1. 內容必須高度客製化，嚴禁使用罐頭回覆。
        2. analysis.replyMessage: 針對心聲給予溫暖回覆，包含一個具體的行為建議 (40-60字)。
        3. card.styleHint: 必須從 ['warm', 'fresh', 'calm', 'energetic', 'dreamy'] 中選擇一個最符合心聲意境的風格。
        4. card.luckyItem: 生成一個與心聲具體相關且新穎的「療癒小物」（例如：若提到壓力，可是「一片會發光的葉子」或「隱形的消音耳機」）。
        5. card.theme: 2-4 字的獨特主題名。
        6. card.relaxationMethod: 一個與心聲內容呼應的 30 秒小練習。`,
        config: {
          temperature: 1.2,
          responseMimeType: "application/json",
          // Use Type from @google/genai for responseSchema.
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: {
                type: Type.OBJECT,
                properties: {
                  sentiment: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  replyMessage: { type: Type.STRING }
                },
                required: ["sentiment", "tags", "replyMessage"]
              },
              card: {
                type: Type.OBJECT,
                properties: {
                  quote: { type: Type.STRING },
                  theme: { type: Type.STRING },
                  luckyItem: { type: Type.STRING },
                  relaxationMethod: { type: Type.STRING },
                  category: { type: Type.STRING },
                  styleHint: { type: Type.STRING }
                },
                required: ["quote", "theme", "luckyItem", "relaxationMethod", "category", "styleHint"]
              }
            }
          }
        }
      });

      // Accessing response.text directly as a property.
      if (!response.text) throw new Error("EMPTY_RESPONSE");
      const result = JSON.parse(response.text);
      return {
        analysis: result.analysis,
        card: result.card
      };
    } catch (e) {
      console.error("Gemini Error:", e);
      return getRandomFallbackContent();
    }
  };

  try {
    return await Promise.race([aiTask(), timeoutPromise]) as FullSoulContent;
  } catch (error) {
    return getRandomFallbackContent();
  }
};