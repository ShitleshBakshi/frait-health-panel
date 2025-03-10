import { AssessmentForm, type AssessmentFormProps, type AssessmentItems } from "./assessment-form"

type SupportingParentAssessmentProps = Pick<AssessmentFormProps, "open" | "onClose" | "assessmentType"> & {
    parentName: string
    onComplete: () => void
}

const SupportingParentAssessmentItems: AssessmentItems[] = [
    {
        id: 1,
        title: "Supporting Parent/Carer's physical health",
        level: null,
    },
    {
        id: 2,
        title: "Supporting Parent/Carer is depressed/has mental health issues",
        level: null,
    },
    {
        id: 3,
        title: "Supporting Parent/Carer's lifestyle factors",
        level: null,
    },
    {
        id: 4,
        title: "Supporting Parent/Carer's experience of good parenting as a child",
        level: null,
    },
    {
        id: 5,
        title: "Supporting Parent/Carer's experience of being a parent",
        level: null,
    },
    {
        id: 6,
        title: "History of domestic abuse",
        level: null,
    },
]

export function SupportingParentAssessment({ open, onClose, parentName, onComplete, assessmentType }: SupportingParentAssessmentProps) {
    return (
        <AssessmentForm
            open={open}
            onClose={onClose}
            title="Supporting Parent/Carer's health and well-being"
            subjectName={parentName}
            assessmentItems={SupportingParentAssessmentItems}
            onComplete={onComplete}
            assessmentType={assessmentType}        />
    )
}

