import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { redirect } from "next/navigation";

const LABS = [
  { id: "01-virtualisation", title: "Lab 1: Virtualisation" },
  { id: "02-containers", title: "Lab 2: Containers" },
  { id: "03-cloud-models", title: "Lab 3: Cloud Models" },
  { id: "04-architecture", title: "Lab 4: Architecture" },
  { id: "05-distributed-systems", title: "Lab 5: Distributed Systems" },
  { id: "06-consistency", title: "Lab 6: Consistency" },
  { id: "07-microservices", title: "Lab 7: Microservices" },
  { id: "08-kubernetes", title: "Lab 8: Kubernetes" },
  { id: "09-cicd", title: "Lab 9: CI/CD" },
  { id: "10-observability", title: "Lab 10: Observability" },
];

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {LABS.map((lab) => {
              const sub = submissionMap.get(lab.id);
              let status = "Not Started";
              let gradeDisplay = "-";
              let feedback = "-";
              let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";

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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
