import express, { Request, Response } from "express";
import cors from "cors";
import aiRouter from "./ai/aiRoutes";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "server is healthy" });
});

app.use("/api", aiRouter); 

export default app;