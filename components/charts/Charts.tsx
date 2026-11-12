"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDayLabel, formatNumber } from "@/lib/format";
import type { DailyPoint } from "@/lib/metrics";

function useChartMotion() {
  const [animate, setAnimate] = useState(true);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return animate;
}

function tipStyle() {
  return {
    background: "#ffffff",
    border: "1px solid #D9E2DD",
    borderRadius: 12,
    color: "#13282C",
    fontSize: 16,
  };
}

export function DailyVolumeChart({ data }: { data: DailyPoint[] }) {
  const animate = useChartMotion();
  const rows = data.map((point) => ({ ...point, label: formatDayLabel(point.date) }));
  return (
    <div className="h-72 w-full min-w-0" role="img" aria-label="Daily cubic metres treated and verified">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#D9E2DD" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#3F5357", fontSize: 12 }} interval="preserveStartEnd" minTickGap={24} />
          <YAxis tick={{ fill: "#3F5357", fontSize: 12 }} width={48} />
          <Tooltip
            contentStyle={tipStyle()}
            formatter={(value: number, name: string) => [`${formatNumber(value)} m³`, name === "treated" ? "Treated" : "Verified"]}
          />
          <Legend formatter={(value) => (value === "treated" ? "Treated m³" : "Verified m³")} />
          <Area type="monotone" dataKey="treated" stroke="#4A9BE8" fill="#4A9BE8" fillOpacity={0.2} isAnimationActive={animate} />
          <Area type="monotone" dataKey="verified" stroke="#0E7B6D" fill="#0E7B6D" fillOpacity={0.35} isAnimationActive={animate} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CodChart({ data }: { data: DailyPoint[] }) {
  const animate = useChartMotion();
  const rows = data
    .filter((point) => point.codIn !== null && point.codOut !== null)
    .map((point) => ({ ...point, label: formatDayLabel(point.date) }));
  return (
    <div className="h-72 w-full min-w-0" role="img" aria-label="COD in versus COD out, with the 200 milligram standard">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#D9E2DD" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#3F5357", fontSize: 12 }} interval="preserveStartEnd" minTickGap={24} />
          <YAxis yAxisId="in" tick={{ fill: "#1F5FA8", fontSize: 12 }} width={48} domain={[0, 2400]} />
          <YAxis yAxisId="out" orientation="right" tick={{ fill: "#0E7B6D", fontSize: 12 }} width={40} domain={[0, 320]} />
          <Tooltip contentStyle={tipStyle()} formatter={(value: number) => [`${formatNumber(value)} mg/L`]} />
          <Legend />
          <Line yAxisId="in" type="monotone" dataKey="codIn" name="COD in" stroke="#1F5FA8" dot={false} strokeWidth={2} isAnimationActive={animate} />
          <Bar yAxisId="out" dataKey="codOut" name="COD out" fill="#0E7B6D" radius={[4, 4, 0, 0]} isAnimationActive={animate} />
          <ReferenceLine yAxisId="out" y={200} stroke="#B0275F" strokeDasharray="5 5" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScanChart({ data }: { data: { date: string; scans: number }[] }) {
  const animate = useChartMotion();
  const rows = data.map((point) => ({ ...point, label: formatDayLabel(point.date) }));
  return (
    <div className="h-48 w-full min-w-0" role="img" aria-label="Passport scans by day">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#D9E2DD" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#3F5357", fontSize: 12 }} interval="preserveStartEnd" minTickGap={28} />
          <YAxis tick={{ fill: "#3F5357", fontSize: 12 }} width={36} />
          <Tooltip contentStyle={tipStyle()} formatter={(value: number) => [formatNumber(value), "Scans"]} />
          <Area type="monotone" dataKey="scans" stroke="#1F5FA8" fill="#4A9BE8" fillOpacity={0.25} isAnimationActive={animate} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TraceChart({ trace, threshold = 200 }: { trace: number[]; threshold?: number }) {
  const animate = useChartMotion();
  const rows = trace.map((cod, index) => ({ minute: index + 1, cod }));
  const peak = Math.max(threshold, ...trace);
  return (
    <div className="h-64 w-full min-w-0" role="img" aria-label="COD sensor trace during treatment">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#D9E2DD" vertical={false} />
          <XAxis dataKey="minute" tick={{ fill: "#3F5357", fontSize: 12 }} label={{ value: "Reading", position: "insideBottom", offset: -2, fill: "#3F5357" }} />
          <YAxis tick={{ fill: "#3F5357", fontSize: 12 }} width={48} domain={[0, Math.ceil(peak * 1.08)]} />
          <Tooltip contentStyle={tipStyle()} formatter={(value: number) => [`${formatNumber(value)} mg/L`, "COD"]} />
          <ReferenceLine y={threshold} stroke="#B0275F" strokeDasharray="5 5" />
          <Line type="monotone" dataKey="cod" stroke="#1F5FA8" strokeWidth={2.5} dot={false} isAnimationActive={animate} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
