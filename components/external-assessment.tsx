import { AssessmentForm, type AssessmentFormProps, type AssessmentItem } from "./assessment-form"
import {assessmentMapping} from "@/lib/assessment-utils";

type ExternalInfluenceAssessmentProps = Pick<AssessmentFormProps, "open" | "onClose" | "assessmentType"> & {
    parentName: string
    onComplete: () => void
}

const externalInfluenceAssessmentItems: AssessmentItem[] = [
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

export function ExternalInfluenceAssessment({ open, onClose, parentName, onComplete, assessmentType }: ExternalInfluenceAssessmentProps) {
    return (
        <AssessmentForm
            open={open}
            onClose={onClose}
            title="External influences/environmental factors"
            subjectName={parentName}
            assessmentItems={externalInfluenceAssessmentItems}
            onComplete={onComplete}
            assessmentType={assessmentType}        />
    )
}

