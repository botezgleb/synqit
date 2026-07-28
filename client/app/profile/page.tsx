"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Play, LogOut, Trophy, Clock } from "lucide-react";
import { ScrambleText } from "../functions/scrambleEffect";

export default function ProfilePage() {
  const [nickname, setNickname] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedNickname = sessionStorage.getItem("nickname");

    if (!savedNickname) {
      router.push("/");
    } else {
      setNickname(savedNickname);
    }
  }, [router]);

  const handleStartGame = () => {
    sessionStorage.setItem("gameStartTime", Date.now().toString());
    router.push("/challenge");
  };

  const handleLogout = () => {
    sessionStorage.clear();
    router.push("/");
  };

  if (!nickname) return null;

  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#101014] overflow-hidden relative">
      <div
        className="absolute inset-0 opacity-[0.3] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#E3E1D8 1px, transparent 1px), linear-gradient(90deg, #E3E1D8 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="mb-12">
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#6B7280]">
            <ScrambleText text="profile " />
              · 
            <ScrambleText text=" synqit" />
          </span>

          <h1 className="font-black-display uppercase leading-[0.82] mt-4 text-[13vw] sm:text-[8vw] lg:text-[6vw]">
            <ScrambleText text="Игрок" />
            <br />
            <span
              className="inline-block"
              style={{
                WebkitTextStroke: "1.5px #101014",
                color: "transparent",
              }}
            >
              <ScrambleText text={nickname} />
            </span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
          <section className="lg:rotate-[-1.5deg] bg-[#101014] text-[#F5F3EE] rounded-3xl p-8 shadow-[0_25px_70px_-15px_rgba(16,16,20,0.45)]">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 rounded-2xl bg-[#FF2D20] flex items-center justify-center">
                <User size={38} />
              </div>

              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-white/40">
                  участник
                </p>

                <h2 className="font-black-display text-3xl uppercase">
                  {nickname}
                </h2>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 mb-3 text-white/40">
                  <Trophy size={16} />
                  <span className="font-mono text-xs uppercase">
                    рейтинг
                  </span>
                </div>

                <div className="font-black-display text-4xl">#128</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 mb-3 text-white/40">
                  <Clock size={16} />
                  <span className="font-mono text-xs uppercase">
                    лучшее время
                  </span>
                </div>

                <div className="font-black-display text-4xl">04:32</div>
              </div>
            </div>

            <div className="mt-8 font-mono text-xs text-white/40 flex justify-between">
              <span>решено задач · 37</span>
              <span>сезон · 04</span>
            </div>
          </section>

          <section className="relative lg:rotate-[1deg] bg-white border-2 border-[#101014] rounded-3xl p-8 shadow-[0_25px_70px_-15px_rgba(16,16,20,0.25)]">
            <div className="absolute -top-5 -right-4 rotate-[8deg] bg-[#FF2D20] text-white font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg">
              готов к старту
            </div>

            <div className="mb-8">
              <h2 className="font-black-display uppercase text-3xl">
                Управление
              </h2>

              <p className="text-[#6B7280] mt-2">
                Выбери действие и вступай в следующий раунд.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleStartGame}
                className="group w-full py-4 bg-[#101014] hover:bg-[#FF2D20] text-[#F5F3EE] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-3 uppercase font-black-display"
              >
                <Play size={18} />

                Начать игру

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-4 border-2 border-[#101014]/10 hover:border-[#FF2D20] hover:text-[#FF2D20] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-3 font-mono uppercase text-sm"
              >
                <LogOut size={16} />
                Сменить аккаунт
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}