import { NextResponse } from "next/server";
import {
  ensureAgencyOrganization,
  ensureDbUser,
} from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await ensureDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organization = await ensureAgencyOrganization(
    user.id,
    user.name ? `${user.name}'s Agency` : "My Agency",
  );

  const sites = await prisma.site.findMany({
    where: { organizationId: organization.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { pages: true, posts: true, members: true } },
    },
  });

  return NextResponse.json({
    organizationId: organization.id,
    sites: sites.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      practiceName: s.practiceName,
      city: s.city,
      state: s.state,
      pageCount: s._count.pages,
      postCount: s._count.posts,
      memberCount: s._count.members,
      lastPublishedAt: s.lastPublishedAt,
      updatedAt: s.updatedAt,
    })),
  });
}
