import { ImageResponse } from "next/og";

export const runtime = "edge";

type Parameters = {
  title?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parameters: Parameters = Object.fromEntries(searchParams);
    const { title } = parameters;

    return new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px",
          backgroundColor: "#0e1417",
          color: "#e7eef0",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: "20px",
            letterSpacing: "0.18em",
            color: "#5fb0b3",
            textTransform: "uppercase",
          }}
        >
          johnrayloh.com
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {title && (
            <div
              style={{
                display: "flex",
                fontSize: "64px",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "#f1f5f6",
              }}
            >
              {title}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: "22px",
              color: "#9aa9ad",
              letterSpacing: "-0.005em",
            }}
          >
            John Ray Loh — researcher and builder, Singapore.
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 600,
      },
    );
  } catch {
    return new Response("Failed to generate the image", { status: 500 });
  }
}
