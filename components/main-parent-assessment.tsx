import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import {AssessmentForm, type AssessmentFormProps, AssessmentItems} from "./assessment-form"
import type { AssessmentItem } from "@/lib/slices/assessmentSlice"
import type { RootState } from "@/lib/store"
import {AssessmentLevel} from "@/type/assessment";

type MainParentAssessmentProps = Pick<AssessmentFormProps, "open" | "onClose" | "assessmentType"> & {
    parentName: string
    onComplete: (items: AssessmentItem[]) => void
    initialItems?: AssessmentItem[]
}

const mainParentAssessmentTemplate: AssessmentItems[] = [
    {
        id: 1,
        title: "Main Parent/Carer's physical health",
        level: null,
    },
    {
        id: 2,
        title: "Main Parent/Carer is depressed/has mental health issues",
        level: null,
    },
    {
        id: 3,
        title: "Main Parent/Carer's lifestyle factors",
        level: null,
    },
    {
        id: 4,
        title: "Main Parent/Carer's experience of good parenting as a child",
        level: null,
    },
    {
        id: 5,
        title: "Main Parent/Carer's experience of being a parent",
        level: null,
    },
    {
        id: 6,
        title: "History of domestic abuse",
        level: null,
    },
]

export function MainParentAssessment({
                                         open,
                                         onClose,
                                         parentName,
                                         onComplete,
                                         assessmentType,
                                         initialItems
                                     }: MainParentAssessmentProps) {
    // Get any existing assessment items from Redux
    const currentItems = useSelector((state: RootState) =>
        state.assessment.currentAssessment.mainParentAssessment
    )

    // Local state for assessment items
    const [assessmentItems, setAssessmentItems] = useState<AssessmentItems[]>([])

    // Initialize assessment items from props or Redux state
    useEffect(() => {
        if (open) {
            // If we have initial items from props, use those
            if (initialItems && initialItems.length > 0) {
                // Map Redux-style items (id, level) to form items (id, title, level)
                const mergedItems = mainParentAssessmentTemplate.map(templateItem => {
                    const matchingItem = initialItems.find(item => item.id === templateItem.id)
                    return {
                        ...templateItem,
                        level: matchingItem?.level as AssessmentLevel | null || null
                    }
                })
                setAssessmentItems(mergedItems)
            }
            // Otherwise if we have items in Redux state, use those
            else if (currentItems && currentItems.length > 0) {
                // Merge the template (which has titles) with the Redux state items
                const mergedItems = mainParentAssessmentTemplate.map(templateItem => {
                    const matchingItem = currentItems.find(item => item.id === templateItem.id)
                    return {
                        ...templateItem,
                        level: matchingItem?.level as AssessmentLevel | null || null
                    }
                })
                setAssessmentItems(mergedItems)
            }
            // Otherwise use the template
            else {
                setAssessmentItems(mainParentAssessmentTemplate)
            }
        }
    }, [open, initialItems, currentItems])

    // Handle form submission
    const handleComplete = (items: AssessmentItems[]) => {
        // Only pass the id and level to the parent component
        const simplifiedItems = items.map(({ id, level }) => ({ id, level }))
        onComplete(simplifiedItems)
    }

    return (
        <AssessmentForm
            open={open}
            onClose={onClose}
            title="Main Parent/Carer's health and well-being"
            subjectName={parentName}
            assessmentItems={assessmentItems}
            onComplete={handleComplete}
            assessmentType={assessmentType}
        />
    )
}

