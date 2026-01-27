import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (session?.user?.role !== "staff") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const students = await prisma.user.findMany({
    where: { role: "student" },
    include: {
      onboardingStatus: true,
      cohort: true,
    },
    orderBy: { email: "asc" },
  });

  // CSV Header
  const headers = [
    "Name",
    "Email",
    "Cohort",
    "GitHub Verified",
    "Org Member",
    "Docker Confirmed",
    "AWS Enrolled",
    "Last Updated",
  ];

  // CSV Rows
  const rows = students.map((student) => {
    const s = student.onboardingStatus;
    return [
      student.name || "Unknown",
      student.email || "",
      student.cohort?.name || "Unassigned",
      s?.githubVerified ? "Yes" : "No",
      s?.orgJoined ? "Yes" : "No",
      s?.dockerConfirmed ? "Yes" : "No",
      s?.awsEnrolled ? "Yes" : "No",
      s?.updatedAt ? new Date(s.updatedAt).toISOString() : "",
    ]
      .map((field) => `"${field}"`)
      .join(","); // Quote fields to handle commas
  });

  const csvContent = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="onboarding-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
