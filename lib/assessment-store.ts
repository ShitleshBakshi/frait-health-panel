import { create } from "zustand"
import type { AssessmentLevel } from "./assessment-utils"

interface AssessmentItem {
    id: number
    level: AssessmentLevel | null
}

interface Assessment {
    items: AssessmentItem[]
}

interface AssessmentStore {
    mainParentAssessment: Assessment
    externalInfluenceAssessment: Assessment
    updateMainParentAssessment: (items: Assessment) => void
    updateExternalInfluenceAssessment: (items: Assessment) => void
    reset: () => void
}

const initialState: AssessmentStore = {
    mainParentAssessment: { items: [] },
    externalInfluenceAssessment: { items: [] },
    updateMainParentAssessment: () => {},
    updateExternalInfluenceAssessment: () => {},
    reset: () => {},
}

export const useAssessmentStore = create<AssessmentStore>((set) => ({
    ...initialState,
    updateMainParentAssessment: (assessment) => set({ mainParentAssessment: assessment }),
    updateExternalInfluenceAssessment: (assessment) => set({ externalInfluenceAssessment: assessment }),
    reset: () => set(initialState),
}))

