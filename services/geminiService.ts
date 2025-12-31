
import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult } from "../types";

export interface FullSoulContent {
  analysis: GeminiAnalysisResult;
  card: EnergyCardData;
}

const FALLBACK_CONTENT: FullSoulContent = {
  analysis: { sentiment: 'neutral', tags: ['平靜'], replyMessage: "大熊聽見了，我在這裡。" },
  card: { 
    quote: "慢一點沒關係，長亨大熊會陪你慢慢走。", 
    theme: "節奏", 
    luckyItem: "溫暖的茶", 
    category: "生活態度",
    relaxationMethod: "深呼吸三次，感受空氣進入肺部的清涼。"
  }
};

export const generateFullSoulContent = async (text: string, moodLevel: number, zone: string | null): Promise<FullSoulContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // 優化指令：要求模型生成鼓勵詞、生活態度與放鬆練習
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `身為長亨站療癒大熊，分析心聲並回傳JSON。
      要求：
      1. replyMessage 是一段極具溫度與鼓勵的對話。
      2. theme 是生活態度的關鍵字。
      3. relaxationMethod 是具體、簡單且可立即執行的放鬆練習。
      心聲:${text}, 心情指數:${moodLevel}, 選區:${zone}`,
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

    const result = JSON.parse(response.text || '{}');
    return {
      analysis: result.analysis || FALLBACK_CONTENT.analysis,
      card: result.card || FALLBACK_CONTENT.card
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return FALLBACK_CONTENT;
  }
};
