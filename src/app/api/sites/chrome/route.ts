import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { ensureDbUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const CreateSchema = z.object({
  siteId: z.string().min(1),
  kind: z.enum(["HEADER", "FOOTER"]),
  name: z.string().min(2).max(80),
  isDefault: z.boolean().default(false),
  config: z.record(z.string(), z.unknown()),
});

export async function GET(request: Request) {
  const user = await ensureDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const siteId = new URL(request.url).searchParams.get("siteId");
  if (!siteId) {
    return NextResponse.json({ error: "siteId required" }, { status: 400 });
  }

  const chrome = await prisma.siteChrome.findMany({
    where: { siteId },
    orderBy: [{ kind: "asc" }, { isDefault: "desc" }, { name: "asc" }],
  });
  return NextResponse.json({ chrome });
}

/** Create an additional header or footer variant (editable for future pages). */
export async function POST(request: Request) {
  const user = await ensureDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = CreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid chrome", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { siteId, kind, name, isDefault, config } = parsed.data;
  const jsonConfig = config as Prisma.InputJsonValue;

  if (isDefault) {
    await prisma.siteChrome.updateMany({
      where: { siteId, kind, isDefault: true },
      data: { isDefault: false },
    });
  }

  const row = await prisma.siteChrome.create({
    data: { siteId, kind, name, isDefault, config: jsonConfig },
  });

  if (isDefault) {
    await prisma.site.update({
      where: { id: siteId },
      data:
        kind === "HEADER"
          ? { headerConfig: jsonConfig }
          : { footerConfig: jsonConfig },
    });
  }

  return NextResponse.json({ chrome: row });
}
