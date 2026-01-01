
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
  
  const personalities = [
    "溫暖親切的大哥哥：語氣溫潤、充滿包容力，常用『我看見了你的努力』開頭。",
    "睿智老派的朋友：語氣沉穩、哲學化，常用『在時間的洪流裡，這只是...』開頭。",
    "活潑熱血的加油團：語氣高亢、多用感嘆號，常用『嘿！這超酷的！』開頭。"
  ];
  
  const selectedPersonality = personalities[Math.floor(Math.random() * personalities.length)];

  const timeoutPromise = new Promise<null>((_, reject) => 
    setTimeout(() => reject(new Error("AI_TIMEOUT")), 8000)
  );

  const aiTask = async (): Promise<FullSoulContent> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你現在的角色是長亨站的守護者「亨仔」。
        當前人格設定：${selectedPersonality}
        
        用戶輸入心聲：「${text}」（電力：${moodLevel}%，感興趣：${zone}）。
        
        請生成 JSON：
        1. analysis.replyMessage: 根據人格設定，寫一段 30-50 字的專屬鼓勵。要極具共情力，不說教。
        2. analysis.tags: 3-4 個極具現代感的 Hashtag。
        3. card.theme: 2-4 字卡片主題。
        4. card.quote: 一句心靈金句。
        5. card.relaxationMethod: 一個具體、簡單的放鬆小練習。
        6. card.category: '生活態度', '情緒共處' 或 '放鬆練習'。`,
        config: {
          temperature: 1.3,
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
      return getRandomFallbackContent();
    }
  };

  try {
    return await Promise.race([aiTask(), timeoutPromise]) as FullSoulContent;
  } catch (error) {
    return getRandomFallbackContent();
  }
};
