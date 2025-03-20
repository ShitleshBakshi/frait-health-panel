import { AssessmentForm, type AssessmentFormProps, type AssessmentItems } from "./assessment-form"
import type {AssessmentItem} from "@/lib/slices/assessmentSlice";

type ChildAssessmentProps = Pick<AssessmentFormProps, "open" | "onClose" | "assessmentType"> & {
    childName: string
    onComplete:  (items: AssessmentItem[]) => void
}

const childAssessmentItems: AssessmentItems[] = [
    {
        id: 1,
        title: "Child's physical health",
        level: null,
    },
    {
        id: 2,
        title: "Family not attending appointments",
        level: null,
    },
    {
        id: 3,
        title: "Child's education/learning needs being met",
        level: null,
    },
    {
        id: 4,
        title: "Child's emotional development",
        level: null,
    },
    {
        id: 5,
        title: "Family tension causing stress within family",
        level: null,
    },
    {
        id: 6,
        title: "Parent's ability to provide all physical needs",
        level: null,
    },
    {
        id: 7,
        title: "Child's feeding/eating well",
        level: null,
    },
    {
        id: 8,
        title: "Parents' awareness of the need to protect the child from harm in the home/elsewhere",
        level: null,
    },
    {
        id: 9,
        title: "Frequent attendance at Emergency Department(s)",
        level: null,
    },
]


export function ChildAssessment({ open, onClose, childName, onComplete, assessmentType }: ChildAssessmentProps) {
    return (
        <AssessmentForm
            open={open}
            onClose={onClose}
            title="Child's Health and Well-being Assessment"
            subjectName={childName}
            assessmentItems={childAssessmentItems}
            onComplete={onComplete}
            assessmentType={assessmentType}        />
    )
}

