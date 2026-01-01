
import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult } from "../types";

export interface FullSoulContent {
  analysis: GeminiAnalysisResult;
  card: EnergyCardData;
}

const FALLBACK_CONTENT_POOL = [
  {
    card: {
      quote: "慢一點沒關係，亨仔會陪你慢慢走。",
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
  }
];

export const getRandomFallbackContent = (): FullSoulContent => {
  const selection = FALLBACK_CONTENT_POOL[Math.floor(Math.random() * FALLBACK_CONTENT_POOL.length)];
  return {
    analysis: {
      sentiment: 'neutral',
      tags: selection.tags,
      replyMessage: "亨仔感應到你的心聲了。無論今天如何，你都值得被溫柔對待，長亨站永遠為你亮著燈。"
    },
    card: selection.card
  };
};

export const generateFullSoulContent = async (text: string, moodLevel: number, zone: string | null): Promise<FullSoulContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const timeoutPromise = new Promise<null>((_, reject) => 
    setTimeout(() => reject(new Error("AI_TIMEOUT")), 8000)
  );

  const aiTask = async (): Promise<FullSoulContent> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你是一位極具洞察力與溫暖的療癒守護者「亨仔」。
        用戶輸入心聲：「${text}」（心情電力：${moodLevel}%，感興趣領域：${zone}）。
        
        請嚴格遵守 JSON 回應：
        1. analysis.replyMessage: 亨仔的語氣是溫暖、親切、帶點幽默的大哥哥。針對內容給予一段感性的療癒鼓勵 (30-50字)。
        2. analysis.tags: 生成 3-4 個感性 Hashtag (需含 #)。
        3. card.theme: 2-4 字總結主題。
        4. card.quote: 一句心靈金句。
        5. card.relaxationMethod: 一個具體放鬆練習。
        6. card.category: '生活態度', '情緒共處' 或 '放鬆練習'。`,
        config: {
          temperature: 1.2,
          topK: 40,
          topP: 0.9,
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
      console.error("Gemini Internal Error:", e);
      return getRandomFallbackContent();
    }
  };

  try {
    return await Promise.race([aiTask(), timeoutPromise]) as FullSoulContent;
  } catch (error) {
    return getRandomFallbackContent();
  }
};
