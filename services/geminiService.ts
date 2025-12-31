
import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult } from "../types";

// 定義合併後的結果介面
export interface FullSoulContent {
  analysis: GeminiAnalysisResult;
  card: EnergyCardData;
}

const FALLBACK_CONTENT: FullSoulContent = {
  analysis: { sentiment: 'neutral', tags: ['生活'], replyMessage: "大熊收到你的心聲了。" },
  card: { quote: "慢一點沒關係，長亨大熊會陪你慢慢走。", theme: "節奏", luckyItem: "舒適的舊球鞋", category: "生活態度" }
};

export const generateFullSoulContent = async (text: string, moodLevel: number, zone: string | null): Promise<FullSoulContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const prompt = `
      使用者心聲：「${text}」
      心情電力：${moodLevel}%
      區域：${zone}
      
      任務：請同時進行情緒分析並生成能量卡。
      回傳繁體中文 JSON 格式：
      {
        "analysis": {
          "sentiment": "positive" | "neutral" | "negative",
          "tags": ["標籤1", "標籤2"],
          "replyMessage": "給使用者的一段暖心話(20字內)"
        },
        "card": {
          "quote": "充滿詩意的短語(15字內)",
          "theme": "2-4字主題",
          "luckyItem": "療癒小物",
          "category": "生活態度" | "情緒共處" | "放鬆練習"
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // 使用最快的模型
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 } // 關閉深度思考以追求極速回應
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      analysis: result.analysis || FALLBACK_CONTENT.analysis,
      card: result.card || FALLBACK_CONTENT.card
    };
  } catch (error) {
    console.error("Gemini Text Speed-up Error:", error);
    return FALLBACK_CONTENT;
  }
};

export const generateHealingImage = async (userText: string, moodLevel: number, zone: string | null, cardData?: EnergyCardData): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const prompt = `Studio Ghibli style, healing illustration of a gentle brown bear. Scene: ${cardData?.theme || 'Peace'}. Nostalgic watercolor, soft lighting, 1:1 ratio.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: "1:1" } }
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        return null;
    } catch (error) { return null; }
};

// 保留舊導出以相容，但內部調用新邏輯
export const analyzeWhisper = async (text: string) => (await generateFullSoulContent(text, 50, null)).analysis;
export const generateEnergyCard = async (mood: number, zone: string | null, text: string) => (await generateFullSoulContent(text, mood, zone)).card;
