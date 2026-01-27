"use client"

import { useEffect, useState } from "react"
import { checkTeamMembership } from "@/actions/github-team"
import { Badge } from "@/components/ui/badge"
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react"

export function TeamStatus({ userId, teamSlug }: { userId: string, teamSlug: string }) {
    const [status, setStatus] = useState<'loading' | 'member' | 'not_member' | 'error'>('loading')

    useEffect(() => {
        // Only check if we have a team slug
        if (!teamSlug) {
            setStatus("not_member")
            return
        }

        checkTeamMembership(userId)
            .then(res => {
                if (res.error) setStatus('error')
                else if (res.isMember) setStatus('member')
                else setStatus('not_member')
            })
            .catch(() => setStatus('error'))
    }, [userId, teamSlug])

    if (status === 'loading') return <Badge variant="outline" className="opacity-50"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Check</Badge>
    if (status === 'member') return <Badge className="bg-green-600 hover:bg-green-700"><ShieldCheck className="h-3 w-3 mr-1" /> Team Sync</Badge>
    if (status === 'not_member') return <Badge variant="destructive" className="opacity-80"><ShieldAlert className="h-3 w-3 mr-1" /> No Team</Badge>
    return <Badge variant="outline" className="text-muted-foreground">?</Badge>
}
