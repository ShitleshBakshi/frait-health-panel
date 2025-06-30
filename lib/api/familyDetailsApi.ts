// This file provides the GraphQL mutations and queries
// for interacting with the backend family_details API

// GraphQL mutation for creating family details
export const CREATE_FAMILY_DETAILS = `
  mutation CreateFamilyDetails($input: FamilyDetailsInput!) {
    createFamilyDetails(input: $input){
            id
            mainParentFirstName
            mainParentLastName
            mainParentDob
            mainParentGender
            mainParentRelationToChild
            mainParentEducationLevel
            mainParentParentalResponsibility
            mainParentInformationProvider
            supportingParents{
                id
                firstName
                lastName
                dob
                gender
                relationToChild
                educationLevel
                parentalResponsibility
                informationProvider
            }
            children{
                id
                firstName
                lastName
                gender
                dob
                supportParent
                supportParentFirstName
                supportParentLastName
            }
    }
  }
`;

// Input type for family details matching the backend schema
export interface FamilyDetailsInput {
    id: number;
    main_parent_first_name: string;
    main_parent_last_name: string;
    main_parent_dob: string;
    main_parent_gender: string;
    main_parent_relation_to_child: string;
    main_parent_education_level: string;
    main_parent_parental_responsibility: boolean;
    main_parent_information_provider: boolean;
    support_parent_first_name: string;
    support_parent_last_name: string;
    support_parent_dob: string;
    support_parent_gender: string;
    support_parent_relation_to_child: string;
    support_parent_education_level: string;
    support_parent_parental_responsibility: boolean;
    support_parent_information_provider: boolean;
    child_first_name: string;
    child_last_name: string;
    child_gender: string;
    child_dob: string;
    child_support_parent: boolean;
    child_support_parent_first_name: string;
    child_support_parent_last_name: string;
}

// GraphQL query for fetching family details
export const GET_FAMILY_DETAILS = `
  query GetFamilyDetails($familyId: Int!) {
    getFamilyDetails(family_id: $familyId) {
      id
      main_parent_first_name
      main_parent_last_name
      main_parent_dob
      main_parent_gender
      main_parent_relation_to_child
      main_parent_education_level
      main_parent_parental_responsibility
      main_parent_information_provider
      support_parent_first_name
      support_parent_last_name
      support_parent_dob
      support_parent_gender
      support_parent_relation_to_child
      support_parent_education_level
      support_parent_parental_responsibility
      support_parent_information_provider
      child_first_name
      child_last_name
      child_gender
      child_dob
      child_support_parent
      child_support_parent_first_name
      child_support_parent_last_name
    }
  }
`;

// Function to execute the create family details mutation
import logger from '../logger';

export async function createFamilyDetails(input: FamilyDetailsInput): Promise<boolean> {
    logger.info('Creating family details', { familyId: input.id });
    try {
        const response = await fetch('/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: CREATE_FAMILY_DETAILS,
                variables: { input },
            }),
        });

        const result = await response.json();

        if (result.errors) {
            const errorMessage = result.errors[0].message;
            logger.error('GraphQL error in create family details', {
                error: errorMessage,
                familyId: input.id
            });
            throw new Error(errorMessage);
        }

        return result.data.createFamilyDetails;
    } catch (error) {
        logger.error('Failed to create family details', {
            error: error instanceof Error ? error.message : 'Unknown error',
            familyId: input.id
        });
        throw error;
    }
}

// Function to fetch family details by ID
export async function getFamilyDetails(familyId: number) {
    logger.info('Getting family details', { familyId });
    try {
        const response = await fetch('/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: GET_FAMILY_DETAILS,
                variables: { familyId },
            }),
        });

        const result = await response.json();

        if (result.errors) {
            const errorMessage = result.errors[0].message;
            logger.error('GraphQL error in get family details', {
                error: errorMessage,
                familyId
            });
            throw new Error(errorMessage);
        }

        return result.data.getFamilyDetails;
    } catch (error) {
        throw error;
    }
}