"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approveSubmission(
  submissionId: string,
  data?: { grade?: number; feedback?: string }
) {
  const session = await auth();

  // Verify Admin/Staff
  if (!session || session.user?.role !== "staff") {
    return { error: "Unauthorized" };
  }

  try {
    const updateData: { status: string; grade?: number; feedback?: string } = { status: "APPROVED" };
    if (data?.grade !== undefined) updateData.grade = data.grade;
    if (data?.feedback !== undefined) updateData.feedback = data.feedback;

    const updated = await prisma.labSubmission.update({
      where: { id: submissionId },
      data: updateData,
    });

    revalidatePath("/admin/submissions");
    return { success: true, submission: updated };
  } catch (error) {
    console.error("Failed to approve submission:", error);
    return { error: "Failed to update submission" };
  }
}
