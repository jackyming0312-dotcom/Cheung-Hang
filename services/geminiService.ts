
import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult } from "../types";

export interface FullSoulContent {
  analysis: GeminiAnalysisResult;
  card: EnergyCardData;
}

// 豐富的備用內容池
const FALLBACK_CONTENT_POOL = [
  {
    card: {
      quote: "慢一點沒關係，長亨大熊會陪你慢慢走。",
      theme: "沉穩節奏",
      luckyItem: "溫暖的茶",
      category: "生活態度" as const,
      relaxationMethod: "深呼吸三次，感受空氣進入肺部的清涼。"
    },
    tags: ['#慢活', '#深呼吸', '#自我陪伴']
  },
  {
    card: {
      quote: "允許自己休息，是為了走更長遠的路。",
      theme: "自我照顧",
      luckyItem: "柔軟的抱枕",
      category: "放鬆練習" as const,
      relaxationMethod: "放下手機，閉眼聆聽周遭的細碎聲音。"
    },
    tags: ['#休息', '#重新出發', '#愛自己']
  },
  {
    card: {
      quote: "世界很吵，但你可以把心關靜音一下。",
      theme: "心靈靜音",
      luckyItem: "耳機",
      category: "放鬆練習" as const,
      relaxationMethod: "找一首純音樂，專注聽完每一秒。"
    },
    tags: ['#內在安靜', '#自我對話', '#長亨站']
  },
  {
    card: {
      quote: "像樹一樣，向下扎根，向上生長。",
      theme: "成長韌性",
      luckyItem: "小盆栽",
      category: "生活態度" as const,
      relaxationMethod: "伸展雙手向上，想像自己是一棵吸收能量的樹。"
    },
    tags: ['#韌性', '#微光', '#生命力']
  },
  {
    card: {
      quote: "情緒像雲朵，來了會散，你只需要看著它。",
      theme: "情緒觀察",
      luckyItem: "透明水杯",
      category: "情緒共處" as const,
      relaxationMethod: "慢吞吞喝下一杯溫水，感受水分流過喉嚨。"
    },
    tags: ['#接納', '#如雲起落', '#平靜']
  }
];

const getRandomFallbackContent = (): FullSoulContent => {
  const selection = FALLBACK_CONTENT_POOL[Math.floor(Math.random() * FALLBACK_CONTENT_POOL.length)];
  return {
    analysis: {
      sentiment: 'neutral',
      tags: selection.tags,
      replyMessage: "大熊感應到你的心聲了。有些日子也許比較沉重，但請記得，你擁有讓自己快樂起來的力量。"
    },
    card: selection.card
  };
};

export const generateFullSoulContent = async (text: string, moodLevel: number, zone: string | null): Promise<FullSoulContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const timeoutPromise = new Promise<null>((_, reject) => 
    setTimeout(() => reject(new Error("AI_TIMEOUT")), 9000)
  );

  const aiTask = async (): Promise<FullSoulContent> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你是一位極具洞察力與溫暖的療癒心理大叔「長亨大熊」。
        用戶輸入心聲：「${text}」（心情電力：${moodLevel}%，感興趣領域：${zone}）。
        
        請嚴格遵守以下要求生成 JSON 回應：
        1. analysis.replyMessage: 拒絕罐頭語。針對內容給予共鳴。
        2. analysis.tags: 生成 3 個感性的 Hashtag（必須以 # 開頭）。
        3. card.theme: 用 2-4 個字總結。
        4. card.quote: 生成一句能觸動心靈的金句（要隨機且多樣）。
        5. card.relaxationMethod: 具體的放鬆小建議。
        6. card.category: 分類為 '生活態度'、'情緒共處' 或 '放鬆練習'。`,
        config: {
          temperature: 1.4, // 增加隨機性與多樣性
          topK: 64,
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
