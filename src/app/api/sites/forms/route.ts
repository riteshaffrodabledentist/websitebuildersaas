import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDbUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const BodySchema = z.object({
  siteId: z.string().min(1),
  title: z.string().min(2).max(160),
  description: z.string().max(1000).optional(),
  kind: z.enum(["PDF", "LINK"]),
  url: z.string().url(),
});

export async function GET(request: Request) {
  const user = await ensureDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const siteId = new URL(request.url).searchParams.get("siteId");
  if (!siteId) {
    return NextResponse.json({ error: "siteId required" }, { status: 400 });
  }

  const forms = await prisma.patientForm.findMany({
    where: { siteId },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ forms });
}

export async function POST(request: Request) {
  const user = await ensureDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid form", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const count = await prisma.patientForm.count({
    where: { siteId: parsed.data.siteId },
  });

  const form = await prisma.patientForm.create({
    data: {
      siteId: parsed.data.siteId,
      title: parsed.data.title,
      description: parsed.data.description,
      kind: parsed.data.kind,
      url: parsed.data.url,
      sortOrder: count,
    },
  });

  return NextResponse.json({ form });
}
