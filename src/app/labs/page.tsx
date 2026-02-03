import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Eye } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

import { LABS } from "@/lib/labs";

export default async function LabsPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const submissions = await prisma.labSubmission.findMany({
    where: { userId: session.user.id },
  });

  const submissionMap = new Map(submissions.map(s => [s.labSlug, s]));

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-8">My Cloud Labs</h1>
      <div className="rounded-lg border shadow-sm bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-75">Lab Module</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {LABS.map((lab) => {
              const sub = submissionMap.get(lab.id);
              let status = "Not Started";
              let gradeDisplay = "-";
              let feedback = "-";
              let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
              const hasRepo = !!sub?.repoUrl;

              if (sub) {
                if (sub.status === "APPROVED" || sub.status === "graded") {
                  status = "Completed";
                  gradeDisplay = `${sub.grade}%`;
                  feedback = sub.feedback || "Great job!";
                  badgeVariant = "default";
                } else if (sub.status === "PENDING_REVIEW") {
                  status = "Under Review";
                  gradeDisplay = "Pending";
                  feedback = "Your submission is being reviewed by staff.";
                  badgeVariant = "secondary";
                } else if (sub.status === "failed") {
                  status = "Needs Attention";
                  gradeDisplay = "-";
                  feedback = sub.feedback || "Automated tests failed. Please check your repo.";
                  badgeVariant = "destructive";
                } else if (sub.status === "PROVISIONED") {
                  status = "In Progress";
                  gradeDisplay = "-";
                  feedback = "Repo ready. Start working!";
                  badgeVariant = "secondary";
                }
              }

              return (
                <TableRow key={lab.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{lab.title}</span>
                      <span className="text-xs text-muted-foreground font-mono">{lab.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={badgeVariant}>{status}</Badge>
                  </TableCell>
                  <TableCell className="font-bold">{gradeDisplay}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-md truncate" title={feedback}>
                    {feedback}
                  </TableCell>
                  <TableCell className="text-right">
                    {hasRepo && (
                      <div className="flex justify-end gap-2">
                        <Link href={`/labs/${lab.id}/repo`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Eye className="h-4 w-4" />
                            View Repo
                          </Button>
                        </Link>
                        {sub?.repoUrl && (
                          <a href={sub.repoUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
