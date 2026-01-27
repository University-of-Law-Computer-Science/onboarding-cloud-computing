import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ExternalLink, Cloud, AlertCircle } from "lucide-react"
import { confirmAws } from "@/actions/onboarding"
import { redirect } from "next/navigation"

export default async function AwsOnboardingPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/")

    // Fetch user status AND cohort details
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            onboardingStatus: true,
            cohort: true
        }
    })

    if (!user) redirect("/")

    if (user.onboardingStatus?.awsEnrolled) {
        redirect("/onboarding")
    }

    // Determine the link to show
    const academyLink = user.cohort?.awsAcademyLink

    async function handleConfirm() {
        "use server"
        await confirmAws()
        redirect("/onboarding")
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">AWS Academy Enrollment</h1>
                <p className="text-muted-foreground mt-2">
                    Claim your cloud sandbox environment for completing labs.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Enrollment Steps</CardTitle>
                    <CardDescription>Join your cohort's AWS environment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">

                    <div className="space-y-4">
                        {academyLink ? (
                            <>
                                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
                                    <h3 className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-400 mb-2">
                                        <Cloud className="h-4 w-4" />
                                        Cohort Invitation: {user.cohort?.name}
                                    </h3>
                                    <p className="text-sm text-blue-600 dark:text-blue-300 mb-4">
                                        Use the link below to join your specific class section on AWS Academy.
                                    </p>
                                    <Button className="w-full sm:w-auto" asChild>
                                        <a href={academyLink} target="_blank" rel="noreferrer">
                                            Go to AWS Academy Login <ExternalLink className="h-4 w-4 ml-2" />
                                        </a>
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900">
                                <h3 className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400 mb-2">
                                    <AlertCircle className="h-4 w-4" />
                                    No Cohort Assigned
                                </h3>
                                <p className="text-sm text-amber-600 dark:text-amber-300 mb-4">
                                    You have not been assigned to a cohort yet. Please contact your lecturer or administrator to get the correct AWS Academy link.
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Once assigned, refresh this page to see your invitation link.
                                </p>
                            </div>
                        )}
                    </div>

                    <form action={handleConfirm} className="border-t pt-6 space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="confirm" required />
                            <Label htmlFor="confirm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                I have logged into AWS Academy and can access the "Learner Verification" course.
                            </Label>
                        </div>
                        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!academyLink}>
                            Confirm Enrollment
                        </Button>
                    </form>

                </CardContent>
            </Card>
        </div>
    )
}
