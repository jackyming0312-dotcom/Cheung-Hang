import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult } from "../types";

/**
 * 分析使用者的文字回饋
 */
export const analyzeWhisper = async (text: string): Promise<GeminiAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  if (!text.trim()) {
    return {
      sentiment: 'neutral',
      tags: ['心聲', '紀錄', '生活'],
      replyMessage: "我們已經收到您的心聲，謝謝您的分享。"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `分析這則回饋: "${text}"。請以繁體中文回傳 JSON，包含情感(sentiment: positive/neutral/negative)、3個標籤(tags: string[])、及一句暖心回覆(replyMessage: string)。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            replyMessage: { type: Type.STRING }
          },
          required: ["sentiment", "tags", "replyMessage"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      sentiment: result.sentiment || 'neutral',
      tags: (result.tags && result.tags.length) ? result.tags : ['心情', '生活'],
      replyMessage: result.replyMessage || "感謝您的分享。"
    };

  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    return {
      sentiment: 'neutral',
      tags: ['日常'],
      replyMessage: "您的訊息已安全保存。"
    };
  }
};

/**
 * 根據使用者文字生成療癒插畫，加入青年與社工元素
 */
export const generateHealingImage = async (userText: string, moodLevel: number, zone: string | null): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
        const moodDesc = moodLevel > 70 ? "vibrant, optimistic, sunset glow" : moodLevel > 40 ? "peaceful, rainy afternoon, cozy indoor" : "solitary, starry night, soft moonlight";
        
        // 根據選擇區域調整場景元素
        let envDetail = "a modern youth center with plants and community bulletin boards";
        if (zone?.includes('職涯')) envDetail = "a creative studio with a laptop, a notebook, and city view for a goal-oriented youth";
        if (zone?.includes('心靈')) envDetail = "a cozy counseling room with soft cushions, warm tea, and a supportive social worker presence";
        if (zone?.includes('社會')) envDetail = "an urban community garden where young people are collaborating";
        if (zone?.includes('創意')) envDetail = "an art atelier filled with colorful sketches and young artists' dreams";

        const imagePrompt = `A high-quality Lo-fi aesthetic illustration in Studio Ghibli style. 
          Theme: "${userText}". 
          Setting: ${envDetail}. 
          Characters: Include a stylized, diverse young person or a kind, supportive figure in a soft cardigan representing a social worker. 
          Vibe: Healing, empathetic, supportive. 
          Mood: ${moodDesc}. 
          Visuals: Soft watercolor textures, dreamy lighting, cluttered but cozy backgrounds (books, coffee mugs, tablets). No text.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: imagePrompt }] },
            config: {
                imageConfig: {
                    aspectRatio: "1:1"
                }
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;

    } catch (error) {
        console.error("Image generation error:", error);
        return null;
    }
}

/**
 * 生成「心靈能量卡」內容
 */
export const generateEnergyCard = async (moodLevel: number, zone: string | null): Promise<EnergyCardData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  try {
    const moodDesc = moodLevel > 70 ? "充滿活力" : moodLevel > 40 ? "平靜" : "疲憊";
    const zoneContext = zone ? `喜歡的區域: ${zone}` : "";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `為一位 ${moodDesc} 的使用者生成今日心靈能量卡。${zoneContext}。請以繁體中文回傳 JSON。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING, description: "15字內的勵志短句" },
            theme: { type: Type.STRING, description: "二字主題詞" },
            luckyItem: { type: Type.STRING, description: "一個可愛幸運物" }
          },
          required: ["quote", "theme", "luckyItem"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      quote: result.quote || "即使微小，也是屬於你的光芒。",
      theme: result.theme || "希望",
      luckyItem: result.luckyItem || "星空"
    };

  } catch (error) {
    console.error("Gemini card generation error:", error);
    return {
      quote: "太陽明天依然會升起。",
      theme: "希望",
      luckyItem: "月光"
    };
  }
};
