import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";

export interface EvaluationResult {
  isCorrect: boolean;
  cleanliness: number;
  performance: number;
  feedback: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const createPrompt = (task: string, userCode: string) => `
  Ты - справедливый судья на соревнованиях по программированию. Оцени код участника по шкале от 1 до 10.
  ЗАДАЧА: "${task}"
  КОД УЧАСТНИКА: "${userCode}"
`;

// GEMINI API
const tryGemini = async (task: string, userCode: string): Promise<EvaluationResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: createPrompt(task, userCode),
    config: {
      systemInstruction: `
        Ты оцениваешь код. 
        Если в коде критическая синтаксическая ошибка (опечатка в ключевых словах вроде 'functin', 'retun'), ставь isCorrect: false, cleanliness: 1, performance: 1 и пиши где ошибка.
        Если код рабочий: НЕ снижай баллы за короткие имена переменных (str, arr, i, res). За оптимальный и чистый код смело ставь 10. Если снижаешь балл — аргументируй в feedback (макс 2 предложения).
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          cleanliness: { type: Type.INTEGER },
          performance: { type: Type.INTEGER },
          feedback: { type: Type.STRING },
        },
        required: ["isCorrect", "cleanliness", "performance", "feedback"],
      },
      temperature: 0.1,
    },
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("Gemini вернул пустой ответ");
  return JSON.parse(jsonText.trim()) as EvaluationResult;
};

// COHERE API
const tryCohere = async (task: string, userCode: string): Promise<EvaluationResult> => {
  const coherePrompt = `
    Ты - справедливый автоматический судья на соревнованиях по программированию.
    Оцени код участника по шкале от 1 до 10.

    ЖЕСТКОЕ ПРАВИЛО ДЛЯ СИНТАКСИЧЕСКИХ ОШИБОК:
    - Если в коде есть критическая синтаксическая ошибка или опечатка (например, 'functin', 'retun'), из-за которой код в принципе не скомпилируется и не запустится, ты ОБЯЗАН выставить значения: isCorrect: false, cleanliness: 1, performance: 1 и написать в feedback где именно ошибка.

    ЕСЛИ КОД СИНТАКСИЧЕСКИ КОРРЕКТЕН:
    - Чистота (cleanliness): НЕ снижай баллы за короткие имена переменных (str, arr, i, num, res). Если код понятен — ставь 10.
    - Производительность (performance): Если решение оптимально для этой задачи — ставь 10.
    - Если ставишь балл 9 и ниже, внятно обоснуй причину в feedback. За идеальный код ставь 10.

    ЗАДАЧА: "${task}"
    КОД УЧАСТНИКА: "${userCode}"

    Верни ответ СТРОГО в формате JSON:
    {
      "isCorrect": true или false,
      "cleanliness": число от 1 до 10,
      "performance": число от 1 до 10,
      "feedback": "Короткий отзыв на русском языке (макс 2-3 предложения)."
    }
  `;

  const response = await fetch("https://api.cohere.com/v2/chat", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.AI_API_KEY}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      model: "command-a-plus-05-2026", 
      messages: [{ role: "user", content: coherePrompt }],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Cohere API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json() as any;
  let content = "";

  if (data.message?.content && Array.isArray(data.message.content)) {
    const textBlock = data.message.content.find((block: any) => block.type === "text");
    if (textBlock) content = textBlock.text;
  }

  if (!content) content = "{}";
  content = content.replace(/```json|```/g, '').trim();

  return JSON.parse(content) as EvaluationResult;
};

export const evaluateCode = async (task: string, userCode: string): Promise<EvaluationResult> => {
  try {
    console.log("[AI Service] Пробуем проверить код через основного провайдера (Gemini)...");
    return await tryGemini(task, userCode);
  } catch (geminiError: any) {
    console.warn(`[AI Service] Основной провайдер (Gemini) недоступен: ${geminiError.message || geminiError}`);
    console.log("[AI Service] Переключаюсь на резервный провайдер (Cohere)...");
    
    try {
      return await tryCohere(task, userCode);
    } catch (cohereError: any) {
      console.error("[AI Service] ❌ Оба ИИ-провайдера упали.");
      throw new Error(`Все ИИ-сервисы перегружены. Ошибка Cohere: ${cohereError.message}`);
    }
  }
};