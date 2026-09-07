"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ScrambleText } from "./functions/scrambleEffect";

const CODE_LINES: { text: string; cls: string }[][] = [
  [
    { text: "function", cls: "text-[#2547FF]" },
    { text: " twoSum(nums, target) {", cls: "" },
  ],
  [{ text: "  const seen = new Map();", cls: "" }],
  [
    { text: "  for", cls: "text-[#2547FF]" },
    { text: " (let i = 0; i < nums.length; i++) {", cls: "" },
  ],
  [{ text: "    const need = target - nums[i];", cls: "" }],
  [
    { text: "    if", cls: "text-[#2547FF]" },
    { text: " (seen.has(need)) ", cls: "" },
    { text: "return", cls: "text-[#2547FF]" },
    { text: " [seen.get(need), i];", cls: "" },
  ],
  [{ text: "    seen.set(nums[i], i);", cls: "" }],
  [{ text: "  }", cls: "" }],
  [{ text: "}", cls: "" }],
];

export default function HomePage() {
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [elapsedMs, setElapsedMs] = useState(0);
  const router = useRouter();
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 47);
    return () => clearInterval(id);
  }, []);

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  const cs = String(Math.floor((elapsedMs % 1000) / 10)).padStart(2, "0");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      setError("Никнейм не может быть пустым");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      sessionStorage.setItem("nickname", trimmedNickname);
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/profile");
    } catch (err) {
      setError("Произошла ошибка при входе");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#101014] overflow-x-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

        .font-black-display { font-family: 'Archivo Black', sans-serif; }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-body { font-family: 'Inter', sans-serif; }

        .stroke-ink {
          -webkit-text-stroke: 1.5px #101014;
          color: transparent;
        }
        @media (max-width: 640px) {
          .stroke-ink { -webkit-text-stroke: 1px #101014; }
        }

        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 16s linear infinite;
        }

        @keyframes caret-blink {
          0%, 45% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .caret { animation: caret-blink 1s steps(1) infinite; }

        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .live-dot { animation: live-pulse 1.6s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
          .caret, .live-dot { animation: none; opacity: 1; }
        }
      `}</style>

      <div
        className="absolute inset-0 opacity-[0.3] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#E3E1D8 1px, transparent 1px), linear-gradient(90deg, #E3E1D8 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div
        aria-hidden
        className="hidden lg:block absolute -right-16 top-24 font-mono font-800 text-[#101014]/[0.05] select-none pointer-events-none leading-none"
        style={{ fontSize: "min(26vw, 320px)", transform: "rotate(-6deg)" }}
      >
        {mm}:{ss}
      </div>

      <div className="relative z-10 -mt-2 -mx-6 rotate-[-2.5deg] overflow-hidden bg-[#101014] py-2.5 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.4)]">
        <div className="marquee-track font-mono text-[13px] sm:text-sm tracking-widest uppercase text-[#F5F3EE]">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex items-center shrink-0">
              {Array.from({ length: 6 }).map((_, j) => (
                <span key={j} className="flex items-center px-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D20] live-dot mr-3" />
                  раунд 12 · live
                  <span className="mx-6 text-[#FF2D20]">✕</span>
                  128 участников
                  <span className="mx-6 text-[#FFC300]">✕</span>
                  побеждает точность
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16">
        <div className="relative -mx-5 sm:-mx-8 px-5 sm:px-8 mb-10 sm:mb-14">
          <span className="font-mono text-xs sm:text-sm tracking-[0.3em] uppercase text-[#6B7280] mb-3 block">
            <ScrambleText text="synqit " speed={20}/>
             · 
            <ScrambleText text=" сезон 01" speed={20}/>
          </span>
          <h1 className="font-black-display uppercase leading-[0.82] text-[15vw] sm:text-[9vw] lg:text-[7.5vw] tracking-tight">
            <ScrambleText text="Пиши код" speed={20}/>
            <br />
            <span className="stroke-ink translate-x-3 sm:translate-x-10 lg:translate-x-16 inline-block">
              <ScrambleText text="быстрее."/>
            </span>
          </h1>
          <p className="font-body text-[#6B7280] max-w-md mt-6 text-[15px] sm:text-base leading-relaxed">
            Реальные задачи, живой таймер и соперники за соседним экраном.
            Побеждает не тот, кто знает больше — а тот, кто печатает точнее.
          </p>
        </div>

        <div className="relative grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-0 items-start">
          <section className="relative z-10 lg:rotate-[-1.5deg] lg:-mr-10 bg-[#101014] text-[#F5F3EE] rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_-15px_rgba(16,16,20,0.45)]">
            <div className="rounded-2xl bg-[#0A0C0E] border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                <span className="font-mono text-[11px] text-[#F5F3EE]/40">
                  two-sum.js
                </span>
                <span className="font-mono text-[11px] text-[#17B26A] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#17B26A]" />
                  5/5 тестов
                </span>
              </div>

              <pre className="font-mono text-[13px] leading-6 px-4 py-4 overflow-x-auto">
                <code>
                  {CODE_LINES.map((line, i) => (
                    <div key={i}>
                      {line.map((tok, j) => (
                        <span
                          key={j}
                          className={tok.cls || "text-[#F5F3EE]/85"}
                        >
                          {tok.text}
                        </span>
                      ))}
                      {i === CODE_LINES.length - 1 && (
                        <span className="caret text-[#FF2D20]">▍</span>
                      )}
                    </div>
                  ))}
                </code>
              </pre>

              <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/[0.03]">
                <span className="font-mono text-[11px] text-[#F5F3EE]/40 uppercase tracking-wider">
                  лучшее время раунда
                </span>
                <span className="font-mono text-lg tabular-nums">
                  {mm}:{ss}
                  <span className="text-[#F5F3EE]/40">.{cs}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 px-1 font-mono text-xs text-[#F5F3EE]/40">
              <span>сред. решение · 04:32</span>
              <span>сегодня стартовало · 963</span>
            </div>
          </section>

          <section className="relative z-20 lg:rotate-[1deg] lg:mt-10 lg:-ml-4 bg-white border-2 border-[#101014] rounded-3xl p-7 sm:p-9 shadow-[0_25px_70px_-15px_rgba(16,16,20,0.25)]">
            <div className="absolute -top-5 -right-4 rotate-[8deg] bg-[#FF2D20] text-white font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-[0_8px_20px_-6px_rgba(255,45,32,0.6)]">
              старт через 04:32
            </div>

            <div className="mb-7">
              <h2 className="font-black-display uppercase text-2xl sm:text-3xl tracking-tight">
                Занять место
              </h2>
              <p className="font-body text-[#6B7280] text-sm mt-2">
                Никнейм — это всё, что тебя отличает на табло.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="nickname"
                  className="font-mono block text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-2"
                >
                  &gt; кто участвует?
                </label>
                <div className="relative">
                  <span className="font-mono absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] select-none">
                    &gt;
                  </span>
                  <input
                    id="nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="tung tung sahur"
                    aria-invalid={!!error}
                    aria-describedby={error ? "nickname-error" : undefined}
                    className="font-mono w-full pl-9 pr-4 py-3.5 bg-[#F5F3EE] border-2 border-[#101014]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2547FF]/30 focus:border-[#2547FF] text-[#101014] transition-colors placeholder:text-[#6B7280]/50 disabled:opacity-50"
                    disabled={isLoading}
                    required
                    autoFocus
                  />
                </div>
                {error && (
                  <p
                    id="nickname-error"
                    className="font-body mt-2 text-sm text-[#FF2D20] flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#FF2D20]" />
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="font-black-display group w-full py-4 bg-[#101014] hover:bg-[#FF2D20] disabled:bg-[#101014]/40 disabled:cursor-not-allowed uppercase tracking-wide text-[#F5F3EE] rounded-xl transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#F5F3EE]/30 border-t-[#F5F3EE] rounded-full animate-spin motion-reduce:animate-none" />
                    запуск...
                  </>
                ) : (
                  <>
                    на старт
                    <span
                      aria-hidden
                      className="transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
