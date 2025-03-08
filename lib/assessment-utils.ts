export type AssessmentLevel = "no-concern" | "low" | "low-med" | "med" | "med-high" | "high"

// Map assessment levels to scores
export function getScoreForLevel(level: AssessmentLevel): number {
    switch (level) {
        case "no-concern":
        case "low":
            return 5
        case "low-med":
            return 4
        case "med":
            return 3
        case "med-high":
            return 2
        case "high":
            return 1
        default:
            return 0
    }
}

// Map assessment items to FRAI matrix categories
export const assessmentMapping = {
    mainParent: {
        2: "family-health", // Family Health
        4: "responsive-parenting", // Responsive Parenting
    },
    externalInfluence: {
        4: "socio-economic", // Socio/Economic Factor
        6: "family-support", // Family Support
        9: "engagement", // Engagement
    },
} as const

export type CategoryScores = {
    "responsive-parenting": number
    "family-health": number
    engagement: number
    "family-support": number
    "socio-economic": number
}

// Get column index for FRAI matrix
export function getCategoryColumnIndex(category: keyof CategoryScores): number {
    const categoryOrder = ["responsive-parenting", "family-health", "engagement", "family-support", "socio-economic"]
    return categoryOrder.indexOf(category)
}

// Calculate row index for FRAI matrix based on score
export function getRowIndexForScore(score: number): number {
    return 5 - score
}

