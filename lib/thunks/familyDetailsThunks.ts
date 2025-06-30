import { createAsyncThunk } from "@reduxjs/toolkit";
import {
        fetchGraphQL,
        SAVE_FAMILY_DETAILS_MUTATION,
        GET_FAMILY_DETAILS_QUERY
} from "@/lib/api";
import { setSaving,
    setError,
    setLastSaved,
    setFamilyDetails,
    ParentInfo,
    ChildInfo } from "../slices/familyDetailsSlice";

/**
 * Save family details to the backend
 */
export const saveFamilyDetails = createAsyncThunk(
    'familyDetails/saveToBackend',
    async (
        {
            familyId,
            mainParentInfo,
            supportingParentsInfo,
            childrenInfo
        }: {
            familyId: number,
            mainParentInfo: any,
            supportingParentsInfo?: any[],
            childrenInfo?: any[]
        },
        { dispatch, rejectWithValue }
    ) => {
        try {
            dispatch(setSaving(true));

            // Ensure we have arrays for supporting parents and children
            const supportingParents = supportingParentsInfo || [];
            const children = childrenInfo || [];

            // Map main parent fields to backend structure
            const payload = {
                id: familyId,
                mainParentFirstName: mainParentInfo.firstName,
                mainParentLastName: mainParentInfo.lastName,
                mainParentDob: mainParentInfo.dateOfBirth,
                mainParentGender: mainParentInfo.gender || "",
                mainParentRelationToChild: mainParentInfo.relationToChild || "",
                mainParentEducationLevel: mainParentInfo.educationLevel || "",
                mainParentParentalResponsibility: mainParentInfo.parentalResponsibility || false,
                mainParentInformationProvider: mainParentInfo.informationProvider || false,

                // Map supporting parents to backend structure
                supportingParents: supportingParents.map(parent => ({
                    firstName: parent.firstName,
                    lastName: parent.lastName,
                    dob: parent.dateOfBirth,
                    gender: parent.gender || "",
                    relationToChild: parent.relationToChild || "",
                    educationLevel: parent.educationLevel || "",
                    parentalResponsibility: parent.parentalResponsibility || false,
                    informationProvider: parent.informationProvider || false
                })),

                // Map children to backend structure
                children: children.map(child => ({
                    firstName: child.firstName,
                    lastName: child.lastName,
                    gender: child.gender,
                    dob: child.dateOfBirth,
                    supportParent: child.supportParent || false,
                    supportParentFirstName: child.supportParentFirstName || "",
                    supportParentLastName: child.supportParentLastName || ""
                }))
            };

            // Execute GraphQL mutation
            const result = await fetchGraphQL(SAVE_FAMILY_DETAILS_MUTATION, {
                family_details_input: {...payload,id: +familyId}
            });

            if (!result.createFamilyDetails) {
                throw new Error("Failed to save family details");
            }

            const timestamp = new Date().toISOString();
            if (typeof setLastSaved === 'function') {
                dispatch(setLastSaved(timestamp));
            }

            dispatch(setSaving(false));
            return {
                success: true,
                timestamp
            };
        } catch (error) {
            dispatch(setSaving(false));
            dispatch(setError(error instanceof Error ? error.message : "Failed to save family details"));
            return rejectWithValue(error instanceof Error ? error.message : "Failed to save family details");
        }
    }
);

/**
 * Fetch family details from the backend
 */
export const fetchFamilyDetailsFromBackend = createAsyncThunk(
    'familyDetails/fetchFromBackend',
    async (familyId: number, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setSaving(true));

            const result = await fetchGraphQL(GET_FAMILY_DETAILS_QUERY, { family_id: familyId });

            if (!result.getFamilyDetails) {
                dispatch(setSaving(false));
                return null; // No family details exist yet
            }

            const data = result.getFamilyDetails;

            // Map main parent from backend to frontend structure
            const mainParent: ParentInfo = {
                id: `main_${data.id}`,
                firstName: data.main_parent_first_name,
                lastName: data.main_parent_last_name,
                dateOfBirth: data.main_parent_dob,
                gender: data.main_parent_gender,
                relationToChild: data.main_parent_relation_to_child,
                educationLevel: data.main_parent_education_level,
                parentalResponsibility: data.main_parent_parental_responsibility,
                informationProvider: data.main_parent_information_provider
            };

            // Map supporting parents from backend to frontend structure
            const supportingParents: ParentInfo[] = data.supporting_parents.map((sp: any) => ({
                id: `support_${sp.id}`,
                firstName: sp.first_name,
                lastName: sp.last_name,
                dateOfBirth: sp.dob,
                gender: sp.gender,
                relationToChild: sp.relation_to_child,
                educationLevel: sp.education_level,
                parentalResponsibility: sp.parental_responsibility,
                informationProvider: sp.information_provider
            }));

            // Map children from backend to frontend structure
            const children: ChildInfo[] = data.children.map((child: any) => ({
                id: `child_${child.id}`,
                firstName: child.first_name,
                lastName: child.last_name,
                dateOfBirth: child.dob,
                gender: child.gender,
                supportParent: child.support_parent,
                supportParentFirstName: child.support_parent_first_name,
                supportParentLastName: child.support_parent_last_name
            }));

            dispatch(setSaving(false));

            return {
                mainParentInfo: mainParent,
                supportingParentsInfo: supportingParents,
                childrenInfo: children
            };
        } catch (error) {
            dispatch(setSaving(false));
            dispatch(setError(error instanceof Error ? error.message : "Failed to fetch family details"));
            return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch family details");
        }
    }
);