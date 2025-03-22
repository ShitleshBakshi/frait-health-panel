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

// === FAMILY DETAILS API UTILITIES ===

/**
 * GraphQL mutation for saving family details
 */
export const SAVE_FAMILY_DETAILS_MUTATION = `
  mutation CreateFamilyDetails($family_details_input: FamilyDetailsInput!) {
    createFamilyDetails(familyDetailsInput: $family_details_input)
  }
`;

/**
 * GraphQL query for fetching family details
 */
export const GET_FAMILY_DETAILS_QUERY = `
  query GetFamilyDetails($family_id: Int!) {
    getFamilyDetails(family_id: $family_id) {
      id
      main_parent_first_name
      main_parent_last_name
      main_parent_dob
      main_parent_gender
      main_parent_relation_to_child
      main_parent_education_level
      main_parent_parental_responsibility
      main_parent_information_provider
      supportingParents {
        id
        first_name
        last_name
        dob
        gender
        relation_to_child
        education_level
        parental_responsibility
        information_provider
      }
      children {
        id
        first_name
        last_name
        gender
        dob
        support_parent
        support_parent_first_name
        support_parent_last_name
      }
    }
  }
`;

/**
 * Fetch family details for a specific family
 * @param familyId The ID of the family to fetch details for
 */
export async function fetchFamilyDetails(familyId: number) {
    return fetchGraphQL(GET_FAMILY_DETAILS_QUERY, { family_id: familyId });
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
    createInitialFraiAssessment(fraiInput: $fraiInput)
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
        overallScore
      }
    }
  `;

    return fetchGraphQL(QUERY, { familyId });
}