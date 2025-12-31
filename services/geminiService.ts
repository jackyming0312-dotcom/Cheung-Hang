
import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult } from "../types";

export interface FullSoulContent {
  analysis: GeminiAnalysisResult;
  card: EnergyCardData;
}

const FALLBACK_CONTENT: FullSoulContent = {
  analysis: { sentiment: 'neutral', tags: ['平靜'], replyMessage: "大熊聽見了，我在這裡。" },
  card: { quote: "慢一點沒關係，長亨大熊會陪你慢慢走。", theme: "節奏", luckyItem: "溫暖的茶", category: "生活態度" }
};

// 圖片壓縮輔助函數
const compressBase64Image = (base64Str: string, maxWidth = 450): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      } else { resolve(base64Str); }
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const generateFullSoulContent = async (text: string, moodLevel: number, zone: string | null): Promise<FullSoulContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `分析以下心聲並生成能量卡：\n心聲：${text}\n心情電力：${moodLevel}%\n區域：${zone}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.OBJECT,
              properties: {
                sentiment: { type: Type.STRING, description: "positive, neutral, or negative" },
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
                category: { type: Type.STRING, description: "生活態度, 情緒共處, or 放鬆練習" }
              },
              required: ["quote", "theme", "luckyItem", "category"]
            }
          },
          required: ["analysis", "card"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      analysis: result.analysis || FALLBACK_CONTENT.analysis,
      card: result.card || FALLBACK_CONTENT.card
    };
  } catch (error) {
    console.error("Gemini Content Error:", error);
    return FALLBACK_CONTENT;
  }
};

export const generateHealingImage = async (userText: string, moodLevel: number, zone: string | null, cardData?: EnergyCardData): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const prompt = `Cute cartoon illustration of a gentle teddy bear. Theme: ${cardData?.theme || 'healing'}. Style: Studio Ghibli watercolor, cozy, soft colors, 1:1 ratio. No text.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: "1:1" } }
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              return await compressBase64Image(`data:image/png;base64,${part.inlineData.data}`);
            }
        }
        return null;
    } catch (error) { 
        console.error("Image Gen Error:", error);
        return null; 
    }
};
