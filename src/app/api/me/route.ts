import { NextResponse } from "next/server";
import {
  ensureAgencyOrganization,
  ensureDbUser,
} from "@/lib/auth/session";

export async function GET() {
  const user = await ensureDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organization = await ensureAgencyOrganization(
    user.id,
    user.name ? `${user.name}'s Agency` : "My Agency",
  );

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    },
    agencyMemberships: user.agencyMemberships.map((m) => ({
      role: m.role,
      organizationId: m.organizationId,
      organizationName: m.organization.name,
    })),
    siteMemberships: user.siteMemberships.map((m) => ({
      role: m.role,
      siteId: m.siteId,
      siteName: m.site.name,
      status: m.status,
    })),
  });
}
