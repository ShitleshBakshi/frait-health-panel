import { AssessmentForm, type AssessmentFormProps, type AssessmentItem } from "./assessment-form"

type MainParentAssessmentProps = Pick<AssessmentFormProps, "open" | "onClose" | "assessmentType"> & {
    parentName: string
    onComplete: () => void
}

const mainParentAssessmentItems: AssessmentItem[] = [
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

export function MainParentAssessment({ open, onClose, parentName, onComplete, assessmentType }: MainParentAssessmentProps) {
    return (
        <AssessmentForm
            open={open}
            onClose={onClose}
            title="Main Parent/Carer's health and well-being"
            subjectName={parentName}
            assessmentItems={mainParentAssessmentItems}
            onComplete={onComplete}
            assessmentType={assessmentType}        />
    )
}

