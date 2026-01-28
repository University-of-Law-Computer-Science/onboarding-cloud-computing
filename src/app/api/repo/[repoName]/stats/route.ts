import { NextRequest, NextResponse } from "next/server";
import { getRepoCommits, getRepoIssues, getRepoPulls, getRepoActivity } from "@/lib/github-service";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { repoName: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { repoName } = await params;

  try {
    const [commits, issues, pulls, activity] = await Promise.all([
      getRepoCommits(repoName),
      getRepoIssues(repoName),
      getRepoPulls(repoName),
      getRepoActivity(repoName),
    ]);

    return NextResponse.json({
      commits,
      issues,
      pulls,
      activity,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
