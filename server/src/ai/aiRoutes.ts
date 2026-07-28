import { Router } from "express";
import { aiController } from "./aiController";

const router = Router();

router.post('/check', aiController);

export default router;