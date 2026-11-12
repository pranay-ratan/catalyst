import type { Status } from "@/lib/types";

const PIXELS = { sm: 32, md: 64, lg: 220 } as const;

export function Seal({
  size = "md",
  status = "verified",
  animated = false,
  decorative = false,
}: {
  size?: keyof typeof PIXELS;
  status?: Status;
  animated?: boolean;
  decorative?: boolean;
}) {
  const pixels = PIXELS[size];
  const withheld = status === "withheld";
  const ring = withheld ? "#8E9896" : "#0E7B6D";
  const drop = withheld ? "#C5CDD0" : "#4A9BE8";
  const dropStroke = withheld ? "#8E9896" : "#1F5FA8";
  const wave = withheld ? "#8E9896" : "#0E7B6D";
  const label =
    status === "verified"
      ? "ClearThread verified seal"
      : status === "review"
        ? "ClearThread seal, under review"
        : "ClearThread seal withheld";

  return (
    <svg
      width={pixels}
      height={pixels}
      viewBox="0 0 220 220"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
    >
      <circle cx="110" cy="110" r="102" fill="#FFFFFF" />
      <circle cx="110" cy="110" r="98" fill="none" stroke={ring} strokeWidth="8" />
      <g className={animated && !withheld ? "seal-spin" : undefined}>
        <circle cx="110" cy="110" r="84" fill="none" stroke={ring} strokeWidth="2.5" strokeDasharray="7 9" />
      </g>
      <path
        d="M110 62C110 62 72 108 72 134C72 156 89 170 110 170C131 170 148 156 148 134C148 108 110 62 110 62Z"
        fill={drop}
        stroke={dropStroke}
        strokeWidth="4"
      />
      <path d="M84 122C96 110 104 134 116 122C128 110 136 134 148 122" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <path d="M84 136C96 148 104 124 116 136C128 148 136 124 148 136" fill="none" stroke={wave} strokeWidth="4" strokeLinecap="round" />
      {withheld ? <path d="M48 172L172 48" stroke="#6E7876" strokeWidth="10" strokeLinecap="round" /> : null}
    </svg>
  );
}
