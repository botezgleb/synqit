"use client";

import { useEffect, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$%^&!?";

interface ScrambleTextProps {
  text: string;
  speed?: number;
}

export function ScrambleText({
  text,
  speed = 40,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let frame = 0;

    const interval = setInterval(() => {
      const output = text
        .split("")
        .map((char, index) => {
          if (index < frame) {
            return char;
          }

          return CHARS[
            Math.floor(Math.random() * CHARS.length)
          ];
        })
        .join("");

      setDisplayText(output);

      frame += 0.25;

      if (frame >= text.length) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayText}</span>;
}