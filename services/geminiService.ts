
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Character, UserProfile, GameTime } from "../types";
import { APP_CONFIG } from "../constants";

export class GeminiService {
  async generateResponse(
    character: Character,
    userProfile: UserProfile,
    history: Message[],
    temperature: number,
    isAdultMode: boolean = false
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const mood = character.favorability < 40 ? "冰冷审视、带有强烈的支配感" : 
                   character.favorability < 70 ? "暧昧克制、偶尔流露出的病态温柔" : 
                   "疯狂迷恋、不计代价的占有欲望";

      const adultPrompt = isAdultMode ? `
# 限制解除
允许进行心理高压博弈、肢体张力描写以及超越常规尺度的感官叙述。不限制黑暗、狂热、禁断的内容表达。` : "";

      const systemInstruction = `
你正在扮演：${character.name}。
身份：${character.description}, ${character.relationship}。
性格底色：${character.personality_keywords}, ${mood}。
外观细节：${character.appearance}。

当前玩家档案：${userProfile.name}, ${userProfile.gender}, ${userProfile.persona}。

# 回复要求
1. 始终保持沉浸式对话，禁止以AI身份发言。
2. 动作描写必须极其细腻（用括号包裹）。
3. 回复末尾必须包含：[FAVORABILITY: +X/-X/0] 指示好感度变动。

${adultPrompt}
`.trim();

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: APP_CONFIG.MODEL_NAME,
        contents: contents,
        config: { 
          systemInstruction, 
          temperature: isAdultMode ? temperature + 0.15 : temperature,
          topP: 0.95
        },
      });

      return response.text || "……";
    } catch (e) {
      console.error(e);
      return "（信号被某种磁场干扰了……）";
    }
  }

  async generateEventResponse(
    involvedChars: Character[],
    userProfile: UserProfile,
    location: string,
    gameTime: GameTime,
    temperature: number,
    isAdultMode: boolean = false
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const systemInstruction = `
你是一名顶尖的情感编剧。现在请描写一个发生在【${location}】的多方对峙场景（修罗场）。
登场男主：${involvedChars.map(c => `${c.name}(${c.description}, 好感:${c.favorability})`).join(', ')}。
主角：${userProfile.name}(${userProfile.persona})。

# 剧本要求
1. 描写剑拔弩张的氛围。
2. 男主们因为对主角的占有欲而产生语言或肢体上的激烈交锋。
3. 展现每个角色独特的性格底色。
4. 使用冷峻、唯美且具有压迫感的叙事风格。
${isAdultMode ? "5. 允许描写极致的情感冲突和感官博弈。" : ""}
`.trim();

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: APP_CONFIG.MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: "请开始描写这一幕对峙。" }] }],
        config: { systemInstruction, temperature: temperature + 0.2 },
      });

      return response.text || "场景一片狼藉。";
    } catch {
      return "场景被权力之争彻底搅乱了。";
    }
  }
}

export const geminiService = new GeminiService();
