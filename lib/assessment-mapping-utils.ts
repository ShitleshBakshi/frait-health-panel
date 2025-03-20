import type { AssessmentItem } from "@/lib/slices/assessmentSlice";
import type { AssessmentLevel } from "@/type/assessment";

/**
 * Maps describing the relationship between frontend assessment items and backend fields
 */

// Map main parent assessment items to backend FRAT fields
export const MAIN_PARENT_TO_FRAT_MAP: Record<number, number> = {
    1: 1,  // Main Parent's physical health → assessment_1
    2: 2,  // Main Parent has mental health issues → assessment_2
    3: 3,  // Main Parent's lifestyle factors → assessment_3
    4: 4,  // Main Parent's experience of good parenting as a child → assessment_4
    5: 5,  // Main Parent's experience of being a parent → assessment_5
    6: 6,  // History of domestic abuse → assessment_6
};

// Map supporting parent assessment items to backend FRAT fields
export const SUPPORTING_PARENT_TO_FRAT_MAP: Record<number, number> = {
    1: 7,  // Supporting Parent's physical health → assessment_7
    2: 8,  // Supporting Parent has mental health issues → assessment_8
    3: 9,  // Supporting Parent's lifestyle factors → assessment_9
    4: 10, // Supporting Parent's experience of good parenting as a child → assessment_10
    5: 11, // Supporting Parent's experience of being a parent → assessment_11
    6: 12, // History of domestic abuse → assessment_12
};

// Map external influence assessment items to backend FRAT fields
export const EXTERNAL_INFLUENCE_TO_FRAT_MAP: Record<number, number> = {
    1: 13,   // Parental age younger than 18 years → assessment_13
    2: 14,   // Number of children/young people in household → assessment_14
    3: 15,   // Adequate housing → assessment_15
    4: 16,  // Family struggling to manage finances → assessment_16
    5: 17,  // Family isolated due to cultural differences → assessment_17
    6: 18,  // Family access to extended family support → assessment_18
    7: 19,  // Family access to local charities → assessment_19
    8: 20,  // Family's ability to cope with stress → assessment_20
    9: 21,  // Family's ability to recognize problems that need to change → assessment_21
    10: 22, // Family not wanting to change when there are concerns → assessment_22
    11: 23, // Family's ability to make decision to change → assessment_23
    12: 24, // Family's control over life events → assessment_24
    13: 25, // Family values & beliefs affecting family health → assessment_25
    14: 26, // Family basic standard of education → assessment_26
    15: 27, // Family engagement with services → assessment_27
};

// Map child assessment items to backend FRAT fields
export const CHILD_TO_FRAT_MAP: Record<number, number> = {
    1: 28, // Child's physical health → assessment_28
    2: 29, // Family not attending appointments → assessment_29
    3: 30, // Child's education/learning needs being met → assessment_30
    4: 31, // Child's emotional development → assessment_31
    5: 32, // Family tension causing stress within family → assessment_32
    6: 33, // Parent's ability to provide all physical needs → assessment_33
    7: 34, // Child's feeding/eating well → assessment_34
    8: 35, // Parents' awareness of the need to protect the child from harm → assessment_35
    9: 36, // Frequent attendance at Emergency Department(s) → assessment_36
};

// Map assessment items to FRAI categories
export const ASSESSMENT_TO_FRAI_MAP = {
    // Main Parent Assessment items
    mainParent: {
        2: "family-health",    // Main Parent has mental health issues → Family Health
        4: "responsive-parenting", // Main Parent's experience of good parenting → Responsive Parenting
    },
    // External Influence Assessment items
    externalInfluence: {
        4: "socio-economic",   // Family struggling to manage finances → Socio/Economic Factor
        6: "family-support",   // Family access to extended family support → Family Support
        9: "engagement",       // Family's ability to recognize problems → Engagement
    },
};

// Score mapping for assessment levels
export const ASSESSMENT_LEVEL_TO_SCORE: Record<AssessmentLevel, string> = {
    "no-concern": "5",
    "low": "5",
    "low-med": "4",
    "med": "3",
    "med-high": "2",
    "high": "1"
};

/**
 * Helper function to get FRAT field ID from a frontend assessment item
 */
export function getFratFieldId(
    assessmentType: 'mainParent' | 'supportingParent' |'externalInfluence' | 'child',
    itemId: number
): number | null {
    if (assessmentType === 'mainParent') {
        return MAIN_PARENT_TO_FRAT_MAP[itemId] || null;
    } else if (assessmentType === 'supportingParent') {
        return SUPPORTING_PARENT_TO_FRAT_MAP[itemId] || null;
    } else if (assessmentType === 'externalInfluence') {
        return EXTERNAL_INFLUENCE_TO_FRAT_MAP[itemId] || null;
    }else if (assessmentType === 'child') {
        return CHILD_TO_FRAT_MAP[itemId] || null;
    }
    return null;
}

/**
 * Helper function to get FRAI category from a frontend assessment item
 */
// export function getFraiCategory(
//     assessmentType: 'mainParent' | 'externalInfluence',
//     itemId: number
// ): string | null {
//     const categoryMap = ASSESSMENT_TO_FRAI_MAP[assessmentType];
//     if (!categoryMap) return null;
//
//     return categoryMap[itemId as keyof typeof categoryMap] || null;
// }

/**
 * Generate a complete FRAT assessment payload from frontend assessment items
 * This transforms the Redux assessment data into the format expected by the backend API.
 */
