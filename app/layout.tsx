import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { Providers } from "@/lib/store";
import { DEMO_BANNER, DEMO_FOOTER } from "@/lib/brand";
import "./globals.css";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

function siteUrl(): URL | undefined {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (!host) return undefined;
  try {
    return new URL(host.startsWith("http") ? host : `https://${host}`);
  } catch {
    return undefined;
  }
}

const base = siteUrl();

export const metadata: Metadata = {
  ...(base ? { metadataBase: base } : {}),
  title: { default: "ClearThread", template: "%s · ClearThread" },
  description: "Verified clean water, on every label. A student concept from SFU Catalyst 2026.",
  robots: { index: false, follow: false },
  applicationName: "ClearThread",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F4EC",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-dvh flex-col overflow-x-clip bg-paper text-body">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:text-ink"
        >
          Skip to content
        </a>
        <Providers>
          <p className="no-print sticky top-0 z-50 bg-ink px-4 py-2 text-center text-base text-white" role="note">
            {DEMO_BANNER}
          </p>
          <div id="content" className="flex-1">
            {children}
          </div>
          <footer className="no-print border-t border-line px-4 py-6 text-center text-base text-body">
            <p>{DEMO_FOOTER}</p>
            <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
              <Link href="/standard" className="min-h-11 inline-flex items-center font-semibold text-teal underline-offset-4 hover:underline">
                Standard
              </Link>
              <Link href="/dashboard" className="min-h-11 inline-flex items-center font-semibold text-teal underline-offset-4 hover:underline">
                Dashboard
              </Link>
              <Link href="/scan" className="min-h-11 inline-flex items-center font-semibold text-teal underline-offset-4 hover:underline">
                Scan
              </Link>
              <Link href="/demo" className="min-h-11 inline-flex items-center font-semibold text-teal underline-offset-4 hover:underline">
                Presenter mode
              </Link>
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
