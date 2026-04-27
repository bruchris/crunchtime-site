import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d10",
          borderRadius: "36px"
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "9999px",
            background: "#f59e0b"
          }}
        />
      </div>
    ),
    size
  );
}
