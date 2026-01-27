import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, ExternalLink, RefreshCw } from "lucide-react"
import { verifyGithub } from "@/actions/onboarding"
import { redirect } from "next/navigation"

const ORG_NAME = "University-of-Law-Computer-Science";

export default async function GithubOnboardingPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/")

    const status = await prisma.onboardingStatus.findUnique({
        where: { userId: session.user.id },
    })

    const user = session.user

    // Check if fully verified to redirect or show success
    if (status?.githubVerified && status?.orgJoined) {
        redirect("/onboarding")
    }

    const isEmailValid = status?.githubVerified
    const isOrgMember = status?.orgJoined

    // Server Action wrapper for the form
    async function handleRecheck() {
        "use server"
        await verifyGithub()
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">GitHub Verification</h1>
                <p className="text-muted-foreground mt-2">
                    We need to verify your university identity and organization membership.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Verification Steps</CardTitle>
                    <CardDescription>Click "Check Status" to verify progress.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Email Check */}
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                        {isEmailValid ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5" />
                        ) : (
                            <XCircle className="h-6 w-6 text-destructive mt-0.5" />
                        )}
                        <div className="space-y-1">
                            <h3 className="font-medium">University Email Address</h3>
                            {isEmailValid ? (
                                <p className="text-sm text-green-600">Verified: {user.email}</p>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Your GitHub email must end with <strong>@law.ac.uk</strong>.
                                    </p>
                                    <p className="text-sm text-destructive">
                                        Current email: {user.email || "Not found"}
                                    </p>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href="https://github.com/settings/emails" target="_blank" rel="noreferrer">
                                            Manage GitHub Emails <ExternalLink className="h-3 w-3 ml-2" />
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Org Check */}
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                        {isOrgMember ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5" />
                        ) : (
                            <XCircle className="h-6 w-6 text-destructive mt-0.5" />
                        )}
                        <div className="space-y-1">
                            <h3 className="font-medium">Organization Membership</h3>
                            {isOrgMember ? (
                                <p className="text-sm text-green-600">You are a member of {ORG_NAME}</p>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        You must check your membership in the <strong>{ORG_NAME}</strong> organization.
                                    </p>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={`https://github.com/orgs/${ORG_NAME}`} target="_blank" rel="noreferrer">
                                            Go to Organization <ExternalLink className="h-3 w-3 ml-2" />
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <form action={handleRecheck} className="pt-4">
                        <Button size="lg" className="w-full sm:w-auto gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Check Status
                        </Button>
                    </form>

                </CardContent>
            </Card>
        </div>
    )
}
