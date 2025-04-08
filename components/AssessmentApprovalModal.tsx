"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {useEffect} from "react";

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
    const router = useRouter()
    const { toast } = useToast()

    const handleReview = () => {
        // Redirect to the family assessment page in edit mode
        router.push(`/families/${assessment.familyId}/assessment/${assessment.id}??mode=edit`)

        toast({
            title: "Reviewing Assessment",
            description: `Navigating to the assessment for family "${assessment.familyName}" for review.`,
        })

        onClose()
    }

    // Call handleReview immediately when the component mounts
    useEffect(() => {
        if (open) {
            handleReview()
        }
    }, [open])

    // Return null as we're not rendering anything - the component just handles navigation
    return null

}