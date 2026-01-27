"use client"

import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function CopyInvite({ token }: { token: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        const url = `${window.location.origin}/join/${token}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success("Invite link copied!")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy Invite Link">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
    )
}
