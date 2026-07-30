"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { Play, CheckCircle, AlertTriangle, Loader2, ArrowRight } from "lucide-react";

interface EvaluationResult {
  isCorrect: boolean;
  cleanliness: number;
  performance: number;
  feedback: string;
}

export default function ChallengePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState(`function reverseStr(str) {\n  // Твой код здесь\n  \n}`);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number>(Date.now());

  const task = "Напишите функцию, которая принимает строку и возвращает её задом наперед.";

  useEffect(() => {
    const savedNickname = sessionStorage.getItem("nickname");
    if (!savedNickname) {
      router.push("/");
    } else {
      setNickname(savedNickname);
    }
    const startTime = Number(sessionStorage.getItem("gameStartTime") || Date.now());
    startRef.current = startTime;
  }, [router]);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 250);
    return () => clearInterval(id);
  }, []);

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");

  const scoreColor = (n: number) =>
    n >= 8 ? "text-[#17B26A]" : n >= 5 ? "text-[#B8860B]" : "text-[#FF2D20]";

  const handleSubmitCode = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://localhost:3000/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task,
          code,
        }),
      });

      if (!response.ok) {
        throw new Error("Не удалось получить ответ от сервера проверки.");
      }

      const data: EvaluationResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Произошла непредвиденная ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishGame = () => {
    if (!result) return;

    const startTime = Number(sessionStorage.getItem("gameStartTime") || Date.now());
    const endTime = Date.now();
    const timeSpentSeconds = Math.round((endTime - startTime) / 1000);

    sessionStorage.setItem("finalCleanliness", result.cleanliness.toString());
    sessionStorage.setItem("finalPerformance", result.performance.toString());
    sessionStorage.setItem("timeSpent", timeSpentSeconds.toString());

    router.push("/results");
  };

  if (!nickname) return null;

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#101014] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

        .font-black-display { font-family: 'Archivo Black', sans-serif; }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-body { font-family: 'Inter', sans-serif; }

        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .live-dot { animation: live-pulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .live-dot { animation: none; opacity: 1; }
        }
      `}</style>

      <header className="relative bg-[#101014] text-[#F5F3EE] border-b-4 border-[#FF2D20] px-5 sm:px-6 py-3.5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#17B26A] live-dot" />
          <h1 className="font-black-display uppercase text-sm sm:text-base tracking-wider">
            code arena
          </h1>
          <span className="hidden sm:inline font-mono text-[11px] text-[#F5F3EE]/40 uppercase tracking-widest">
            · тренажёр
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <span className="font-mono text-lg sm:text-xl tabular-nums">
            {mm}:{ss}
          </span>
          <span className="hidden sm:block font-mono text-xs text-[#F5F3EE]/50">
            игрок · <span className="text-[#F5F3EE]">{nickname}</span>
          </span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        <div className="p-5 sm:p-7 flex flex-col gap-6 overflow-y-auto relative">
          <div
            className="absolute inset-0 opacity-[0.3] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(#E3E1D8 1px, transparent 1px), linear-gradient(90deg, #E3E1D8 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />

          <div className="relative bg-white border-2 border-[#101014] p-5 sm:p-6 rounded-2xl">
            <h2 className="font-mono text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
              &gt; задание
            </h2>
            <p className="font-display font-600 text-[#101014] text-lg sm:text-xl leading-snug">
              {task}
            </p>
          </div>

          <div className="relative flex-1 flex flex-col min-h-0">
            <h2 className="font-mono text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
              &gt; результаты проверки
            </h2>

            {isLoading && (
              <div className="flex-1 bg-white border-2 border-dashed border-[#101014]/15 rounded-2xl flex flex-col items-center justify-center p-8 min-h-[250px]">
                <Loader2 className="w-9 h-9 animate-spin text-[#FF2D20] mb-4" />
                <p className="font-display font-600 text-[#101014]">
                  Нейросеть изучает ваш код...
                </p>
                <p className="font-mono text-xs text-[#6B7280] mt-1">
                  обычно это занимает 2-3 секунды
                </p>
              </div>
            )}

            {!isLoading && !result && !error && (
              <div className="flex-1 bg-transparent border-2 border-dashed border-[#101014]/15 rounded-2xl flex flex-col items-center justify-center p-8 text-[#6B7280] min-h-[250px]">
                <Play className="w-8 h-8 mb-2 opacity-30" />
                <p className="font-mono text-sm text-center">
                  напишите код и нажмите «отправить решение»
                </p>
              </div>
            )}

            {error && (
              <div className="bg-white border-2 border-[#FF2D20] rounded-2xl p-5 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-[#FF2D20] shrink-0 mt-0.5" />
                <div>
                  <p className="font-display font-600 text-[#101014]">Произошла ошибка</p>
                  <p className="font-body text-sm text-[#6B7280] mt-1">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="bg-white border-2 border-[#101014] rounded-2xl p-5 sm:p-6 space-y-6">
                <div>
                  {result.isCorrect ? (
                    <span className="inline-block px-3 py-1.5 bg-[#17B26A] text-white font-mono font-bold rounded-lg text-xs tracking-wider uppercase rotate-[-2deg]">
                      решено успешно
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1.5 bg-[#FF2D20] text-white font-mono font-bold rounded-lg text-xs tracking-wider uppercase rotate-[-2deg]">
                      есть ошибки
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F5F3EE] border-2 border-[#101014]/10 p-4 rounded-xl text-center">
                    <p className="font-mono text-[11px] text-[#6B7280] font-medium uppercase tracking-wider">
                      чистота кода
                    </p>
                    <p className={`font-black-display text-3xl mt-1.5 ${scoreColor(result.cleanliness)}`}>
                      {result.cleanliness}/10
                    </p>
                  </div>
                  <div className="bg-[#F5F3EE] border-2 border-[#101014]/10 p-4 rounded-xl text-center">
                    <p className="font-mono text-[11px] text-[#6B7280] font-medium uppercase tracking-wider">
                      скорость (perf)
                    </p>
                    <p className={`font-black-display text-3xl mt-1.5 ${scoreColor(result.performance)}`}>
                      {result.performance}/10
                    </p>
                  </div>
                </div>

                <div className="bg-[#101014] rounded-xl p-4">
                  <p className="font-mono text-[11px] text-[#F5F3EE]/40 font-medium uppercase tracking-wider mb-2">
                    отзыв ии
                  </p>
                  <p className="font-body text-sm leading-relaxed text-[#F5F3EE]/85 italic">
                    « {result.feedback} »
                  </p>
                </div>

                {result.isCorrect && (
                  <button
                    onClick={handleFinishGame}
                    className="font-black-display group w-full py-4 bg-[#101014] hover:bg-[#FF2D20] uppercase tracking-wide text-[#F5F3EE] rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    Завершить игру
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col bg-[#101014] h-[500px] lg:h-auto border-t-4 lg:border-t-0 lg:border-l-4 border-[#FF2D20]">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 shrink-0">
            <span className="font-mono text-[11px] text-[#F5F3EE]/40">
              reverse-str.js
            </span>
            <span className="font-mono text-[11px] text-[#F5F3EE]/40 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFC300]" />
              ожидает решения
            </span>
          </div>

          <div className="flex-1 min-h-0 relative">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                fontSize: 14,
                fontFamily: "JetBrains Mono, Fira Code, monospace",
                minimap: { enabled: false },
                lineNumbers: "on",
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                tabSize: 2,
              }}
            />
          </div>

          <div className="p-4 bg-[#0A0C0E] border-t border-white/10 flex justify-end shrink-0">
            <button
              onClick={handleSubmitCode}
              disabled={isLoading}
              className="font-black-display px-6 py-3 bg-[#F5F3EE] hover:bg-[#FF2D20] hover:text-[#F5F3EE] disabled:opacity-40 disabled:cursor-not-allowed text-[#101014] uppercase tracking-wide rounded-xl transition-colors cursor-pointer flex items-center gap-2 text-sm"
            >
              {isLoading ? "проверяем..." : "отправить решение"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
