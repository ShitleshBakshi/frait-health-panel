
// Define the possible assessment levels
export type AssessmentLevel = "no-concern" | "low" | "low-med" | "med" | "med-high" | "high"

// Assessment item with a level selection
export interface AssessmentItem {
    id: number
    level: AssessmentLevel | null
}

// Assessment item with title and additional info for UI display
export interface AssessmentFormItem extends AssessmentItem {
    title: string
    info?: string
}

// Parent information
export interface ParentInfo {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: string
}

// Child information
export interface ChildInfo {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    supportingParentId?: string
}

// Complete family assessment data
export interface FamilyAssessment {
    id: string
    familyId: number
    status: "DRAFT" | "IN PROGRESS" | "DONE"
    assessorHv: string
    reviewerHv: string | null
    createdAt: string
    updatedAt: string
    mainParent: ParentInfo
    supportingParents: ParentInfo[]
    children: ChildInfo[]
    mainParentAssessment: AssessmentItem[]
    externalInfluenceAssessment: AssessmentItem[]
}

// Assessment store state interface (for Zustand)
export interface Assessment {
    items: AssessmentItem[]
}

// Helper constants
export const ASSESSMENT_LEVELS: AssessmentLevel[] = ["no-concern", "low", "low-med", "med", "med-high", "high"]
