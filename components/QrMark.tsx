"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export function QrMark({ path, size = 160, label }: { path: string; size?: number; label?: string }) {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const next = `${window.location.origin}${normalized}`;
    const frame = requestAnimationFrame(() => setValue(next));
    return () => cancelAnimationFrame(frame);
  }, [path]);

  return (
    <div className="inline-flex flex-col items-center gap-3" style={{ minWidth: size, minHeight: size }}>
      {value ? (
        <QRCodeSVG
          value={value}
          size={size}
          level="Q"
          includeMargin
          bgColor="#FFFFFF"
          fgColor="#13282C"
          aria-label={label ?? "QR code"}
        />
      ) : (
        <div className="rounded-lg bg-mist" style={{ width: size, height: size }} aria-hidden="true" />
      )}
    </div>
  );
}
