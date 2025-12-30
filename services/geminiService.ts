
import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult, CommunityLog } from "../types";

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
 * 模擬從雲端抓取其他人的心聲 (用於跨設備同步感)
 */
export const fetchCommunityEchoes = async (stationId: string, count: number = 3): Promise<Partial<CommunityLog>[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `模擬 ${count} 則來自車站 "${stationId}" 的路人心聲紀錄。這是一個療癒 App。請回傳 JSON 陣列，包含: text(30字內), moodLevel(0-100), theme(二字), tags(2個), deviceType(iPad/行動裝置/電腦端), authorSignature(稱號#四位數), authorColor(Hex色碼)。`,
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

/**
 * 根據使用者文字生成療癒插畫
 */
export const generateHealingImage = async (userText: string, moodLevel: number, zone: string | null): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
        const moodDesc = moodLevel > 70 ? "vibrant sunset, warm glow, sparkling dust" : moodLevel > 40 ? "peaceful afternoon, soft sunlight through leaves" : "gentle night, blue moonlight, cozy lantern";
        
        let interactionDetail = "A social worker and a teenager sharing a quiet moment, talking and smiling together.";
        let envDetail = "inside a colorful, plant-filled youth community center with cozy bean bags and art on the walls.";

        if (zone?.includes('職涯')) {
            interactionDetail = "A mentor guiding a youth on a creative project, pointing at a laptop screen together.";
            envDetail = "a bright studio space with design posters and a workspace overlooking the city.";
        } else if (zone?.includes('心靈')) {
            interactionDetail = "A social worker offering a cup of warm tea to a youth who is relaxing on a comfy sofa.";
            envDetail = "a very cozy private corner with fairy lights, plush pillows, and a shelf of healing books.";
        } else if (zone?.includes('社會')) {
            interactionDetail = "A group of diverse young volunteers laughing and working together on a community mural.";
            envDetail = "an urban outdoor space with vibrant street art and green plants.";
        } else if (zone?.includes('創意')) {
            interactionDetail = "A young artist showing their sketchbook to a supportive elder who is listening intently.";
            envDetail = "a messy but inspiring art workshop filled with canvases, paint, and creative energy.";
        }

        const imagePrompt = `A stunning Lo-fi aesthetic illustration in Studio Ghibli style. 
          Focus Story: ${interactionDetail}
          Setting: ${envDetail}. 
          Vibe: Supportive, healing, empowering, empathetic. 
          Lighting: ${moodDesc}. 
          Characters: Stylized characters with soft features, natural poses. The social worker wears a soft knit cardigan, the youth wears modern casual wear. 
          Details: Soft watercolor textures, hand-drawn feel, rich backgrounds, no text.`;

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
