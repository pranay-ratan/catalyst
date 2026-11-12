import type { Silhouette } from "@/lib/types";

export function Shirt({ color, silhouette, title }: { color: string; silhouette: Silhouette; title: string }) {
  return (
    <svg viewBox="0 0 160 180" className="h-40 w-36" role="img" aria-label={title}>
      <title>{title}</title>
      {silhouette === "trousers" ? (
        <path
          d="M48 28h64l6 20-8 112H78l-6-70-6 70H42L34 48z"
          fill={color}
          stroke="#13282C"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      ) : silhouette === "dress" ? (
        <path
          d="M48 24l32 14 32-14 28 22-16 16v8l18 92H38l18-92v-8L40 46z"
          fill={color}
          stroke="#13282C"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      ) : silhouette === "jacket" ? (
        <path
          d="M36 34l28-8 16 16 16-16 28 8 14 28-16 12v78H52V74L36 62z M80 42v88"
          fill={color}
          stroke="#13282C"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      ) : silhouette === "hoodie" ? (
        <>
          <path
            d="M42 58l22-10 16 14 16-14 22 10 16 24-14 12v62H40V94L26 82z"
            fill={color}
            stroke="#13282C"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M64 48c0-16 32-16 32 0" fill="none" stroke="#13282C" strokeWidth="3" />
        </>
      ) : (
        <path
          d={
            silhouette === "polo" || silhouette === "shirt"
              ? "M46 30l24 12 10-12h8l10 12 24-12 26 22-16 16-6-4v86H42V64l-6 4-16-16z"
              : "M44 32l28 14 8-8 8 8 28-14 26 22-18 16-4-6v88H40V64l-4 6-18-16z"
          }
          fill={color}
          stroke="#13282C"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
