import { Request, Response } from "express";
import { evaluateCode } from "./aiService";

export const aiController = async (req: Request, res: Response) => {
  try {
    const { task, code } = req.body;

    if (!task || !code) {
      res.status(400).json({ error: "Поля task и code обязательны" });
      return; 
    }

    console.log(`[Модуль] Получен код на проверку для задачи: "${task.substring(0, 30)}..."`);

    const result = await evaluateCode(task, code);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};