export function generateFratPayload(
    familyId: number | String,
    mainParentAssessment: AssessmentItem[],
    supportingParentAssessment: AssessmentItem[],
    childAssessment: AssessmentItem[],
    externalInfluenceAssessment: AssessmentItem[]
): Record<string, any> {
    const payload: Record<string, any> = {
        id: parseInt(String(familyId), 10)
    };

    // Initialize all fields with default value
    for (let i = 1; i <= 36; i++) {
        payload[`assessment${i}`] = "no-concern";
    }

    // Map main parent assessment items
    mainParentAssessment.forEach(item => {
        const fieldId = getFratFieldId('mainParent', item.id);
        if (fieldId && item.level) {
            payload[`assessment${fieldId}`] = item.level;
        }
    });

    // Map supporting parent assessment items
    supportingParentAssessment.forEach(item => {
        const fieldId = getFratFieldId('supportingParent', item.id);
        if (fieldId && item.level) {
            payload[`assessment${fieldId}`] = item.level;
        }
    });

    // Map child assessment items
    childAssessment.forEach(item => {
        const fieldId = getFratFieldId('child', item.id);
        if (fieldId && item.level) {
            payload[`assessment${fieldId}`] = item.level;
        }
    });

    // Map external influence assessment items
    externalInfluenceAssessment.forEach(item => {
        const fieldId = getFratFieldId('externalInfluence', item.id);
        if (fieldId && item.level) {
            payload[`assessment${fieldId}`] = item.level;
        }
});

    return payload;
}

/**
 * Generate a FRAI assessment input from frontend assessment items
 * This calculates the scores for each category based on specific assessment items.
 */
// export function generateFraiPayload(
//     familyId: number,
//     mainParentAssessment: AssessmentItem[],
//     externalInfluenceAssessment: AssessmentItem[]
// ): Record<string, any> {
//     // Initialize categories with default highest scores
//     const scores = {
//         responsive_parenting: "5",
//         family_health: "5",
//         family_engagement: "5",
//         family_support: "5",
//         socio_economic: "5"
//     };
//
//     // Process main parent assessment items
//     mainParentAssessment.forEach(item => {
//         if (item.id === 4 && item.level) {
//             // Main Parent's experience of good parenting → Responsive Parenting
//             scores.responsive_parenting = ASSESSMENT_LEVEL_TO_SCORE[item.level];
//         } else if (item.id === 2 && item.level) {
//             // Main Parent has mental health issues → Family Health
//             scores.family_health = ASSESSMENT_LEVEL_TO_SCORE[item.level];
//         }
//     });
//
//     // Process external influence assessment items
//     externalInfluenceAssessment.forEach(item => {
//         if (item.id === 9 && item.level) {
//             // Family's ability to recognize problems → Engagement
//             scores.family_engagement = ASSESSMENT_LEVEL_TO_SCORE[item.level];
//         } else if (item.id === 6 && item.level) {
//             // Family access to extended family support → Family Support
//             scores.family_support = ASSESSMENT_LEVEL_TO_SCORE[item.level];
//         } else if (item.id === 4 && item.level) {
//             // Family struggling to manage finances → Socio-Economic
//             scores.socio_economic = ASSESSMENT_LEVEL_TO_SCORE[item.level];
//         }
//     });
//
//     // Calculate overall score (sum of all category scores)
//     const overallScore = Object.values(scores)
//         .reduce((sum, score) => sum + parseInt(score, 10), 0)
//         .toString();
//
//     return {
//         fraiInput: {
//             id: familyId,
//             responsive_parenting: scores.responsive_parenting,
//             family_health: scores.family_health,
//             family_engagement: scores.family_engagement,
//             family_support: scores.family_support,
//             socio_economic: scores.socio_economic,
//             overall_score: overallScore
//         }
//     };
// }

/**
 * Convert backend FRAT assessment data to frontend format
 * This is useful when loading assessment data from the backend
 */
export function convertFratToAssessmentItems(
    fratData: Record<string, string>
): {
    mainParentAssessment: AssessmentItem[],
    externalInfluenceAssessment: AssessmentItem[]
} {
    const mainParentAssessment: AssessmentItem[] = [];
    const externalInfluenceAssessment: AssessmentItem[] = [];

    // Process main parent assessment fields (1-6)
    for (let i = 1; i <= 6; i++) {
        const fieldName = `assessment_${i}`;
        if (fratData[fieldName]) {
            // Find the matching frontend item ID
            const frontendId = Object.entries(MAIN_PARENT_TO_FRAT_MAP)
                .find(([_, backendId]) => backendId === i)?.[0];

            if (frontendId) {
                mainParentAssessment.push({
                    id: parseInt(frontendId, 10),
                    level: fratData[fieldName] as AssessmentLevel
                });
            }
        }
    }

    // Process external influence assessment fields (7-21)
    for (let i = 7; i <= 21; i++) {
        const fieldName = `assessment${i}`;
        if (fratData[fieldName]) {
            // Find the matching frontend item ID
            const frontendId = Object.entries(EXTERNAL_INFLUENCE_TO_FRAT_MAP)
                .find(([_, backendId]) => backendId === i)?.[0];

            if (frontendId) {
                externalInfluenceAssessment.push({
                    id: parseInt(frontendId, 10),
                    level: fratData[fieldName] as AssessmentLevel
                });
            }
        }
    }

    return { mainParentAssessment, externalInfluenceAssessment };
}