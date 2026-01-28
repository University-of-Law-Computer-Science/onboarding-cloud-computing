"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { syncCohortTeam } from "@/actions/cohorts"
import { toast } from "sonner"
import { useState } from "react"

export function SyncTeamButton({ cohortId }: { cohortId: string }) {
    const [loading, setLoading] = useState(false)

    const handleSync = async () => {
        setLoading(true)
        try {
            const res = await syncCohortTeam(cohortId)
            if (res.error) {
                toast.error(`Sync Failed: ${res.error}`)
            } else {
                toast.success("GitHub Team Synced")
            }
        } catch {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button variant="ghost" size="icon" onClick={handleSync} disabled={loading} title="Sync/Create GitHub Team">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
    )
}
