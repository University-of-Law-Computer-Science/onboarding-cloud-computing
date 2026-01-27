import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, Circle, ArrowRight } from "lucide-react"

async function getOnboardingStatus(userId: string) {
    const status = await prisma.onboardingStatus.findUnique({
        where: { userId },
    })

    // If no status exists, create initial record
    if (!status) {
        return await prisma.onboardingStatus.create({
            data: { userId },
        })
    }

    return status
}

export default async function OnboardingDashboard() {
    const session = await auth()

    // Should be handled by layout, but for type safety
    if (!session?.user?.id) return null

    const status = await getOnboardingStatus(session.user.id)

    const steps = [
        {
            id: "github",
            title: "GitHub Verification",
            description: "Verify email and join organization",
            completed: status.githubVerified && status.orgJoined,
            href: "/onboarding/github",
        },
        {
            id: "docker",
            title: "Docker Installation",
            description: "Confirm local development setup",
            completed: status.dockerConfirmed,
            href: "/onboarding/docker",
        },
        {
            id: "aws",
            title: "AWS Academy",
            description: "Enroll in cloud sandbox",
            completed: status.awsEnrolled,
            href: "/onboarding/aws",
        },
    ]

    // Determine current active step (first incomplete step)
    const activeStepIndex = steps.findIndex(step => !step.completed)
    const activeStep = activeStepIndex === -1 ? null : steps[activeStepIndex] // All complete if -1

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 delay-150">
            <div className="relative">
                <div className="absolute -left-10 -top-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
                <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    Onboarding Dashboard
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Complete these steps to unlock full access to your Cloud Module resources.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_350px]">
                <div className="space-y-6">
                    {activeStep ? (
                        <Card className="border-primary/20 shadow-xl shadow-primary/5 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                            <CardHeader className="bg-muted/30 border-b border-white/5">
                                <div className="flex items-center gap-2 text-primary font-bold mb-1 tracking-wide uppercase text-xs">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground shadow-sm shadow-primary/50">
                                        {activeStepIndex + 1}
                                    </span>
                                    Current Action Required
                                </div>
                                <CardTitle className="text-2xl">{activeStep.title}</CardTitle>
                                <CardDescription className="text-base">{activeStep.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8 pb-8">
                                <p className="mb-6 text-muted-foreground">
                                    You are currently on this step. Please complete it to proceed.
                                </p>
                                <Link href={activeStep.href} className="block">
                                    <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/20 group">
                                        Go to {activeStep.title}
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900 shadow-sm backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-green-700 dark:text-green-400 text-2xl">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    All Steps Completed
                                </CardTitle>
                                <CardDescription className="text-green-600 dark:text-green-500 text-base pt-2">
                                    You have successfully onboarded. You can now access all cloud resources.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    )}

                    <div className="grid gap-4">
                        {steps.map((step, index) => (
                            <Card key={step.id} className={`transition-all duration-300 ${!step.completed && step !== activeStep ? 'opacity-50 grayscale-[0.5]' : 'hover:border-primary/30'}`}>
                                <CardHeader className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                            {step.completed ? (
                                                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </div>
                                            ) : (
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold shadow-sm ${step === activeStep
                                                    ? 'border-primary text-primary bg-primary/5'
                                                    : 'border-muted-foreground/30 text-muted-foreground'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className={`font-semibold text-lg ${step.completed ? 'text-green-700 dark:text-green-400' : ''}`}>{step.title}</h3>
                                                <p className="text-sm text-muted-foreground">{step.description}</p>
                                            </div>
                                        </div>
                                        {step.completed && (
                                            <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-xs font-semibold text-green-700 dark:text-green-400">
                                                Done
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-border/60 bg-background/50 backdrop-blur-sm sticky top-24">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                                Your Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <StatusItem label="GitHub" active={status.githubVerified} />
                            <StatusItem label="Organization" active={status.orgJoined} />
                            <StatusItem label="Docker" active={status.dockerConfirmed} />
                            <StatusItem label="AWS Academy" active={status.awsEnrolled} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function StatusItem({ label, active }: { label: string, active?: boolean }) {
    return (
        <div className="flex items-center justify-between text-sm group">
            <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">{label}</span>
            {active ? (
                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
            ) : (
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md text-xs">
                    <Circle className="h-3.5 w-3.5 fill-current opacity-50" /> Pending
                </span>
            )}
        </div>
    )
}
