
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
 * 根據使用者文字生成療癒插畫 - 主角改為長亨大棕熊
 */
export const generateHealingImage = async (userText: string, moodLevel: number, zone: string | null): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const moodDesc = moodLevel > 70 ? "vibrant sunset, warm glow" : moodLevel > 40 ? "peaceful afternoon, soft sunlight" : "gentle night, cozy lantern";
        
        // 強制鎖定泰迪熊主角
        const bearDetail = "A giant, fluffy dark brown teddy bear with a friendly face, wearing a simple beige t-shirt (Cheung Hang Bear).";
        let interactionDetail = `${bearDetail} is gently hugging a youth, offering comfort and support.`;
        
        if (zone?.includes('職涯')) {
            interactionDetail = `${bearDetail} is looking at a career map with a youth, encouraging them with a soft paw.`;
        } else if (zone?.includes('心靈')) {
            interactionDetail = `${bearDetail} is sitting quietly next to a youth on a cozy sofa, sharing a moment of silence.`;
        } else if (zone?.includes('社會')) {
            interactionDetail = `${bearDetail} is leading a group of young people in a community garden, feeling very proud.`;
        } else if (zone?.includes('創意')) {
            interactionDetail = `${bearDetail} is holding an artist's brush, helping a youth finish a colorful painting.`;
        }

        const imagePrompt = `A stunning Studio Ghibli style illustration. 
          Main Character: ${interactionDetail}
          Setting: A cozy, warm, and magical version of Cheung Hang community center. 
          Vibe: Purely healing, supportive, empathetic. 
          Lighting: ${moodDesc}. 
          Details: Soft fur textures, rich watercolor background, Lo-fi aesthetic, no text.`;

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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const moodDesc = moodLevel > 70 ? "充滿活力" : moodLevel > 40 ? "平靜" : "疲憊";
    const zoneContext = zone ? `在長亨站的 ${zone}` : "";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `為一位 ${moodDesc} 的使用者生成今日心靈能量卡。地點是在 ${zoneContext}。請以「長亨大熊」的口吻給予鼓勵。請以繁體中文回傳 JSON。`,
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
      quote: result.quote || "長亨的星星，正在為你閃爍喔。",
      theme: result.theme || "依靠",
      luckyItem: result.luckyItem || "大熊的擁抱"
    };

  } catch (error) {
    console.error("Gemini card generation error:", error);
    return {
      quote: "沒事的，我在這裡陪你。",
      theme: "陪伴",
      luckyItem: "溫暖的毛墊"
    };
  }
};

export const fetchCommunityEchoes = async (stationId: string, count: number = 3): Promise<Partial<CommunityLog>[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `模擬 ${count} 則來自「長亨站」的心聲。回傳 JSON 陣列包含: text, moodLevel, theme, tags, deviceType, authorSignature, authorColor。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              moodLevel: { type: Type.NUMBER },
              theme: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              deviceType: { type: Type.STRING },
              authorSignature: { type: Type.STRING },
              authorColor: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
}
