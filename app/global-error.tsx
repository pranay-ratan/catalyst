"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#F7F4EC", color: "#13282C", fontFamily: "sans-serif" }}>
        <p style={{ margin: 0, background: "#13282C", color: "#fff", textAlign: "center", padding: "8px 16px" }}>
          Demo data: illustrative numbers, not real test results.
        </p>
        <main style={{ maxWidth: 480, margin: "0 auto", padding: "64px 20px", textAlign: "center" }}>
          <h1>Something went wrong</h1>
          <button type="button" onClick={() => reset()} style={{ minHeight: 44, marginTop: 16 }}>
            Try again
          </button>
        </main>
        <p style={{ textAlign: "center", padding: 24 }}>
          ClearThread is a student concept from SFU Catalyst 2026. Not an official certification.
        </p>
      </body>
    </html>
  );
}
