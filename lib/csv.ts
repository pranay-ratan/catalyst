export function downloadText(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function escapeCell(value: string | number): string {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map((cell) => escapeCell(cell)).join(",")).join("\n");
  downloadText(filename, csv, "text/csv;charset=utf-8");
}

export function downloadJson(filename: string, value: unknown) {
  downloadText(filename, JSON.stringify(value, null, 2), "application/json");
}

export function garmentIdFromScan(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  try {
    const url = new URL(text);
    const match = url.pathname.match(/\/p\/([^/]+)\/?$/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  } catch {
    // Plain garment ids are handled below.
  }
  if (/^CT-[A-Za-z0-9-]+$/.test(text)) return text;
  return null;
}
