"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAssessmentStore } from "@/lib/assessment-store"
import {
    AssessmentFormItem,
    ASSESSMENT_LEVELS,
    type AssessmentLevel,
    type Assessment
} from "@/type/assessment"

export interface AssessmentFormProps {
    open: boolean
    onClose: () => void
    title: string
    subjectName: string
    assessmentItems: AssessmentFormItem[]
    onComplete?: () => void
    assessmentType: "mainParent" | "externalInfluence" | "supportingParent" | "child"
    subjectId?: string  // Required for supportingParent and child
}

export interface AssessmentItem {
    id: number
    title: string
    level: AssessmentLevel | null
    info?: string
}

export function AssessmentForm({
                                   open,
                                   onClose,
                                   title,
                                   subjectName,
                                   assessmentItems: initialAssessmentItems,
                                   onComplete,
                                   assessmentType,
                               }: AssessmentFormProps) {
    const [assessments, setAssessments] = useState<AssessmentFormItem[]>(initialAssessmentItems)
    const { toast } = useToast()
    const assessmentStore = useAssessmentStore()

    const handleLevelSelect = (itemId: number, selectedLevel: AssessmentLevel) => {
        setAssessments((current) =>
            current.map((item) => {
                if (item.id === itemId) {
                    return { ...item, level: selectedLevel }
                }
                return item
            }),
        )
    }

    const getLevelStyle = (itemLevel: AssessmentLevel | null, level: AssessmentLevel) => {
        if (!itemLevel) return "bg-gray-100 hover:bg-gray-200"

        const selectedIndex = ASSESSMENT_LEVELS.indexOf(itemLevel)
        const currentIndex = ASSESSMENT_LEVELS.indexOf(level)

        if (currentIndex <= selectedIndex) {
            return "bg-blue-600 text-white"
        }

        return "bg-gray-100 hover:bg-gray-200"
    }

    const handleSubmit = () => {
        // Extract just the id and level for storage
        const assessmentData: Assessment = {
            items: assessments.map(({ id, level }) => ({ id, level }))
        }

        switch (assessmentType) {
            case "mainParent":
                assessmentStore.updateMainParentAssessment(assessmentData)
                break
            case "externalInfluence":
                assessmentStore.updateExternalInfluenceAssessment(assessmentData)
                break
        }

        toast({
            title: "Assessment updated",
            description: "The assessment has been successfully saved.",
            duration: 2000,
        })

        onComplete?.()
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {title} - {subjectName}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {assessments.map((item) => (
                        <div key={item.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600">
                                    {item.id}
                                </div>
                                <h3 className="font-medium">{item.title}</h3>
                            </div>

                            <div className="grid grid-cols-6 gap-1">
                                {ASSESSMENT_LEVELS.map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => handleLevelSelect(item.id, level)}
                                        className={`
                                            px-4 py-2 text-sm font-medium rounded-md transition-colors
                                            ${getLevelStyle(item.level, level)}
                                        `}
                                    >
                                        {level
                                            .split("-")
                                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join("/")}
                                    </button>
                                ))}
                            </div>

                            {item.info && (
                                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
                                    {item.info}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                        Submit
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}