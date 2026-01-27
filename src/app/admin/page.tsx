import { prisma } from "@/lib/prisma"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CohortAssigner } from "@/components/admin/cohort-assigner"
import { ExportButton } from "@/components/admin/export-button"
import { TeamStatus } from "@/components/admin/team-status"

async function getUsers() {
    return await prisma.user.findMany({
        // where: { role: "student" }, // Show all users (staff included) for testing
        include: { onboardingStatus: true },
        orderBy: { email: "asc" },
    })
}

async function getCohorts() {
    return await prisma.cohort.findMany({
        where: { active: true },
        select: { id: true, name: true, githubTeamSlug: true },
        orderBy: { name: "desc" },
    })
}

export default async function AdminDashboard() {
    const [users, cohorts] = await Promise.all([getUsers(), getCohorts()])

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Overview of user onboarding progress ({users.length} users).
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/cohorts">
                        <Button variant="outline" className="gap-2">
                            <Users className="h-4 w-4" /> Manage Cohorts
                        </Button>
                    </Link>
                    <ExportButton />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Cohort</TableHead>
                            <TableHead className="text-center">GitHub</TableHead>
                            <TableHead className="text-center">Org Member</TableHead>
                            <TableHead className="text-center">Docker</TableHead>
                            <TableHead className="text-center">AWS</TableHead>
                            <TableHead className="text-right">Progress</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user: any) => {
                                const s = user.onboardingStatus
                                const github = s?.githubVerified
                                const org = s?.orgJoined
                                const docker = s?.dockerConfirmed
                                const aws = s?.awsEnrolled

                                // Calculate rough percentage
                                const steps = [github, org, docker, aws]
                                const completed = steps.filter(Boolean).length
                                const percent = Math.round((completed / 4) * 100)

                                return (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {user.name || "Unknown"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === "staff" ? "default" : "secondary"}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <CohortAssigner
                                                userId={user.id}
                                                currentCohortId={user.cohortId}
                                                cohorts={cohorts}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col gap-1 items-center">
                                                <StatusIcon status={github} />
                                                {user.cohortId && (
                                                    <TeamStatus
                                                        userId={user.id}
                                                        teamSlug={cohorts.find((c: any) => c.id === user.cohortId)?.githubTeamSlug || ""}
                                                    />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <StatusIcon status={org} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <StatusIcon status={docker} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <StatusIcon status={aws} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={percent === 100 ? "default" : "secondary"}>
                                                {percent}%
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function StatusIcon({ status }: { status?: boolean }) {
    if (status) return <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
    return <Circle className="h-5 w-5 text-muted-foreground/30 mx-auto" />
}
