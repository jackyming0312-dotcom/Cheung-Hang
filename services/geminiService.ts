
import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult, CommunityLog } from "../types";

/**
 * 分析使用者的文字回饋
 */
export const analyzeWhisper = async (text: string): Promise<GeminiAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  if (!text.trim()) {
    return {
      sentiment: 'neutral',
      tags: ['心聲', '紀錄', '生活'],
      replyMessage: "長亨大熊已經收到您的心聲，謝謝您的分享。"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `分析這則心聲: "${text}"。請以繁體中文回傳 JSON，包含情感(sentiment)、3個標籤(tags)、及一句暖心回覆(replyMessage)。`,
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
      tags: result.tags || ['心情', '生活'],
      replyMessage: result.replyMessage || "感謝您的分享。"
    };
  } catch (error) {
    return { sentiment: 'neutral', tags: ['日常'], replyMessage: "您的訊息已安全保存。" };
  }
};

/**
 * 根據卡片主題生成特定的長亨大熊插圖 (強調靜態、穩定感)
 */
export const generateHealingImage = async (userText: string, moodLevel: number, zone: string | null, cardData?: EnergyCardData): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const moodDesc = moodLevel > 70 ? "bright morning sunlight" : moodLevel > 40 ? "soft twilight" : "quiet starlit night";
        const bearDetail = "A giant, extremely fluffy brown teddy bear (Cheung Hang Bear) with a peaceful, calm expression.";
        
        let action = "sitting still and meditating";
        if (cardData?.category === '生活態度') action = "sitting on a bench looking at a calm horizon, very still";
        else if (cardData?.category === '放鬆練習') action = "holding a warm cup of tea with both hands, eyes gently closed, feeling the steam";
        else if (cardData?.category === '情緒共處') action = "sitting quietly in a cozy room with a small lamp, feeling safe and embraced";

        const imagePrompt = `A high-quality, professional digital art in Studio Ghibli style. 
          Subject: ${bearDetail} ${action}.
          Atmosphere: Deeply healing, serene, silent, high-end lo-fi aesthetic.
          Setting: A peaceful corner of Cheung Hang community.
          Lighting: ${moodDesc}, stable and warm light.
          Visual Style: Soft watercolor textures, stable composition, no motion blur, no flashing elements.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: imagePrompt }] },
            config: { imageConfig: { aspectRatio: "1:1" } }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * 生成「多維度」心靈能量卡內容
 */
export const generateEnergyCard = async (moodLevel: number, zone: string | null, userText: string): Promise<EnergyCardData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `
      使用者心聲：「${userText}」
      心情電力：${moodLevel}%
      區域：${zone || "長亨站"}
      
      請以「長亨大熊」的身分，為使用者生成一張內容豐富的療癒小卡。
      請從以下三個方向擇一生成最適合當下心境的內容：
      1. 「生活態度」：例如關於慢活、不必完美、活在當下的哲學。
      2. 「情緒共處」：例如接納低潮、允許自己流淚、與內心小孩和解。
      3. 「放鬆練習」：具體的微動作（深呼吸、感受重力、放鬆肩膀）。
      
      請以繁體中文回傳 JSON，包含 quote (15字內), theme (主題名稱，如：節奏、接納、呼吸), luckyItem (建議小物), category (上述三者之一)。
    `;

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
            category: { type: Type.STRING, enum: ["生活態度", "情緒共處", "放鬆練習"] }
          },
          required: ["quote", "theme", "luckyItem", "category"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      quote: result.quote || "慢下來，也是一種前進的方式。",
      theme: result.theme || "節奏",
      luckyItem: result.luckyItem || "溫暖的茶",
      category: result.category || "生活態度"
    };
  } catch (error) {
    return { quote: "我就在這裡陪著你。", theme: "陪伴", luckyItem: "擁抱", category: "生活態度" };
  }
};
