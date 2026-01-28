import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repo, status, grade, feedback, secret } = body;

    // 1. Verify Secret
    if (secret !== process.env.GRADING_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Repo Name to identify User and Lab
    // Format: {Cohort}-{Username}-{LabName}
    // Example: 2024-25-jdoe-ccds-lab-01
    // This is tricky if username has hyphens.
    // Alternative: We try to match the repo URL or rely on the fact that we might store the repoUrl in User's labSubmissions?
    // But we don't have the repo url stored yet.

    // Let's try to match by searching for a user whose githubUsername is part of the string?
    // Or we assume a strict format.
    // For now, let's look up the user by githubUsername if we can deduce it, or just store it raw if we can't link it.

    // Better approach: The webhook payload should ideally contain the github_user if available from the workflow context.
    // But standard extraction:
    // parts = repo.split('-')
    // This is unreliable.

    // Let's try to find a User who has a GitHub username that matches a segment of the repo name.
    // This is expensive.

    // Let's assume the payload sends "github_username" from the trigger actor.
    const githubUsername = body.github_username;

    if (!githubUsername) {
      return NextResponse.json({ error: "Missing github_username" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { githubUsername: { equals: githubUsername, mode: "insensitive" } }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Identify Lab from Repo Name
    // Assume repo ends with the lab slug, e.g., "ccds-lab-01"
    // Regex to extract lab slug?
    // Labs are: 01-virtualisation, 02-containers, etc.
    // Let's try to match known lab slugs.
    const knownLabs = [
      "01-virtualisation", "02-containers", "03-cloud-models", "04-architecture",
      "05-distributed-systems", "06-consistency", "07-microservices",
      "08-kubernetes", "09-cicd", "10-observability"
    ];

    const labSlug = knownLabs.find(slug => repo.includes(slug));

    if (!labSlug) {
      return NextResponse.json({ error: "Unknown Lab" }, { status: 400 });
    }

    // 3. Update/Create Submission
    const numericGrade = status === "success" ? (grade || 100) : (grade || 0);
    // If automated tests pass, set to PENDING_REVIEW for admin approval.
    // If failed, we can mark as failed immediately or also pending review if we want to allow manual overrides.
    // For now, let's keep "failed" as is, but "success" -> "PENDING_REVIEW".
    const statusString = status === "success" ? "PENDING_REVIEW" : "failed";

    await prisma.labSubmission.upsert({
      where: {
        userId_labSlug: {
          userId: user.id,
          labSlug: labSlug,
        }
      },
      update: {
        grade: numericGrade,
        status: statusString,
        repoUrl: `https://github.com/${repo}`,
        feedback: feedback || "Autograded via GitHub Actions",
      },
      create: {
        userId: user.id,
        labSlug: labSlug,
        grade: numericGrade,
        status: statusString,
        repoUrl: `https://github.com/${repo}`,
        feedback: feedback || "Autograded via GitHub Actions",
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Autograding webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
