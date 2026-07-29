import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * Ensure the signed-in Clerk user exists in our database.
 */
export async function ensureDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) return null;

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    null;

  return prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    create: {
      clerkId: clerkUser.id,
      email,
      name,
    },
    update: {
      email,
      name,
    },
    include: {
      agencyMemberships: {
        include: { organization: true },
      },
      siteMemberships: {
        include: { site: true },
      },
    },
  });
}

/**
 * Get or create a default agency org for this user (first-run bootstrap).
 */
export async function ensureAgencyOrganization(userId: string, preferredName?: string) {
  const existing = await prisma.agencyMember.findFirst({
    where: { userId },
    include: { organization: true },
  });
  if (existing) return existing.organization;

  const base = (preferredName || "My Agency")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);

  let slug = base || "agency";
  let n = 0;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }

  return prisma.organization.create({
    data: {
      name: preferredName || "My Agency",
      slug,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });
}
