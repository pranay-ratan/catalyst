# ClearThread

A concept product for an independent "clean-water" seal on clothing: brands get a dashboard of treated vs. verified wastewater per dye-mill batch, and shoppers scan a QR code on the garment to see its digital product passport. Built as a student demo for SFU Catalyst 2026.

**Live demo:** https://catalyst-nine-sandy.vercel.app · **Code:** this repo

![ClearThread screenshot](docs/screenshot-passport.png)
<!-- TODO: add docs/screenshot-passport.png (a garment passport page), and docs/screenshot-dashboard.png (company dashboard) -->

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Radix UI · TanStack Table · Recharts · Framer Motion · QR generation and scanning · Vercel

## What's in it
- **Company dashboard** (`/dashboard`): batches, passports, reports, billing and settings, with CSV export.
- **Garment passport** (`/p/[garmentId]`): the shopper-facing page reached from the QR code, showing the garment's batch, mill and verification trail.
- **Scan** (`/scan`): in-browser QR scanner that opens a passport.
- **The standard** (`/standard`): what the seal checks.

## Key results
None to report: this is a demo. All companies, mills, batches and test results are generated in `lib/data.ts`, and nothing here is a real certification.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

No environment variables are needed. Deploys on Vercel with the Next.js preset.
