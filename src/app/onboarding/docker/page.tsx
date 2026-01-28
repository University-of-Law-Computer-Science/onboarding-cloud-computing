import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Terminal } from "lucide-react"
import { confirmDocker } from "@/actions/onboarding"
import { redirect } from "next/navigation"

export default async function DockerOnboardingPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/")

    const status = await prisma.onboardingStatus.findUnique({
        where: { userId: session.user.id },
    })

    // If already confirmed, simple redirect (or show success state)
    if (status?.dockerConfirmed) {
        redirect("/onboarding")
    }

    async function handleConfirm() {
        "use server"
        await confirmDocker()
        redirect("/onboarding")
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Docker Installation</h1>
                <p className="text-muted-foreground mt-2">
                    Containerization is essential for this module. You need Docker Desktop installed locally.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Installation Steps</CardTitle>
                    <CardDescription>Follow the instructions for your operating system.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Button variant="outline" className="h-20" asChild>
                            <a href="https://docs.docker.com/desktop/install/mac-install/" target="_blank" rel="noreferrer">
                                <div className="text-center">
                                    <span className="block font-semibold">Mac (Apple Silicon/Intel)</span>
                                    <span className="text-xs text-muted-foreground">Download for macOS</span>
                                </div>
                            </a>
                        </Button>
                        <Button variant="outline" className="h-20" asChild>
                            <a href="https://docs.docker.com/desktop/install/windows-install/" target="_blank" rel="noreferrer">
                                <div className="text-center">
                                    <span className="block font-semibold">Windows</span>
                                    <span className="text-xs text-muted-foreground">Download for Windows</span>
                                </div>
                            </a>
                        </Button>
                        <Button variant="outline" className="h-20" asChild>
                            <a href="https://docs.docker.com/desktop/install/linux-install/" target="_blank" rel="noreferrer">
                                <div className="text-center">
                                    <span className="block font-semibold">Linux</span>
                                    <span className="text-xs text-muted-foreground">Server / Desktop</span>
                                </div>
                            </a>
                        </Button>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                        <div className="flex items-center gap-2 mb-2 font-medium">
                            <Terminal className="h-4 w-4" />
                            Verification Command
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                            Open your terminal/command prompt and run:
                        </p>
                        <code className="bg-background px-2 py-1 rounded text-sm block w-fit border">
                            docker run hello-world
                        </code>
                        <p className="text-sm text-muted-foreground mt-2">
                            If working, you will see &quot;Hello from Docker!&quot;
                        </p>
                    </div>

                    <form action={handleConfirm} className="border-t pt-6 space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="confirm" required />
                            <Label htmlFor="confirm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                I have installed Docker and verified it with the &quot;hello-world&quot; command.
                            </Label>
                        </div>
                        <Button type="submit" size="lg" className="w-full sm:w-auto">
                            Confirm Installation
                        </Button>
                    </form>

                </CardContent>
            </Card>
        </div>
    )
}
