"use client"

import { useEffect, useState } from "react"
import { getCohortProgress } from "@/actions/cohorts"
import { Progress } from "@/components/ui/progress"
import { Users } from "lucide-react"

export function CohortVelocity() {
    const [progress, setProgress] = useState<number | null>(null)

    useEffect(() => {
        getCohortProgress().then((p) => {
            if (p !== null) setProgress(p)
        })
    }, [])

    if (progress === null) return null;

    return (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-blue-800 font-medium">
                    <Users className="h-4 w-4" />
                    <span>Cohort Progress</span>
                </div>
                <span className="text-blue-700 text-sm font-bold">{progress}% Complete</span>
            </div>
            <div className="relative h-2 w-full bg-blue-200 rounded-full overflow-hidden">
                <div 
                    className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-blue-600 text-[10px] mt-2 uppercase tracking-wider font-semibold">
                Students working together to reach 100%
            </p>
        </div>
    )
}
