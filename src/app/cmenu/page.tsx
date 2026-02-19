"use client";

import { CompassMenu } from "@/components/compass-menu";

const GLACIER = "#f8fafc";
const DEEP_BLUE = "#0c1e3d";

export default function CircleMenuPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: GLACIER,
        fontFamily: "'Inter', -apple-system, sans-serif",
        gap: 20,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            color: DEEP_BLUE,
            fontSize: 13,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            margin: 0,
            opacity: 0.45,
          }}
        >
          Ascenta Navigator
        </h1>
      </div>
      <CompassMenu size={1160} />
    </div>
  );
}
