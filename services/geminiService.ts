
import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult } from "../types";

// 本地備用題庫：當 AI 失敗時從這裡隨機挑選，避免永遠出現「陪伴」
const FALLBACK_CARDS: EnergyCardData[] = [
  { quote: "今天的雲很美，適合把煩惱寄託在上面。", theme: "放空", luckyItem: "軟綿綿的枕頭", category: "放鬆練習" },
  { quote: "你已經很努力了，現在可以稍微休息一下。", theme: "許可", luckyItem: "一杯溫牛奶", category: "情緒共處" },
  { quote: "慢一點沒關係，長亨大熊會陪你慢慢走。", theme: "節奏", luckyItem: "舒適的舊球鞋", category: "生活態度" },
  { quote: "聽聽心裡的聲音，它在說你很棒喔。", theme: "肯定", luckyItem: "一面小鏡子", category: "情緒共處" },
  { quote: "深呼吸，感受空氣進入身體的重量。", theme: "呼吸", luckyItem: "淡雅的香氛", category: "放鬆練習" }
];

const getRandomFallback = () => FALLBACK_CARDS[Math.floor(Math.random() * FALLBACK_CARDS.length)];

export const analyzeWhisper = async (text: string): Promise<GeminiAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  if (!text.trim()) return { sentiment: 'neutral', tags: ['生活'], replyMessage: "大熊收到你的心聲了。" };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `分析心聲: "${text}"。以繁體中文回傳 JSON: {sentiment: "positive"|"neutral"|"negative", tags: string[], replyMessage: string}。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            replyMessage: { type: Type.STRING }
          },
          required: ["sentiment", "tags", "replyMessage"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { sentiment: 'neutral', tags: ['日常'], replyMessage: "你的心聲已安全存放於長亨。" };
  }
};

export const generateHealingImage = async (userText: string, moodLevel: number, zone: string | null, cardData?: EnergyCardData): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const prompt = `A soft, healing, Studio Ghibli style digital art. A giant fluffy brown teddy bear sitting peacefully in a sunlit room in Cheung Hang. Theme: ${cardData?.theme || 'Peace'}. High-end lo-fi aesthetic, watercolor textures, serene atmosphere.`;
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
}

export const generateEnergyCard = async (moodLevel: number, zone: string | null, userText: string): Promise<EnergyCardData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `心聲：「${userText}」，電力：${moodLevel}%，區域：${zone}。請以「長亨大熊」身分生成療癒卡 JSON: {quote: string(15字內), theme: string(主題), luckyItem: string, category: "生活態度"|"情緒共處"|"放鬆練習"}。`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            theme: { type: Type.STRING },
            luckyItem: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["quote", "theme", "luckyItem", "category"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return getRandomFallback();
  }
};
