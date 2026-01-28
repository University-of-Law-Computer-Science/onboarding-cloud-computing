"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { approveSubmission } from "@/actions/grading";
import { useState } from "react";
import { Check, Edit } from "lucide-react";

interface GradingDialogProps {
  submissionId: string;
  currentGrade?: number | null;
  currentFeedback?: string | null;
  triggerLabel?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function GradingDialog({
  submissionId,
  currentGrade,
  currentFeedback,
  triggerLabel = "Approve",
  variant = "outline"
}: GradingDialogProps) {
  const [open, setOpen] = useState(false);
  const [grade, setGrade] = useState<number>(currentGrade || 100);
  const [feedback, setFeedback] = useState<string>(currentFeedback || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setMessage(null);
    const result = await approveSubmission(submissionId, { grade, feedback });

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Submission graded and approved." });
      setTimeout(() => setOpen(false), 1000);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm" className="gap-2">
          {triggerLabel === "Edit" ? <Edit className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Grade Submission</DialogTitle>
          <DialogDescription>
            Review and adjust the grade and feedback for this submission.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="grade" className="text-right">
              Grade (%)
            </Label>
            <Input
              id="grade"
              type="number"
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="col-span-3"
              min={0}
              max={100}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="feedback" className="text-right">
              Feedback
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="col-span-3"
              placeholder="Enter remarks..."
            />
          </div>
          {message && (
            <div className={`text-sm ${message.type === "error" ? "text-red-500" : "text-green-500"} text-center`}>
              {message.text}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleApprove} disabled={loading}>
            {loading ? "Saving..." : "Save & Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
