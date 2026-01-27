"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const REQUIRED_DOMAIN = "law.ac.uk";
const REQUIRED_ORG = "University-of-Law-Computer-Science";

export async function verifyGithub() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: true },
  });

  if (!user) return { error: "User not found" };

  // 1. Check Email Domain
  // This is a loose check. Ideally we check 'emailVerified' from GitHub API if strictness is needed.
  // For now, checks the primary email stored in User.
  const email = user.email || "";
  const isEmailValid = email.endsWith(`@${REQUIRED_DOMAIN}`);

  // 2. Check Org Membership
  const githubAccount = user.accounts.find(
    (act: any) => act.provider === "github",
  );
  if (!githubAccount?.access_token)
    return { error: "GitHub account not linked or missing token" };

  let isOrgMember = false;
  try {
    const res = await fetch(
      `https://api.github.com/user/memberships/orgs/${REQUIRED_ORG}`,
      {
        headers: {
          Authorization: `Bearer ${githubAccount.access_token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (res.ok) {
      const data = await res.json();
      isOrgMember = data.state === "active";
    } else {
      // If 404/403, not a member
      console.error("GitHub Org check failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Error checking GitHub membership:", err);
  }

  // Update DB
  await prisma.onboardingStatus.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      githubVerified: isEmailValid,
      orgJoined: isOrgMember,
    },
    update: {
      githubVerified: isEmailValid,
      orgJoined: isOrgMember,
    },
  });

  revalidatePath("/onboarding");
  revalidatePath("/onboarding/github");

  return {
    success: true,
    isEmailValid,
    isOrgMember,
    email, // Return for UI feedback
  };
}

export async function confirmDocker() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.onboardingStatus.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      dockerConfirmed: true,
    },
    update: {
      dockerConfirmed: true,
    },
  });

  revalidatePath("/onboarding");
  return { success: true };
}

export async function confirmAws() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.onboardingStatus.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      awsEnrolled: true,
    },
    update: {
      awsEnrolled: true,
    },
  });

  revalidatePath("/onboarding");
  return { success: true };
}
