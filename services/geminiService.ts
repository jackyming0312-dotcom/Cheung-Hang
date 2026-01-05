
import { GoogleGenAI, Type } from "@google/genai";
import { EnergyCardData, GeminiAnalysisResult, FullSoulContent } from "../types";

const STYLE_HINTS: ('warm' | 'fresh' | 'calm' | 'energetic' | 'dreamy')[] = ['warm', 'fresh', 'calm', 'energetic', 'dreamy'];

const FALLBACK_CONTENT_POOL = [
  {
    card: {
      quote: "慢一點沒關係，亨仔會陪你慢慢走。",
      theme: "沉穩節奏",
      luckyItem: "溫暖的茶",
      category: "生活態度" as const,
      relaxationMethod: "深呼吸三次，感受空氣進入肺部的清涼。",
      styleHint: "calm" as const
    },
    tags: ['#慢活', '#深呼吸', '#自我陪伴']
  },
  {
    card: {
      quote: "允許自己休息，是為了走更長遠的路。",
      theme: "自我照顧",
      luckyItem: "柔軟的抱枕",
      category: "放鬆練習" as const,
      relaxationMethod: "放下手機，閉眼聆聽周遭的細碎聲音。",
      styleHint: "warm" as const
    },
    tags: ['#休息', '#重新出發', '#愛自己']
  }
];

export const getRandomFallbackContent = (): FullSoulContent => {
  const selection = FALLBACK_CONTENT_POOL[Math.floor(Math.random() * FALLBACK_CONTENT_POOL.length)];
  const randomStyle = STYLE_HINTS[Math.floor(Math.random() * STYLE_HINTS.length)];
  
  return {
    analysis: {
      sentiment: 'neutral',
      tags: selection.tags,
      replyMessage: "亨仔看見了你的心聲。無論外面的世界多吵雜，這裡永遠有你的位子。"
    },
    card: { ...selection.card, styleHint: randomStyle }
  };
};

/**
 * Generates soul healing content using Gemini API with Hung Jai persona and Image Generation.
 */
export const generateFullSoulContent = async (text: string, moodLevel: number, zone: string | null): Promise<FullSoulContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const forcedStyle = STYLE_HINTS[Math.floor(Math.random() * STYLE_HINTS.length)];

  const timeoutPromise = new Promise<null>((_, reject) => 
    setTimeout(() => reject(new Error("AI_TIMEOUT")), 25000) // 延長超時以應付圖像生成
  );

  const aiTask = async (): Promise<FullSoulContent> => {
    try {
      // 第一步：文字生成與繪圖指令構思
      const textResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你現在是一位名為「亨仔」的溫暖熊仔（Teddy Bear），也是一位治癒系插畫家。
        你的任務是聆聽使用者的心聲，並將其轉化為溫暖的文字與手繪風格的「能量卡片」。
        
        使用者目前的心聲內容：「${text}」
        電力狀態：${moodLevel}%
        視覺風格：${forcedStyle}

        任務流程：
        1. 分析使用者情緒，用亨仔口吻給予簡短溫暖的鼓勵（replyMessage）。
        2. 生成 3 個相關 Hashtag。
        3. 構思一幅英文繪圖指令 (image_prompt)：
           - 主體：可愛棕色熊仔（Hang Zai），拿著畫筆或粉筆。
           - 場景：心事牆（牆壁或黑板），亨仔正在畫出象徵使用者心聲的療癒物。
           - 風格：Hand-drawn, crayon texture, cozy, healing, soft lighting.

        請以 JSON 格式回傳：
        {
          "reply_text": "中文回應",
          "hashtags": ["#標籤1", "#標籤2", "#標籤3"],
          "image_prompt": "English image generation prompt",
          "card_theme": "2-4字主題",
          "lucky_item": "療癒小物",
          "relaxation": "一小段放鬆建議"
        }`,
        config: {
          temperature: 1.0,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply_text: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              image_prompt: { type: Type.STRING },
              card_theme: { type: Type.STRING },
              lucky_item: { type: Type.STRING },
              relaxation: { type: Type.STRING }
            }
          }
        }
      });

      if (!textResponse.text) throw new Error("EMPTY_TEXT_RESPONSE");
      const textResult = JSON.parse(textResponse.text);

      // 第二步：呼叫繪圖模型
      let generatedImageUrl = undefined;
      try {
        const imageResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: textResult.image_prompt }],
          },
          config: {
            imageConfig: { aspectRatio: "1:1" }
          },
        });

        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (imgError) {
        console.error("Image Generation Failed:", imgError);
        // 如果圖片生成失敗，我們仍然回傳文字內容
      }

      return {
        analysis: {
          sentiment: 'neutral',
          tags: textResult.hashtags,
          replyMessage: textResult.reply_text
        },
        card: {
          quote: textResult.reply_text.substring(0, 30) + "...", 
          theme: textResult.card_theme,
          luckyItem: textResult.lucky_item,
          relaxationMethod: textResult.relaxation,
          category: '情緒共處',
          styleHint: forcedStyle,
          imageUrl: generatedImageUrl
        }
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
