"use client"

import { Button } from "@/components/ui/button"
import { MailCheck, Loader2 } from "lucide-react"
import { inviteMeAction } from "@/actions/onboarding"
import { toast } from "sonner"
import { useTransition } from "react"

export function InviteButton() {
    const [isPending, startTransition] = useTransition()

    const handleInvite = () => {
        startTransition(async () => {
            try {
                const result = await inviteMeAction()
                if (result?.error) {
                    toast.error(result.error)
                } else {
                    toast.success("Invitation sent! Check your email.")
                }
            } catch (error) {
                toast.error("Failed to send invitation")
            }
        })
    }

    return (
        <Button 
            size="sm" 
            variant="secondary" 
            onClick={handleInvite}
            disabled={isPending}
        >
            {isPending ? (
                 <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            ) : (
                 <MailCheck className="h-3 w-3 mr-2" />
            )}
            {isPending ? "Sending..." : "Fix it for me (Send Invite)"}
        </Button>
    )
}
