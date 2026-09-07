import { GoogleGenAI, Type } from "@google/genai";

const geminiKey = process.env.GEMINI_API_KEY;

if (!geminiKey) {
  console.error("ОШИБКА: GEMINI_API_KEY отсутствует в process.env!");
}

export interface EvaluationResult {
  isCorrect: boolean;
  cleanliness: number;
  performance: number;
  feedback: string;
}

const ai = new GoogleGenAI({ apiKey: geminiKey || "" });

const createPrompt = (task: string, userCode: string) => `
  Ты - справедливый судья на соревнованиях по программированию. Оцени код участника по шкале от 1 до 10.
  ЗАДАЧА: "${task}"
  КОД УЧАСТНИКА: "${userCode}"
`;

// GEMINI API
const tryGemini = async (task: string, userCode: string): Promise<EvaluationResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: createPrompt(task, userCode),
    config: {
      systemInstruction: `
        Ты — строгое автоматическое жюри на соревновании по программированию.
        Твоя главная задача — проверить, решает ли код поставленную задачу.

        АЛГОРИТМ ОЦЕНКИ (СЛЕДУЙ СТРОГО ПО ШАГАМ):

        ШАГ 1: Проверка корректности (isCorrect)
        - Если код содержит синтаксическую ошибку, не компилируется или возвращает НЕВЕРНЫЙ результат (например, возвращает строку с лишними запятыми вместо чистого результата):
          УСТАНОВИ СТРОГО: 
          isCorrect: false
          cleanliness: 1
          performance: 1
          (НЕ ВЫСТАВЛЯЙ 10 БАЛЛОВ, ЕСЛИ КОД РАБОТАЕТ НЕВЕРНО!)

        - ИСКЛЮЧИТЕЛЬНО если код полностью выполняет условия задачи и возвращает 100% верный результат:
          УСТАНОВИ:
          isCorrect: true
          cleanliness: от 1 до 10 (оценивай читаемость)
          performance: от 1 до 10 (оценивай алгоритмическую сложность)

        ШАГ 2: Правила для feedback
        - Запрещено давать готовый код или напрямую называть функции/методы для исправления (НЕ ПИШИ "используй join('')" или "замени x на y").
        - Направляй мысли пользователя: укажи на то, ЧТО не так с итоговым результатом (например: "Итоговая строка содержит лишние разделители между символами").
        - Максимум 2 коротких предложения на русском языке.
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
      temperature: 0.0,
    },
  });

  let jsonText = response.text;
  if (!jsonText) throw new Error("Gemini вернул пустой ответ");

  jsonText = jsonText.replace(/```json|```/g, "").trim();

  return JSON.parse(jsonText) as EvaluationResult;
};

// COHERE API
const tryCohere = async (task: string, userCode: string): Promise<EvaluationResult> => {
  const cohereKey = process.env.AI_API_KEY;
  if (!cohereKey) {
    throw new Error("AI_API_KEY отсутствует в process.env");
  }

  const coherePrompt = `
    Ты — строгое автоматическое жюри на соревновании по программированию.

    АЛГОРИТМ ОЦЕНКИ:
    1. Проверка корректности (isCorrect):
       - Если код содержит ошибки или возвращает неверный результат (например, результат содержит лишние запятые):
         isCorrect: false, cleanliness: 1, performance: 1.
         (КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО ставить 10/10 при неверном результате!).
       - Если код работает идеально и решает задачу:
         isCorrect: true, cleanliness: 10, performance: 10.

    2. Правила для feedback:
       - НЕ давай готовых решений и НЕ называй конкретные функции/методы для исправления.
       - Указывай только на симптомы ошибки в итоговом результате.
       - Максимум 2 предложения на русском языке.

    ЗАДАЧА: "${task}"
    КОД УЧАСТНИКА: "${userCode}"

    Верни ответ СТРОГО в формате JSON:
    {
      "isCorrect": boolean,
      "cleanliness": число от 1 до 10,
      "performance": число от 1 до 10,
      "feedback": "Наводящий отзыв без прямых ответов"
    }
  `;

  const response = await fetch("https://api.cohere.com/v2/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cohereKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: "command-a-plus-05-2026",
      messages: [{ role: "user", content: coherePrompt }],
      temperature: 0.0,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Cohere API Error: ${response.status} - ${errText}`);
  }

  const data = (await response.json()) as any;
  let content = "";

  if (data.message?.content && Array.isArray(data.message.content)) {
    const textBlock = data.message.content.find((block: any) => block.type === "text");
    if (textBlock) content = textBlock.text;
  }

  if (!content) content = "{}";
  content = content.replace(/```json|```/g, "").trim();

  return JSON.parse(content) as EvaluationResult;
};

export const evaluateCode = async (task: string, userCode: string): Promise<EvaluationResult> => {
  try {
    console.log("[AI Service] Пробуем проверить код через основного провайдера (Gemini)...");
    return await tryGemini(task, userCode);
  } catch (geminiError: any) {
    console.warn(`[AI Service] Ошибка Gemini: ${geminiError.message || geminiError}`);
    
    if (geminiError.cause) {
      console.error("[AI Service] Gemini Error Cause:", geminiError.cause);
    } else {
      console.error("[AI Service] Gemini Full Error:", geminiError);
    }

    console.log("[AI Service] Переключаюсь на резервный провайдер (Cohere)...");

    try {
      return await tryCohere(task, userCode);
    } catch (cohereError: any) {
      console.error("[AI Service] Ошибка Cohere:", cohereError.message || cohereError);
      if (cohereError.cause) {
        console.error("[AI Service] Cohere Error Cause:", cohereError.cause);
      }
      
      throw new Error(`Все ИИ-сервисы недоступны. Gemini: ${geminiError.message}; Cohere: ${cohereError.message}`);
    }
  }
};