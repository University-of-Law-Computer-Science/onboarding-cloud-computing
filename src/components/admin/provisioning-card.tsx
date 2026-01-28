"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { provisionLabForCohort } from "@/actions/provisioning"
import { toast } from "sonner"
import { Loader2, Terminal } from "lucide-react"

// Hardcoded for now, or could fetch from a DB/Config
const AVAILABLE_LABS = [
    "ccds-lab-01-virtualisation",
    "ccds-lab-02-containers",
    "ccds-lab-03-cloud-models",
    "ccds-lab-04-architecture",
    "ccds-lab-05-distributed-systems",
    "ccds-lab-06-consistency",
    "ccds-lab-07-microservices",
    "ccds-lab-08-kubernetes",
    "ccds-lab-09-cicd",
    "ccds-lab-10-observability",
]

type Cohort = {
    id: string
    name: string
}

export function ProvisioningCard({ cohorts }: { cohorts: Cohort[] }) {
    const [selectedCohort, setSelectedCohort] = useState<string>("")
    const [selectedLab, setSelectedLab] = useState<string>("")
    const [isPending, startTransition] = useTransition()
    const [report, setReport] = useState<string[]>([])

    const handleRun = () => {
        if (!selectedCohort || !selectedLab) {
            toast.error("Please select both a cohort and a lab.")
            return
        }

        startTransition(async () => {
            setReport(["Starting provisioning job..."])
            try {
                const res = await provisionLabForCohort(selectedCohort, selectedLab)
                if (res.error) {
                    toast.error(res.error)
                    setReport(prev => [...prev, `Error: ${res.error}`])
                } else if (res.report) {
                    // Update report log
                    setReport([
                        `Job Complete. Success: ${res.report.success}, Failed: ${res.report.failed}`,
                        "--------------------------------",
                        ...res.report.details
                    ])
                    toast.success("Provisioning job finished")
                }
            } catch {
                toast.error("An unexpected error occurred")
            }
        })
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Lab Provisioning
                </CardTitle>
                <CardDescription>
                    Bulk-create student repositories from templates.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Select Cohort</Label>
                    <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a cohort..." />
                        </SelectTrigger>
                        <SelectContent>
                            {cohorts.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Select Lab Template</Label>
                    <Select value={selectedLab} onValueChange={setSelectedLab}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a lab..." />
                        </SelectTrigger>
                        <SelectContent>
                            {AVAILABLE_LABS.map((lab) => (
                                <SelectItem key={lab} value={lab}>
                                    {lab}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    className="w-full"
                    onClick={handleRun}
                    disabled={isPending || !selectedCohort || !selectedLab}
                >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? "Provisioning..." : "Start Provisioning"}
                </Button>

                {report.length > 0 && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg text-xs font-mono max-h-60 overflow-y-auto whitespace-pre-wrap">
                        {report.join("\n")}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
