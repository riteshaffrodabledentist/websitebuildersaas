import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "websitebuildersaas",
    time: new Date().toISOString(),
  });
}
