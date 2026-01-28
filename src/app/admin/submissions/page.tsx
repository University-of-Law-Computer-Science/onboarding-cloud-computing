import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GradingDialog } from "@/components/admin/grading-dialog";

export default async function SubmissionsPage() {
  const submissions = await prisma.labSubmission.findMany({
    include: {
      user: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Lab Submissions</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Lab</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Repo</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No submissions yet.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{sub.user.name || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">{sub.user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{sub.labSlug}</TableCell>
                  <TableCell>
                    <Badge variant={
                      sub.status === "APPROVED" || sub.status === "graded" ? "default" :
                        sub.status === "PENDING_REVIEW" ? "secondary" : "destructive"
                    }>
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{sub.grade}%</TableCell>
                  <TableCell>
                    {sub.repoUrl ? (
                      <a
                        href={sub.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Code
                      </a>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    {sub.status === "PENDING_REVIEW" ? (
                      <GradingDialog
                        submissionId={sub.id}
                        currentGrade={sub.grade}
                        currentFeedback={sub.feedback}
                      />
                    ) : (
                      <GradingDialog
                        submissionId={sub.id}
                        currentGrade={sub.grade}
                        currentFeedback={sub.feedback}
                        triggerLabel="Edit"
                        variant="ghost"
                      />
                    )}
                  </TableCell>
                  <TableCell>{sub.updatedAt.toLocaleDateString()} {sub.updatedAt.toLocaleTimeString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
