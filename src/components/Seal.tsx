import { useId } from 'react';

export type SealSize = 'sm' | 'md' | 'lg';

const SEAL_PIXELS: Record<SealSize, number> = { sm: 48, md: 96, lg: 160 };

interface SealProps {
  size?: SealSize;
  /** Decorative by default; pass a label when the seal stands alone as information. */
  label?: string;
}

/**
 * ClearThread seal: ring, water drop, two woven wave lines and ring text.
 * This is a demo mark, not a certification logo.
 */
export function Seal({ size = 'md', label }: SealProps) {
  const pixels = SEAL_PIXELS[size];
  const ringPathId = `seal-ring-${useId().replace(/:/g, '')}`;
  const accessibleProps = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const, focusable: false as const };

  return (
    <svg
      viewBox="0 0 100 100"
      width={pixels}
      height={pixels}
      xmlns="http://www.w3.org/2000/svg"
      data-testid="seal"
      data-size={size}
      {...accessibleProps}
    >
      <defs>
        <path id={ringPathId} d="M50,50 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0" />
      </defs>
      <circle cx="50" cy="50" r="48" fill="#1B2459" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#5FD3C4" strokeWidth="1.2" />
      <text fill="#F5F1E8" fontFamily="DM Sans, sans-serif" fontSize="8.5" fontWeight="700" letterSpacing="2.4">
        <textPath href={`#${ringPathId}`} startOffset="0%">
          CLEARTHREAD
        </textPath>
      </text>
      <path
        d="M50 24 C50 24 31 46 31 61 A19 19 0 0 0 69 61 C69 46 50 24 50 24 Z"
        fill="#1E9C8E"
      />
      <path
        d="M37 58 Q41 54 45 58 T53 58 T61 58 T65 58"
        fill="none"
        stroke="#F5F1E8"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M38 66 Q42 62 46 66 T54 66 T62 66"
        fill="none"
        stroke="#F5F1E8"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
