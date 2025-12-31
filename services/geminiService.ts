
import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult } from "../types";

export interface FullSoulContent {
  analysis: GeminiAnalysisResult;
  card: EnergyCardData;
}

const FALLBACK_CARDS: EnergyCardData[] = [
  {
    quote: "慢一點沒關係，長亨大熊會陪你慢慢走。",
    theme: "沉穩節奏",
    luckyItem: "溫暖的茶",
    category: "生活態度",
    relaxationMethod: "深呼吸三次，感受空氣進入肺部的清涼。"
  },
  {
    quote: "允許自己休息，是為了走更長遠的路。",
    theme: "自我照顧",
    luckyItem: "柔軟的枕頭",
    category: "放鬆練習",
    relaxationMethod: "給自己十分鐘，什麼都不做，只發呆。"
  },
  {
    quote: "你的感受沒有對錯，它們都是你的一部分。",
    theme: "接納情緒",
    luckyItem: "鏡子",
    category: "情緒共處",
    relaxationMethod: "對著鏡子裡的自己微笑，說聲「辛苦了」。"
  },
  {
    quote: "暴風雨後，空氣總是最清新的。",
    theme: "雨過天晴",
    luckyItem: "窗邊的陽光",
    category: "生活態度",
    relaxationMethod: "看看窗外的天空，尋找一片形狀有趣的雲。"
  },
  {
    quote: "像樹一樣，向下扎根，向上生長。",
    theme: "生命力",
    luckyItem: "綠色植物",
    category: "生活態度",
    relaxationMethod: "赤腳踩在地面上，感受大地的支撐。"
  }
];

const getRandomFallbackContent = (): FullSoulContent => {
  const card = FALLBACK_CARDS[Math.floor(Math.random() * FALLBACK_CARDS.length)];
  return {
    analysis: {
      sentiment: 'neutral',
      tags: ['#日常', '#陪伴', '#安放'],
      replyMessage: "大熊感應到你的心聲了。有些日子也許比較沉重，但請記得，你擁有讓自己快樂起來的力量。長亨站永遠為你點燈。"
    },
    card
  };
};

export const generateFullSoulContent = async (text: string, moodLevel: number, zone: string | null): Promise<FullSoulContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const timeoutPromise = new Promise<null>((_, reject) => 
    setTimeout(() => reject(new Error("AI_TIMEOUT")), 12000)
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
        3. card.theme: 用 2-4 個字總結此心聲的生命課題（請多樣化，不要總是「陪伴」）。
        4. card.quote: 生成一句能觸動此用戶當下心靈的金句，風格可以是哲學、溫暖、幽默或充滿力量。
        5. card.relaxationMethod: 一個針對此情緒狀態的具體放鬆小建議。
        6. card.category: 根據心聲分類為 '生活態度'、'情緒共處' 或 '放鬆練習'。`,
        config: {
          temperature: 1.2,
          topK: 40,
          topP: 0.95,
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
        analysis: result.analysis || getRandomFallbackContent().analysis,
        card: result.card || getRandomFallbackContent().card
      };
    } catch (e) {
      console.error("Internal Gemini Error:", e);
      return getRandomFallbackContent();
    }
  };

  try {
    return await Promise.race([aiTask(), timeoutPromise]) as FullSoulContent;
  } catch (error) {
    console.warn("Gemini Service timed out or failed.", error);
    return getRandomFallbackContent();
  }
};
