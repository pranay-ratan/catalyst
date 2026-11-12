"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/format";

export function CountUp({ value, digits = 0 }: { value: number; digits?: number }) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current;
    let frame = 0;
    let cancelled = false;
    const begin = (now: number) => {
      if (cancelled) return;
      if (reduce) {
        fromRef.current = value;
        setDisplay(value);
        return;
      }
      const progress = Math.min(1, (now - started) / 850);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(from + (value - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(begin);
      else fromRef.current = value;
    };
    const started = performance.now();
    frame = requestAnimationFrame(begin);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span className="inline-grid tabular-nums">
      <span className="invisible col-start-1 row-start-1">{formatNumber(value, digits)}</span>
      <span className="col-start-1 row-start-1">{formatNumber(display, digits)}</span>
    </span>
  );
}

export function Cubic({ value, digits = 0 }: { value: number; digits?: number }) {
  return (
    <span className="tabular-nums">
      <CountUp value={value} digits={digits} />
      {" m"}
      <sup>3</sup>
    </span>
  );
}

export function Money({ value }: { value: number }) {
  return (
    <span className="tabular-nums">
      US$
      <CountUp value={value} digits={2} />
    </span>
  );
}
