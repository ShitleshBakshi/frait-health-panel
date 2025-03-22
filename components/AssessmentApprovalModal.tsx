"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

interface AssessmentApprovalModalProps {
    open: boolean
    onClose: () => void
    assessment: {
        id: string
        familyId: string
        familyName: string
        assistantId: string
        assistantName: string
        date: string
    }
}

export function AssessmentApprovalModal({
                                            open,
                                            onClose,
                                            assessment
                                        }: AssessmentApprovalModalProps) {
    const [feedback, setFeedback] = useState<string>("")
    const { approveAssessment, rejectAssessment } = useAuth()
    const { toast } = useToast()

    const handleApprove = () => {
        approveAssessment(assessment.id)
        toast({
            title: "Assessment Approved",
            description: `The assessment for family "${assessment.familyName}" has been approved.`,
        })
        onClose()
    }

    const handleReject = () => {
        if (!feedback.trim()) {
            toast({
                title: "Feedback Required",
                description: "Please provide feedback explaining why the assessment is being rejected.",
                variant: "destructive",
            })
            return
        }

        rejectAssessment(assessment.id)
        toast({
            title: "Assessment Rejected",
            description: `The assessment for family "${assessment.familyName}" has been rejected with feedback.`,
        })
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Review Assessment</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-medium mb-1">Family:</p>
                            <p>{assessment.familyName}</p>
                        </div>
                        <div>
                            <p className="font-medium mb-1">Submitted By:</p>
                            <p>{assessment.assistantName}</p>
                        </div>
                        <div>
                            <p className="font-medium mb-1">Submission Date:</p>
                            <p>{assessment.date}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="font-medium">Feedback (required for rejection):</label>
                        <Textarea
                            placeholder="Provide feedback or notes about this assessment..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>

                <DialogFooter className="space-x-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        variant="destructive"
                        onClick={handleReject}
                    >
                        Reject
                    </Button>
                    <Button
                        onClick={handleApprove}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Approve
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}