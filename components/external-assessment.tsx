import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { AssessmentForm, type AssessmentFormProps,AssessmentItems } from "./assessment-form"
import type { AssessmentItem } from "@/lib/slices/assessmentSlice"
import type { RootState } from "@/lib/store"
import {AssessmentLevel} from "@/type/assessment";

type ExternalInfluenceAssessmentProps = Pick<AssessmentFormProps, "open" | "onClose" | "assessmentType"> & {
    parentName: string
    onComplete: (items: AssessmentItem[]) => void
    initialItems?: AssessmentItem[]
}

// External influence assessment items template
const externalInfluenceAssessmentTemplate: AssessmentItems[] = [
    {
        id: 1,
        title: "Parental age younger than 18 years",
        level: null,
    },
    {
        id: 2,
        title: "Number of children/young people in the household",
        level: null,
    },
    {
        id: 3,
        title: "Adequate housing",
        level: null,
    },
    {
        id: 4,
        title: "Family struggling to manage their finances",
        level: null,
    },
    {
        id: 5,
        title: "Family isolated due to cultural differences",
        level: null,
    },
    {
        id: 6,
        title: "Family access to extended family support",
        level: null,
    },
    {
        id: 7,
        title: "Family access to local charities",
        level: null,
    },
    {
        id: 8,
        title: "Family's ability to cope with stress",
        level: null,
    },
    {
        id: 9,
        title: "Family's ability to recognise problems/circumstances that need to change",
        level: null,
    },
    {
        id: 10,
        title: "Family not wanting to change when there are concerns",
        level: null,
    },
    {
        id: 11,
        title: "Family's ability to make decision to change",
        level: null,
    },
    {
        id: 12,
        title: "Family's control over life events",
        level: null,
    },
    {
        id: 13,
        title: "Family values & beliefs affecting family health",
        level: null,
    },
    {
        id: 14,
        title: "Family basic standard of education",
        level: null,
    },
    {
        id: 15,
        title: "Family engagement with services",
        level: null,
    },
]

export function ExternalInfluenceAssessment({
                                                open,
                                                onClose,
                                                parentName,
                                                onComplete,
                                                assessmentType,
                                                initialItems
                                            }: ExternalInfluenceAssessmentProps) {
    // Get any existing assessment items from Redux
    const currentItems = useSelector((state: RootState) =>
        state.assessment.currentAssessment.externalInfluenceAssessment
    )

    // Local state for assessment items
    const [assessmentItems, setAssessmentItems] = useState<AssessmentItems[]>([])

    // Initialize assessment items from props or Redux state
    useEffect(() => {
        if (open) {
            // If we have initial items from props, use those
            if (initialItems && initialItems.length > 0) {
                // Map Redux-style items (id, level) to form items (id, title, level)
                const mergedItems = externalInfluenceAssessmentTemplate.map(templateItem => {
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
                const mergedItems = externalInfluenceAssessmentTemplate.map(templateItem => {
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
                setAssessmentItems(externalInfluenceAssessmentTemplate)
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
            title="External influences/environmental factors"
            subjectName={parentName}
            assessmentItems={assessmentItems}
            onComplete={handleComplete}
            assessmentType={assessmentType}
        />
    )
}