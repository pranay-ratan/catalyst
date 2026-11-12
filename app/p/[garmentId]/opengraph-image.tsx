import { ImageResponse } from "next/og";
import { getGarment, getBatch } from "@/lib/data";
import { presentBatch } from "@/lib/present";

export const alt = "ClearThread garment passport";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ garmentId: string }> }) {
  const { garmentId } = await params;
  const garment = getGarment(decodeURIComponent(garmentId));
  const batch = garment ? getBatch(garment.batchIds[0] ?? "") : undefined;
  const status = batch ? presentBatch(batch, []).status : "withheld";
  const label = status === "verified" ? "Verified" : status === "review" ? "Under review" : "Withheld";
  const pill = status === "verified" ? "#0E7B6D" : status === "review" ? "#F2B94B" : "#B0275F";
  const ink = status === "review" ? "#13282C" : "#FFFFFF";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#F7F4EC",
          padding: 64,
          alignItems: "center",
          gap: 48,
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 110,
            background: "#FFFFFF",
            border: status === "withheld" ? "10px solid #8E9896" : "10px solid #0E7B6D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 70,
              height: 96,
              background: status === "withheld" ? "#C5CDD0" : "#4A9BE8",
              borderRadius: 40,
              border: "4px solid #1F5FA8",
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 28, color: "#0E7B6D", fontWeight: 700 }}>ClearThread</div>
          <div style={{ fontSize: 64, color: "#13282C", fontWeight: 800, marginTop: 12, lineHeight: 1.05 }}>
            {garment?.name ?? "Garment passport"}
          </div>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              alignSelf: "flex-start",
              background: pill,
              color: ink,
              borderRadius: 999,
              padding: "10px 18px",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {label}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
