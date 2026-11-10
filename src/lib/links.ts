/**
 * Builds the absolute passport URL that a garment QR code encodes.
 * Set VITE_PUBLIC_ORIGIN (e.g. https://clearthread.example.com) when the QR
 * must open from a phone; otherwise the current page origin is used.
 */
export function passportPath(batchId: string): string {
  return `/batch/${encodeURIComponent(batchId)}`;
}

export function passportUrl(batchId: string): string {
  const configuredOrigin = import.meta.env.VITE_PUBLIC_ORIGIN as string | undefined;
  const origin =
    configuredOrigin && configuredOrigin.length > 0
      ? configuredOrigin.replace(/\/+$/, '')
      : window.location.origin;
  return `${origin}${passportPath(batchId)}`;
}
