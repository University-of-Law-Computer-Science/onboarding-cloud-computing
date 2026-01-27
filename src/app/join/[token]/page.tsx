import { auth, signIn } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { joinCohort } from "@/actions/cohorts"
import { redirect } from "next/navigation"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export default async function JoinCohortPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const session = await auth()

    // 1. Fetch Cohort by Token
    const cohort = await prisma.cohort.findUnique({
        where: { inviteToken: token, active: true }
    })

    if (!cohort) {
        return (
            <div className="container max-w-md mx-auto py-20">
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive">Invalid Link</CardTitle>
                        <CardDescription>
                            This invite link is invalid or expired. Please contact your lecturer.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    // 2. If not signed in, show Sign In button
    if (!session?.user) {
        return (
            <div className="container max-w-md mx-auto py-20">
                <Card>
                    <CardHeader>
                        <CardTitle>Join {cohort.name}</CardTitle>
                        <CardDescription>
                            Sign in with GitHub to join the <strong>{cohort.name}</strong> cohort.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            action={async () => {
                                "use server"
                                await signIn("github", { redirectTo: `/join/${token}` })
                            }}
                        >
                            <Button className="w-full gap-2" size="lg">
                                Sign in with GitHub <ArrowRight className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // 3. Logic: If already in THIS cohort, redirect.
    if (session.user.cohortId === cohort.id) {
        redirect("/onboarding")
    }

    // 4. Logic: If in ANOTHER cohort, warn or allow switch? 
    // Spec says "automatic", let's ask to confirm join.
    // Also, handle the actual join in a server action.

    return (
        <div className="container max-w-md mx-auto py-20">
            <Card>
                <CardHeader>
                    <CardTitle>Join {cohort.name}</CardTitle>
                    <CardDescription>
                        You are about to join the <strong>{cohort.name}</strong> cohort.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                        <p><strong>GitHub Team:</strong> {cohort.githubTeamSlug}</p>
                        <p className="mt-1">
                            Joining will update your profile and verify your membership in the GitHub team.
                        </p>
                    </div>

                    <form action={async () => {
                        "use server"
                        await joinCohort(token)
                    }}>
                        <Button className="w-full gap-2" size="lg">
                            Confirm & Join Class <CheckCircle2 className="h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
