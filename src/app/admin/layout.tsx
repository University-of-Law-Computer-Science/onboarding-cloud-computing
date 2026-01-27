import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/")
    }

    if (session.user.role !== "staff") {
        redirect("/onboarding") // unauthorized
    }

    return (
        <div className="container mx-auto py-10 px-4 md:px-8">
            {children}
        </div>
    )
}
