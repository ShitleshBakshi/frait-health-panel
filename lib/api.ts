/**
 * API utilities for making GraphQL requests to the backend
 */

// Get the GraphQL URL from environment variables with fallback
export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql';

/**
 * Function to execute a GraphQL query or mutation
 *
 * @param query - The GraphQL query/mutation string
 * @param variables - Variables to pass to the query/mutation
 * @param headers - Optional additional headers
 * @returns Promise with the response data
 */
export async function fetchGraphQL(
    query: string,
    variables: Record<string, any> = {},
    headers: Record<string, string> = {}
) {
    try {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify({
                query,
                variables
            })
        });

        const json = await response.json();

        // Handle GraphQL errors
        if (json.errors) {
            console.error('GraphQL Error:', json.errors);
            throw new Error(json.errors[0]?.message || 'An error occurred during the GraphQL request');
        }

        return json.data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// === ASSESSMENT API UTILITIES ===

/**
 * GraphQL mutation for saving FRAT assessment
 * This mutation sends all 36 assessment fields to the backend
 */
export const SAVE_FRAT_ASSESSMENT_MUTATION = `
  mutation CreateFratAssessment($fratAssessmentInput: FratAssessmentInput!) {
    createFratAssessment(fratAssessmentInput: $fratAssessmentInput)
  }
`;

/**
 * GraphQL mutation for saving FRAI assessment
 * This mutation sends the calculated scores for each category
 */
export const SAVE_FRAI_ASSESSMENT_MUTATION = `
  mutation CreateFraiAssessment($fraiInput: FraiAssessmentInput!) {
    createInitialFraiAssessment(frai_input: $fraiInput)
  }
`;

/**
 * Helper function to dynamically generate a FRAT assessment mutation
 * This is an alternative to the static mutation above, useful for testing or dynamic use cases
 */
export function buildFratAssessmentMutation() {
    // Generate parameter list for 36 assessment fields
    const params = [];
    const variables = [];

    for (let i = 1; i <= 36; i++) {
        params.push(`$assessment${i}: String!`);
        variables.push(`assessment_${i}: $assessment${i}`);
    }

    return `
    mutation CreateFratAssessment($id: Int!, ${params.join(', ')}) {
      createFratAssessment(
        id: $id, 
        ${variables.join(', ')}
      )
    }
  `;
}

/**
 * Fetch assessment data for a specific family
 * @param familyId The ID of the family to fetch assessment data for
 */
export async function fetchFamilyAssessmentData(familyId: number) {
    const QUERY = `
    query GetFamilyAssessment($familyId: Int!) {
      getFratAssessmentDetails(family_id: $familyId) {
        assessment_1
        assessment_2
        assessment_3
        assessment_4
        assessment_5
        assessment_6
        assessment_7
        assessment_8
        assessment_9
        assessment_10
        assessment_11
        assessment_12
        assessment_13
        assessment_14
        assessment_15
        assessment_16
        assessment_17
        assessment_18
        assessment_19
        assessment_20
        assessment_21
        assessment_22
        assessment_23
        assessment_24
        assessment_25
        assessment_26
        assessment_27
        assessment_28
        assessment_29
        assessment_30
        assessment_31
        assessment_32
        assessment_33
        assessment_34
        assessment_35
        assessment_36
      }
      getFraiAssessment(family_id: $familyId) {
        responsive_parenting
        family_health
        family_engagement
        family_support
        socio_economic
        overall_score
      }
    }
  `;

    return fetchGraphQL(QUERY, { familyId });
}