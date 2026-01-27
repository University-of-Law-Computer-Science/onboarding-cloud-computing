import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session) {
        redirect("/")
    }

    return (
        <div className="container mx-auto py-10 px-4 md:px-8">
            {children}
        </div>
    )
}
