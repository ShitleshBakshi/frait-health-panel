import type { RootState } from "./store";
import type { AssessmentItem } from "./slices/assessmentSlice";

export type AssessmentLevel = "no-concern" | "low" | "low-med" | "med" | "med-high" | "high"

export type CategoryType = "responsive-parenting" | "family-health" | "engagement" | "family-support" | "socio-economic";


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
        2: "family-health" as CategoryType, // Family Health
        4: "responsive-parenting" as CategoryType, // Responsive Parenting
    },
    externalInfluence: {
        4: "socio-economic" as CategoryType, // Socio/Economic Factor
        6: "family-support" as CategoryType, // Family Support
        9: "engagement" as CategoryType, // Engagement
    },
};

export type CategoryScores = {
    "responsive-parenting": number
    "family-health": number
    engagement: number
    "family-support": number
    "socio-economic": number
}

export function calculateCategoryScores(state: RootState): CategoryScores {
    const { mainParentAssessment, externalInfluenceAssessment } = state.assessment.currentAssessment;

    const scores: CategoryScores = {
        "responsive-parenting": 0,
        "family-health": 0,
        "engagement": 0,
        "family-support": 0,
        "socio-economic": 0,
    };

    mainParentAssessment.forEach(item => {
        if (item.level) {
            const category = assessmentMapping.mainParent[item.id as keyof typeof assessmentMapping.mainParent];
            if (category) {
                scores[category] = getScoreForLevel(item.level);
            }
        }
    });

    externalInfluenceAssessment.forEach(item => {
        if (item.level) {
            const category = assessmentMapping.externalInfluence[item.id as keyof typeof assessmentMapping.externalInfluence];
            if (category) {
                scores[category] = getScoreForLevel(item.level);
            }
        }
    });

    return scores;
}

// New function specifically for calculating scores from stored assessment data
export function calculateCategoryScoresFromAssessment(
    mainParentAssessment: AssessmentItem[], 
    externalInfluenceAssessment: AssessmentItem[]
): CategoryScores {
    const scores: CategoryScores = {
        "responsive-parenting": 0,
        "family-health": 0,
        "engagement": 0,
        "family-support": 0,
        "socio-economic": 0,
    };

    // Process main parent assessment items
    mainParentAssessment.forEach(item => {
        if (item.level) {
            const category = assessmentMapping.mainParent[item.id as keyof typeof assessmentMapping.mainParent];
            if (category) {
                scores[category] = getScoreForLevel(item.level);
            }
        }
    });

    // Process external influence assessment items  
    externalInfluenceAssessment.forEach(item => {
        if (item.level) {
            const category = assessmentMapping.externalInfluence[item.id as keyof typeof assessmentMapping.externalInfluence];
            if (category) {
                scores[category] = getScoreForLevel(item.level);
            }
        }
    });

    return scores;
}

// Calculate overall score from category scores
export function calculateOverallScore(scores: CategoryScores): number {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
}

// Get column index for FRAI matrix
export function getCategoryColumnIndex(category: keyof CategoryScores): number {
    const categoryOrder = [
        "responsive-parenting",
        "family-health",
        "engagement",
        "family-support",
        "socio-economic"
    ];
    return categoryOrder.indexOf(category);
}

// Calculate row index for FRAI matrix based on score
export function getRowIndexForScore(score: number): number {
    return 5 - score
}

export function shouldHighlightCell(rowIndex: number, colIndex: number, scores: CategoryScores): boolean {
    const categories = [
        "responsive-parenting",
        "family-health",
        "engagement",
        "family-support",
        "socio-economic",
    ] as const;

    const category = categories[colIndex];
    const score = scores[category];
    return score > 0 && rowIndex === getRowIndexForScore(score);
}
