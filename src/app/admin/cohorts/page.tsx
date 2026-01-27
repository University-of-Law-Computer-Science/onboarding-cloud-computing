import { prisma } from "@/lib/prisma"
import { Cohort } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Power, PowerOff } from "lucide-react"
import Link from "next/link"
import { toggleCohortStatus } from "@/actions/cohorts"
import { CopyInvite } from "@/components/admin/copy-invite"
import { SyncTeamButton } from "@/components/admin/sync-team-button"

async function getCohorts() {
    return await prisma.cohort.findMany({
        include: {
            _count: {
                select: { users: true },
            },
        },
        orderBy: { name: "desc" },
    })
}

export default async function CohortsPage() {
    const cohorts = await getCohorts()

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cohorts</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage academic cohorts and resource links.
                    </p>
                </div>
                <Link href="/admin/cohorts/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Create Cohort
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>GitHub Team</TableHead>
                            <TableHead>AWS Link</TableHead>
                            <TableHead className="text-center">Invite</TableHead>
                            <TableHead className="text-center">Students</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cohorts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No cohorts found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            cohorts.map((cohort: Cohort & { _count: { users: number } }) => (
                                <TableRow key={cohort.id} className={!cohort.active ? "opacity-60 bg-muted/50" : ""}>
                                    <TableCell className="font-medium">{cohort.name}</TableCell>
                                    <TableCell className="font-mono text-xs">{cohort.githubTeamSlug}</TableCell>
                                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                        {cohort.awsAcademyLink}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <CopyInvite token={cohort.inviteToken} />
                                    </TableCell>
                                    <TableCell className="text-center">{cohort._count.users}</TableCell>
                                    <TableCell className="text-center">
                                        {cohort.active ? (
                                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">Active</Badge>
                                        ) : (
                                            <Badge variant="secondary">Archived</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right flex justify-end gap-1">
                                        <SyncTeamButton cohortId={cohort.id} />
                                        <form
                                            action={async () => {
                                                "use server"
                                                await toggleCohortStatus(cohort.id, cohort.active)
                                            }}
                                        >
                                            <Button variant="ghost" size="icon" title={cohort.active ? "Archive" : "Activate"}>
                                                {cohort.active ? (
                                                    <Power className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                ) : (
                                                    <PowerOff className="h-4 w-4 text-muted-foreground hover:text-green-600" />
                                                )}
                                            </Button>
                                        </form>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
