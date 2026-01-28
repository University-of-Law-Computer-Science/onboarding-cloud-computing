import { NextRequest, NextResponse } from "next/server";
import { getRepoContents } from "@/lib/github-service";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { repoName: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { repoName } = await params;
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";

  try {
    const contents = await getRepoContents(repoName, path);
    return NextResponse.json(contents);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
