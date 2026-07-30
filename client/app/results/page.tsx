"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, User, LogOut } from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState<string | null>(null);
  const [cleanliness, setCleanliness] = useState<number | null>(null);
  const [performance, setPerformance] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState<number | null>(null);

  useEffect(() => {
    const savedNickname = sessionStorage.getItem("nickname");
    const savedCleanliness = sessionStorage.getItem("finalCleanliness");
    const savedPerformance = sessionStorage.getItem("finalPerformance");
    const savedTimeSpent = sessionStorage.getItem("timeSpent");

    if (!savedNickname) {
      router.push("/");
      return;
    }
    if (!savedCleanliness || !savedPerformance || !savedTimeSpent) {
      router.push("/challenge");
      return;
    }

    setNickname(savedNickname);
    setCleanliness(Number(savedCleanliness));
    setPerformance(Number(savedPerformance));
    setTimeSpent(Number(savedTimeSpent));
  }, [router]);

  const handlePlayAgain = () => {
    sessionStorage.removeItem("finalCleanliness");
    sessionStorage.removeItem("finalPerformance");
    sessionStorage.removeItem("timeSpent");
    sessionStorage.setItem("gameStartTime", Date.now().toString());
    router.push("/challenge");
  };

  const handleBackToProfile = () => {
    router.push("/profile");
  };

  const handleLogout = () => {
    sessionStorage.clear();
    router.push("/");
  };

  if (!nickname || cleanliness === null || performance === null || timeSpent === null) {
    return null;
  }

  const mm = String(Math.floor(timeSpent / 60)).padStart(2, "0");
  const ss = String(timeSpent % 60).padStart(2, "0");
  const overall = Math.round(((cleanliness + performance) / 2) * 10) / 10;
  const AVG_FINISH_SECONDS = 272; // 04:32, matches the arena-wide average shown elsewhere
  const fasterThanAvg = timeSpent < AVG_FINISH_SECONDS;

  const scoreColor = (n: number) =>
    n >= 8 ? "text-[#17B26A]" : n >= 5 ? "text-[#B8860B]" : "text-[#FF2D20]";

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

        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .live-dot { animation: live-pulse 1.6s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
          .live-dot { animation: none; opacity: 1; }
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
                  <span className="w-1.5 h-1.5 rounded-full bg-[#17B26A] live-dot mr-3" />
                  раунд завершён
                  <span className="mx-6 text-[#FF2D20]">✕</span>
                  {nickname}
                  <span className="mx-6 text-[#FFC300]">✕</span>
                  время · {mm}:{ss}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16">
        <div className="relative -mx-5 sm:-mx-8 px-5 sm:px-8 mb-10 sm:mb-14">
          <span className="font-mono text-xs sm:text-sm tracking-[0.3em] uppercase text-[#6B7280] mb-3 block">
            code arena · протокол забега
          </span>
          <h1 className="font-black-display uppercase leading-[0.82] text-[15vw] sm:text-[9vw] lg:text-[7.5vw] tracking-tight">
            Финиш,
            <br />
            <span className="stroke-ink translate-x-3 sm:translate-x-10 lg:translate-x-16 inline-block">
              {nickname}!
            </span>
          </h1>
          <p className="font-body text-[#6B7280] max-w-md mt-6 text-[15px] sm:text-base leading-relaxed">
            {fasterThanAvg
              ? "Быстрее среднего по арене. Табло запомнит это."
              : "Решение принято. В следующий раз — быстрее среднего по арене."}
          </p>
        </div>

        <div className="relative grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-0 items-start">
          {/* time & score card */}
          <section className="relative z-10 lg:rotate-[-1.5deg] lg:-mr-10 bg-[#101014] text-[#F5F3EE] rounded-3xl p-7 sm:p-9 shadow-[0_25px_70px_-15px_rgba(16,16,20,0.45)]">
            <div className="absolute -top-5 -left-4 rotate-[-8deg] bg-[#FFC300] text-[#101014] font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-[0_8px_20px_-6px_rgba(255,195,0,0.5)]">
              задача решена
            </div>

            <p className="font-mono text-[11px] text-[#F5F3EE]/40 uppercase tracking-wider mb-2">
              твоё время
            </p>
            <p className="font-mono font-800 tabular-nums text-[64px] sm:text-[84px] leading-none">
              {mm}:{ss}
            </p>
            <p className="font-mono text-xs text-[#F5F3EE]/40 mt-2">
              сред. по арене · 04:32
              {fasterThanAvg ? (
                <span className="text-[#17B26A]"> · быстрее среднего</span>
              ) : (
                <span className="text-[#FFC300]"> · медленнее среднего</span>
              )}
            </p>

            <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-white/10">
              <div>
                <p className={`font-black-display text-2xl sm:text-3xl ${scoreColor(cleanliness)}`}>
                  {cleanliness}
                </p>
                <p className="font-mono text-[10px] text-[#F5F3EE]/40 uppercase tracking-wider mt-1">
                  чистота
                </p>
              </div>
              <div>
                <p className={`font-black-display text-2xl sm:text-3xl ${scoreColor(performance)}`}>
                  {performance}
                </p>
                <p className="font-mono text-[10px] text-[#F5F3EE]/40 uppercase tracking-wider mt-1">
                  скорость
                </p>
              </div>
              <div>
                <p className="font-black-display text-2xl sm:text-3xl text-[#F5F3EE]">
                  {overall}
                </p>
                <p className="font-mono text-[10px] text-[#F5F3EE]/40 uppercase tracking-wider mt-1">
                  итог
                </p>
              </div>
            </div>
          </section>

          <section className="relative z-20 lg:rotate-[1deg] lg:mt-10 lg:-ml-4 bg-white border-2 border-[#101014] rounded-3xl p-7 sm:p-9 shadow-[0_25px_70px_-15px_rgba(16,16,20,0.25)]">
            <div className="absolute -top-5 -right-4 rotate-[8deg] bg-[#FF2D20] text-white font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-[0_8px_20px_-6px_rgba(255,45,32,0.6)]">
              раунд 12 · live
            </div>

            <div className="mb-7">
              <h2 className="font-black-display uppercase text-2xl sm:text-3xl tracking-tight">
                Что дальше?
              </h2>
              <p className="font-body text-[#6B7280] text-sm mt-2">
                Табло не спит — можно сразу попробовать побить своё время.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePlayAgain}
                className="font-black-display group w-full py-5 bg-[#101014] hover:bg-[#FF2D20] uppercase tracking-wide text-[#F5F3EE] rounded-xl transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2.5 text-lg"
              >
                <RotateCcw className="w-5 h-5 transition-transform group-hover:-rotate-45" />
                Играть снова
              </button>

              <button
                onClick={handleBackToProfile}
                className="font-mono w-full py-3 bg-[#F5F3EE] hover:bg-[#2547FF]/10 hover:text-[#2547FF] font-medium rounded-xl transition-colors flex items-center justify-center gap-2 border-2 border-[#101014]/10 hover:border-[#2547FF]/30 cursor-pointer text-xs uppercase tracking-wider"
              >
                <User className="w-3.5 h-3.5" />
                В профиль
              </button>

              <button
                onClick={handleLogout}
                className="font-mono w-full py-3 bg-transparent hover:bg-[#FF2D20]/10 hover:text-[#FF2D20] font-medium rounded-xl transition-colors flex items-center justify-center gap-2 border-2 border-transparent cursor-pointer text-xs uppercase tracking-wider text-[#6B7280]"
              >
                <LogOut className="w-3.5 h-3.5" />
                Сменить аккаунт
              </button>
            </div>

            <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#101014]/10 font-mono text-xs text-[#6B7280]">
              <span>сред. решение · 04:32</span>
              <span>сегодня стартовало · 963</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
