import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCohort } from "@/actions/cohorts"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function NewCohortPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/cohorts">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Create New Cohort</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Cohort Details</CardTitle>
                    <CardDescription>
                        This information will be used to direct students to the correct resources.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createCohort} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Cohort Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Sept 2025" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="githubTeamSlug">GitHub Team Slug</Label>
                            <Input id="githubTeamSlug" name="githubTeamSlug" placeholder="e.g. sept-2025-students" required />
                            <p className="text-xs text-muted-foreground">
                                The URL-friendly name of the team in the GitHub organization.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="awsAcademyLink">AWS Academy Setup Link</Label>
                            <Input id="awsAcademyLink" name="awsAcademyLink" placeholder="https://www.awsacademy.com/..." required />
                            <p className="text-xs text-muted-foreground">
                                The invite link for the specific AWS Academy course for this cohort.
                            </p>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Link href="/admin/cohorts">
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit">Create Cohort</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
