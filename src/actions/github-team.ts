"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ORG_NAME = "University-of-Law-Computer-Science";

export async function checkTeamMembership(userId: string) {
  const session = await auth();

  // Basic security: only allow self-check or staff check
  const isSelf = session?.user?.id === userId;
  const isStaff = session?.user?.role === "staff";

  if (!session || (!isSelf && !isStaff)) {
    return { error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: true,
      cohort: true,
    },
  });

  if (!user || !user.cohort?.githubTeamSlug) {
    return { error: "User or cohort configuration missing" };
  }

  const githubAccount = user.accounts.find(
    (act: any) => act.provider === "github",
  );
  if (!githubAccount?.access_token)
    return { error: "GitHub account not linked" };

  const teamSlug = user.cohort.githubTeamSlug;

  try {
    // Check team membership
    // Endpoint: GET /orgs/{org}/teams/{team_slug}/memberships/{username}
    const username = user.githubUsername || githubAccount.providerAccountId; // Use what we have, ideally username

    // We need the username, if we don't have it stored properly, we might need to fetch it or rely on providerAccountId if using ID-based endpoints (GitHub API handles slugs/names usually)
    // Actually, membership endpoint requires username.

    // Let's ensure we have a username. If not in DB, use session profile name or fetch standard
    let targetUsername = user.githubUsername;
    if (!targetUsername) {
      // Fallback fetch user if missing
      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${githubAccount.access_token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        targetUsername = userData.login;
      }
    }

    if (!targetUsername)
      return { error: "Could not determine GitHub username" };

    const url = `https://api.github.com/orgs/${ORG_NAME}/teams/${teamSlug}/memberships/${username}`;
    console.log(`Checking Team Membership: ${url}`);

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${githubAccount.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`Team Membership Status for ${username}: ${data.state}`);
      const active = data.state === "active";
      return { success: true, isMember: active };
    } else if (res.status === 404) {
      console.warn(
        `Team Membership Not Found (404) for ${username} in ${teamSlug}. Team might not exist or user not a member.`,
      );
      return { success: true, isMember: false };
    } else {
      console.error("GitHub Team check failed:", res.status, await res.text());
      return { error: `GitHub API Error: ${res.status}` };
    }
  } catch (err) {
    console.error("Error checking GitHub team:", err);
    return { error: "Internal Server Error" };
  }
}
