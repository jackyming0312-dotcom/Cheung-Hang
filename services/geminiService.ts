
import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult } from "../types";

export interface FullSoulContent {
  analysis: GeminiAnalysisResult;
  card: EnergyCardData;
}

const FALLBACK_CONTENT: FullSoulContent = {
  analysis: { 
    sentiment: 'neutral', 
    tags: ['大氣', '平靜'], 
    replyMessage: "大熊剛才打了個小盹，但你的心聲我已經收到了。在長亨的風中，放鬆一下吧。" 
  },
  card: { 
    quote: "慢一點沒關係，長亨大熊會陪你慢慢走。", 
    theme: "沉穩節奏", 
    luckyItem: "溫暖的茶", 
    category: "生活態度",
    relaxationMethod: "深呼吸三次，感受空氣進入肺部的清涼。"
  }
};

/**
 * 帶有超時機制的 AI 生成函數，解決手機端卡死問題
 */
export const generateFullSoulContent = async (text: string, moodLevel: number, zone: string | null): Promise<FullSoulContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // 建立一個 10 秒超時的 Promise
  const timeoutPromise = new Promise<null>((_, reject) => 
    setTimeout(() => reject(new Error("AI_TIMEOUT")), 10000)
  );

  const aiTask = async (): Promise<FullSoulContent> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `身為長亨站療癒大熊，分析心聲並回傳JSON。要求：replyMessage充滿鼓勵, theme是生活關鍵字, relaxationMethod是具體放鬆練習。心聲:${text}, 心情:${moodLevel}, 區:${zone}`,
        config: {
          responseMimeType: "application/json",
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
                  category: { type: Type.STRING }
                },
                required: ["quote", "theme", "luckyItem", "relaxationMethod", "category"]
              }
            }
          }
        }
      });

      if (!response.text) throw new Error("EMPTY_RESPONSE");
      const result = JSON.parse(response.text);
      return {
        analysis: result.analysis || FALLBACK_CONTENT.analysis,
        card: result.card || FALLBACK_CONTENT.card
      };
    } catch (e) {
      console.error("Internal Gemini Error:", e);
      return FALLBACK_CONTENT;
    }
  };

  try {
    // 競速：AI 任務 vs 10秒超時
    return await Promise.race([aiTask(), timeoutPromise]) as FullSoulContent;
  } catch (error) {
    console.warn("Gemini Service timed out or failed, using fallback.", error);
    return FALLBACK_CONTENT;
  }
};
