"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkOrgMembership } from "@/lib/github-admin";

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
  const email = user.email || "";
  const isEmailValid = email.endsWith(`@${REQUIRED_DOMAIN}`);

  // 2. Check Org Membership with more detail
  const githubUsername = user.githubUsername;
  let membershipStatus = "none";

  if (githubUsername) {
    const res = await checkOrgMembership(githubUsername);
    membershipStatus = res.status;
  }

  const isOrgMember = membershipStatus === "active";

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
    membershipStatus,
    email,
  };
}

export async function inviteMeAction() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return { error: "Not authenticated" };

  const { inviteUserToOrg } = await import("@/lib/github-admin");
  const res = await inviteUserToOrg(session.user.email);

  if (res.error) return { error: res.error };
  
  revalidatePath("/onboarding/github");
  return { success: true };
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
