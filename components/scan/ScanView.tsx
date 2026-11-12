"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { IDetectedBarcode, IScannerError } from "@yudiel/react-qr-scanner";
import { PageFrame } from "@/components/PageFrame";
import { Button } from "@/components/ui/button";
import { garmentIdFromScan } from "@/lib/csv";
import { DEMO_CYCLE, HERO_GARMENT_ID, REVIEW_GARMENT_ID, WITHHELD_GARMENT_ID } from "@/lib/ids";

const Scanner = dynamic(() => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner), { ssr: false });

const QUICK = [
  { id: HERO_GARMENT_ID, label: "Navy T-shirt, verified" },
  { id: REVIEW_GARMENT_ID, label: "Sage shirt, under review" },
  { id: WITHHELD_GARMENT_ID, label: "Rose dress, withheld" },
];

export function ScanView() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");
  const [manual, setManual] = useState("");
  const lock = useRef(false);

  function openId(id: string) {
    if (lock.current) return;
    lock.current = true;
    try {
      navigator.vibrate?.(40);
    } catch {
      // Some browsers block vibration. Routing still continues.
    }
    router.push(`/p/${id}`);
  }

  function onScan(codes: IDetectedBarcode[]) {
    const raw = codes[0]?.rawValue ?? "";
    const id = garmentIdFromScan(raw);
    if (!id) {
      setError("This QR is not a ClearThread garment tag.");
      return;
    }
    if (!DEMO_CYCLE.includes(id as (typeof DEMO_CYCLE)[number]) && !id.startsWith("CT-")) {
      setError("This QR is not a ClearThread garment tag.");
      return;
    }
    openId(id);
  }

  function onError(scannerError: IScannerError) {
    if (scannerError.kind === "permission-denied" || scannerError.kind === "security") {
      setError("Camera access is off. Allow the camera in your browser settings, or type the garment ID below.");
      return;
    }
    if (scannerError.kind === "insecure-context") {
      setError("The scanner needs HTTPS. Open this page from the deployed site, or type a garment ID.");
      return;
    }
    if (scannerError.kind === "no-camera") {
      setError("No camera was found. Type the garment ID below.");
      return;
    }
    setError("The camera could not start. Type the garment ID below.");
  }

  return (
    <PageFrame>
      <div className="mx-auto flex min-h-full max-w-lg flex-col px-5 py-8">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">Scan a garment</h1>
        <p className="mt-3 text-base text-body">Point the camera at a ClearThread tag. You can also type the ID.</p>
        <div className="relative mt-6 aspect-square w-full overflow-hidden rounded-3xl bg-ink">
          {started ? (
            <Scanner
              onScan={onScan}
              onError={onError}
              formats={["qr_code"]}
              constraints={{ facingMode: "environment" }}
              components={{ finder: true, torch: true }}
              sound={false}
              styles={{ container: { width: "100%", height: "100%" }, video: { width: "100%", height: "100%", objectFit: "cover" } }}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-white">
              <p>The viewfinder opens when you start the camera.</p>
              <Button onClick={() => setStarted(true)}>Start camera</Button>
            </div>
          )}
          <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/80" aria-hidden="true" />
        </div>
        {error ? (
          <p className="mt-4 rounded-2xl bg-white p-4 text-base text-ink" role="alert">
            {error}
          </p>
        ) : null}
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            const id = garmentIdFromScan(manual);
            if (!id) {
              setError("Enter a ClearThread garment ID, such as CT-A2381-0001.");
              return;
            }
            openId(id);
          }}
        >
          <label htmlFor="garment-id" className="block font-semibold text-ink">
            Garment ID
            <input
              id="garment-id"
              value={manual}
              onChange={(event) => setManual(event.target.value)}
              placeholder="CT-A2381-0001"
              className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-base font-normal text-ink"
            />
          </label>
          <Button type="submit" className="mt-3 w-full" variant="secondary">
            Open passport
          </Button>
        </form>
        <div className="mt-6 grid gap-2">
          {QUICK.map((item) => (
            <button key={item.id} type="button" className="min-h-11 rounded-xl text-left font-semibold text-teal underline-offset-4 hover:underline" onClick={() => openId(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </PageFrame>
  );
}
