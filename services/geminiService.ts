
import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult } from "../types";

export interface FullSoulContent {
  analysis: GeminiAnalysisResult;
  card: EnergyCardData;
}

const FALLBACK_CONTENT: FullSoulContent = {
  analysis: { 
    sentiment: 'neutral', 
    tags: ['#平靜', '#當下'], 
    replyMessage: "大熊聽到了，這份心情很珍貴。在長亨站的長椅上坐一下，讓風帶走疲累吧。" 
  },
  card: { 
    quote: "慢一點沒關係，長亨大熊會陪你慢慢走。", 
    theme: "沉穩節奏", 
    luckyItem: "溫暖的茶", 
    category: "生活態度",
    relaxationMethod: "深呼吸三次，感受空氣進入肺部的清涼。"
  }
};

export const generateFullSoulContent = async (text: string, moodLevel: number, zone: string | null): Promise<FullSoulContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const timeoutPromise = new Promise<null>((_, reject) => 
    setTimeout(() => reject(new Error("AI_TIMEOUT")), 10000)
  );

  const aiTask = async (): Promise<FullSoulContent> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你是一位極具洞察力與溫暖的療癒心理大叔「長亨大熊」。
        用戶輸入心聲：「${text}」（心情電力：${moodLevel}%，感興趣領域：${zone}）。
        
        請嚴格遵守以下要求生成 JSON 回應：
        1. analysis.replyMessage: 拒絕罐頭式的陪伴語。必須「針對內容」給予精準的共鳴、啟發性的對話。如果是負面內容，請溫柔接住；如果是目標，請具體給予力量。
        2. analysis.tags: 根據內容生成 3 個感性的 Hashtag（如：#拒絕內耗、#勇敢轉身、#微光生活）。
        3. card.theme: 用 2-4 個字總結此心聲的生命課題。
        4. card.quote: 生成一句能觸動此用戶當下心靈的金句。
        5. card.relaxationMethod: 一個針對此情緒狀態的具體放鬆小建議。
        6. card.category: 根據心聲分類為 '生活態度'、'情緒共處' 或 '放鬆練習'。`,
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
    return await Promise.race([aiTask(), timeoutPromise]) as FullSoulContent;
  } catch (error) {
    console.warn("Gemini Service timed out or failed.", error);
    return FALLBACK_CONTENT;
  }
};
