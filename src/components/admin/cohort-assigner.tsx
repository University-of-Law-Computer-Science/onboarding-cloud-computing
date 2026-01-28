"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { assignStudentToCohort } from "@/actions/cohorts"
import { useState } from "react"
// import { toast } from "sonner" // Assuming sonner or use standard alert if toast not installed, falling back to simple alert or nothing for now. Actually, let's assume no toast lib yet, just basic optimistic UI or reload.

export function CohortAssigner({
    userId,
    currentCohortId,
    cohorts
}: {
    userId: string
    currentCohortId?: string | null
    cohorts: { id: string; name: string }[]
}) {
    const [isPending, setIsPending] = useState(false)

    const handleValueChange = async (value: string) => {
        setIsPending(true)
        try {
            await assignStudentToCohort(userId, value)
        } catch (error) {
            console.error("Failed to assign cohort", error)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Select
            defaultValue={currentCohortId || undefined}
            onValueChange={handleValueChange}
            disabled={isPending}
        >
            <SelectTrigger className="w-35 h-8 text-xs">
                <SelectValue placeholder="Assign Cohort" />
            </SelectTrigger>
            <SelectContent>
                {cohorts.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                        {cohort.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
