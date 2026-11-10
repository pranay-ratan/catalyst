# ClearThread (hackathon demo)

Demo of a dye-house wastewater seal. Shoppers scan a garment tag QR code and see how the water behind it was treated. Brands see all their batches on a dashboard.

**Demo data only. Not real test results.** Every brand, mill, lab and number is fictional. ClearThread is a student concept and not an official certification.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build and test

```bash
npm run build      # tsc + vite build -> dist/
npm test           # vitest: status logic and seal-visibility rules
npm run preview    # serve dist/ on http://localhost:4173
```

## Deploy (static)

`dist/` is a static site. For client-side routes (`/batch/:id`) the host must serve `index.html` for unknown paths: `public/_redirects` covers Netlify, `vercel.json` covers Vercel.

QR codes encode the full passport URL. Set the public origin before building so tags print the deployed address:

```bash
VITE_PUBLIC_ORIGIN=https://your-deployed-host.example npm run build
```

Without it, QR codes use the current page origin (fine on a deployed host, not reachable from a phone on `localhost`).

## Layout

- `src/data/batches.ts`: seed data, 8 batches (5 verified, 2 under review, 1 withheld)
- `src/types.ts`: `Batch` model
- `src/lib/status.ts`: status, seal visibility, filters, counts, reuse percent
- `src/lib/status.test.ts`: unit tests
- `src/lib/links.ts`: passport path and QR URL
- `src/components/`: `Seal` (3 sizes), `StatusBadge` (text + icon), `Layout` (demo banner, nav, footer), `QrTag`
- `src/pages/`: `Home`, `BatchPassport` (`/batch/:id`), `Dashboard`, `Standards`
