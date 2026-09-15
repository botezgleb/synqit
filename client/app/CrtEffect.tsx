"use client";

import { ReactNode } from "react";

/**
 * CRT / VHS screen effect overlay.
 *
 * Usage — wrap your whole app once in app/layout.tsx (recommended,
 * so every page gets it automatically):
 *
 *   import CrtEffect from "@/components/CrtEffect";
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html lang="ru">
 *         <body>
 *           <CrtEffect>{children}</CrtEffect>
 *         </body>
 *       </html>
 *     );
 *   }
 *
 * Or wrap an individual page's return value the same way if you only
 * want it on one screen.
 *
 * Everything here is pointer-events: none and fixed to the viewport,
 * so it never blocks clicks, typing, or the Monaco editor underneath.
 * Motion (flicker / noise crawl / tracking glitch) is disabled for
 * prefers-reduced-motion users; the static texture (scanlines, vignette,
 * glare) stays so the look doesn't change, just the movement.
 */
export default function CrtEffect({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        .crt-content {
          position: relative;
          z-index: 1;
          animation: crt-flicker 6s infinite;
        }

        .crt-layer {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 50;
        }

        /* curved-glass vignette: darkens corners like a convex tube.
           No border-radius here on purpose — rounding this box clips its own
           background/shadow away from the true corners, which is exactly what
           left the actual corner pixels light before. */
        .crt-vignette {
          --vignette-strength: 0.5; /* 0 = off, 1 = almost black corners */
          background: radial-gradient(
            ellipse at center,
            transparent 45%,
            rgba(0, 0, 0, calc(var(--vignette-strength) * 0.55)) 100%
          );
          box-shadow:
            inset 0 0 160px 60px rgba(0, 0, 0, calc(var(--vignette-strength) * 0.75)),
            inset 0 0 50px 14px rgba(0, 0, 0, calc(var(--vignette-strength) * 0.5));
          /* sits above the glare so darkening always wins in the corners */
          z-index: 61;
        }

        /* scanlines */
        .crt-scanlines {
          background: repeating-linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.1) 0px,
            rgba(0, 0, 0, 0.1) 1px,
            transparent 1px,
            transparent 3px
          );
          mix-blend-mode: multiply;
          opacity: 0.55;
          animation: crt-scanline-drift 1s linear infinite;
          z-index: 55;
        }

        /* subtle RGB fringing, concentrated near the edges like lens distortion */
        .crt-chroma-red {
          background: radial-gradient(ellipse at center, transparent 58%, rgba(255, 20, 60, 0.07) 100%);
          mix-blend-mode: screen;
          transform: translateX(1.5px);
          z-index: 56;
        }
        .crt-chroma-cyan {
          background: radial-gradient(ellipse at center, transparent 58%, rgba(0, 220, 255, 0.07) 100%);
          mix-blend-mode: screen;
          transform: translateX(-1.5px);
          z-index: 56;
        }

        /* glass reflection */
        .crt-glare {
          background: linear-gradient(
            115deg,
            rgba(255, 255, 255, 0.12) 0%,
            rgba(255, 255, 255, 0.04) 18%,
            transparent 32%
          );
          z-index: 57;
        }

        /* film grain / VHS static */
        .crt-noise {
          opacity: 0.05;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          animation: crt-noise-shift 0.4s steps(2) infinite;
          z-index: 58;
        }

        /* rare horizontal tracking-error flash, VHS style */
        .crt-tracking {
          top: 42%;
          height: 5px;
          background: rgba(255, 255, 255, 0.5);
          mix-blend-mode: overlay;
          animation: crt-tracking-glitch 9s infinite;
          z-index: 60;
        }
        /* (vignette is z-index 61, so it still darkens on top of everything below it) */

        @keyframes crt-scanline-drift {
          from { background-position-y: 0; }
          to { background-position-y: 3px; }
        }
        @keyframes crt-flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.94; }
          94% { opacity: 1; }
        }
        @keyframes crt-noise-shift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-2%, 1%); }
          100% { transform: translate(1%, -2%); }
        }
        @keyframes crt-tracking-glitch {
          0%, 96%, 100% { transform: translateY(0); opacity: 0; }
          97% { transform: translateY(-3px); opacity: 0.4; }
          98% { transform: translateY(4px); opacity: 0.22; }
        }

        @media (prefers-reduced-motion: reduce) {
          .crt-content { animation: none; }
          .crt-scanlines { animation: none; }
          .crt-noise { animation: none; }
          .crt-tracking { display: none; }
        }
      `}</style>

      <div className="crt-content">{children}</div>

      <div className="crt-layer crt-scanlines" aria-hidden />
      <div className="crt-layer crt-chroma-red" aria-hidden />
      <div className="crt-layer crt-chroma-cyan" aria-hidden />
      <div className="crt-layer crt-glare" aria-hidden />
      <div className="crt-layer crt-noise" aria-hidden />
      <div className="crt-layer crt-tracking" aria-hidden />
      <div className="crt-layer crt-vignette" aria-hidden />
    </>
  );
}
