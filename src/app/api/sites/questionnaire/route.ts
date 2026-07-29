import { NextResponse } from "next/server";
import {
  ensureAgencyOrganization,
  ensureDbUser,
} from "@/lib/auth/session";
import { createSiteFromQuestionnaire } from "@/lib/build/create-site";
import { SiteQuestionnaireSchema } from "@/lib/build/questionnaire";

export async function POST(request: Request) {
  const user = await ensureDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = SiteQuestionnaireSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please complete required fields", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const organization = await ensureAgencyOrganization(
    user.id,
    user.name ? `${user.name}'s Agency` : "My Agency",
  );

  const site = await createSiteFromQuestionnaire({
    organizationId: organization.id,
    answers: parsed.data,
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
