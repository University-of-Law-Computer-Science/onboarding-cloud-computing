import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Cloud, GitBranch, Terminal } from "lucide-react"
import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()

  if (session) {
    redirect("/onboarding")
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-64 w-125 h-[5h-125primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 -right-64 w-125 h-125 bg-secondary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6">
          System Ready for 2025/26 Cohort
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl mb-6 max-w-4xl">
          <span className="block text-foreground">Next-Gen Cloud Labs for</span>
          <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-purple-500 to-secondary animate-gradient-x">
            Future Innovators
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Access your University of Law cloud environment.
          Seamlessly provision GitHub, Docker, and AWS resources in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          <form
            action={async () => {
              "use server"
              await signIn("github")
            }}
            className="w-full sm:w-auto"
          >
            <Button size="lg" className="w-full gap-2 text-base h-12 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">

              Sign in with GitHub
            </Button>
          </form>
          <Link href="#features" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-base h-12 border-primary/20 hover:bg-primary/5">
              Explore Platform <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Card 1 */}
          <div className="group relative overflow-hidden rounded-2xl border bg-background/50 backdrop-blur-sm p-8 transition-all hover:shadow-xl hover:-translate-y-1 text-center">
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors mx-auto">
                <GitBranch className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Identity</h3>
              <p className="text-muted-foreground">
                Automated GitHub organization invites and team assignments based on your university email.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative overflow-hidden rounded-2xl border bg-background/50 backdrop-blur-sm p-8 transition-all hover:shadow-xl hover:-translate-y-1 text-center">
            <div className="absolute inset-0 bg-linear-to-br from-secondary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors mx-auto">
                <Terminal className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Dev Environment</h3>
              <p className="text-muted-foreground">
                Standardized Docker toolchains ensure your code runs exactly like it does in the lab.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative overflow-hidden rounded-2xl border bg-background/50 backdrop-blur-sm p-8 transition-all hover:shadow-xl hover:-translate-y-1 text-center">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors mx-auto">
                <Cloud className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Cloud Sandbox</h3>
              <p className="text-muted-foreground">
                Direct access to AWS Academy resources without managing complex billing or credentials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Trust Badge */}
      <section className="container mx-auto px-4 py-12 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} University of Law &bull; Cloud Computing Module</p>
      </section>
    </div>
  )
}
