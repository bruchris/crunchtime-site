import { ImageResponse } from "next/og";

export const alt = "AI Agent Consulting for Norwegian SMBs · Crunchtime";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0b0d10",
          color: "#e7ecf1",
          fontFamily: "system-ui, sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "9999px",
              background: "#f59e0b"
            }}
          />
          <span style={{ fontSize: "32px", fontWeight: 600, letterSpacing: "-0.02em" }}>
            Crunchtime
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <p
            style={{
              margin: 0,
              fontSize: "20px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#f59e0b"
            }}
          >
            Consulting
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: "64px",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: "950px"
            }}
          >
            From proof-of-concept to production AI agent in under a month.
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: "24px", color: "#8a94a0" }}>crunchtime.no/consulting</p>
      </div>
    ),
    size
  );
}
