import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ensureAgencyOrganization,
  ensureDbUser,
} from "@/lib/auth/session";
import { createSiteFromCommand } from "@/lib/build/create-site";

const BodySchema = z.object({
  command: z.string().min(8).max(2000),
});

export async function POST(request: Request) {
  const user = await ensureDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const organization = await ensureAgencyOrganization(
    user.id,
    user.name ? `${user.name}'s Agency` : "My Agency",
  );

  const site = await createSiteFromCommand({
    organizationId: organization.id,
    command: parsed.data.command,
  });

  return NextResponse.json({
    site: {
      id: site.id,
      name: site.name,
      slug: site.slug,
      pageCount: site.pages.length,
    },
  });
}
