import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          background: "#FFFFFF",
          border: "3px solid #0E7B6D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 10,
            height: 14,
            background: "#4A9BE8",
            borderRadius: 8,
            border: "1px solid #1F5FA8",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
