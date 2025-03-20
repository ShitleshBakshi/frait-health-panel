import { createAsyncThunk } from "@reduxjs/toolkit";
import { setSaving, setError } from "../slices/familyDetailsSlice";
import type { RootState } from "../store";

// Thunk to save family details to the backend
export const saveFamilyDetails = createAsyncThunk(
    "familyDetails/saveFamilyDetails",
    async (_, { getState, dispatch }) => {
        try {
            dispatch(setSaving(true));

            const state = getState() as RootState;
            const { familyDetails } = state;

            if (!familyDetails.familyId) {
                throw new Error("Family ID is required");
            }

            if (!familyDetails.mainParent) {
                throw new Error("Main parent information is required");
            }

            // Prepare data for backend in the format it expects
            const backendData = {
                id: parseInt(familyDetails.familyId),
                main_parent_first_name: familyDetails.mainParent.firstName,
                main_parent_last_name: familyDetails.mainParent.lastName,
                main_parent_dob: familyDetails.mainParent.dateOfBirth,
                main_parent_gender: familyDetails.mainParent.gender,
                main_parent_relation_to_child: familyDetails.mainParent.relationToChild,
                main_parent_education_level: familyDetails.mainParent.educationLevel,
                main_parent_parental_responsibility: familyDetails.mainParent.parentalResponsibility,
                main_parent_information_provider: familyDetails.mainParent.informationProvider,

                // Get first supporting parent or empty defaults
                support_parent_first_name: familyDetails.supportingParents[0]?.firstName || "",
                support_parent_last_name: familyDetails.supportingParents[0]?.lastName || "",
                support_parent_dob: familyDetails.supportingParents[0]?.dateOfBirth || "",
                support_parent_gender: familyDetails.supportingParents[0]?.gender || "",
                support_parent_relation_to_child: familyDetails.supportingParents[0]?.relationToChild || "",
                support_parent_education_level: familyDetails.supportingParents[0]?.educationLevel || "",
                support_parent_parental_responsibility: familyDetails.supportingParents[0]?.parentalResponsibility || false,
                support_parent_information_provider: familyDetails.supportingParents[0]?.informationProvider || false,

                // Get first child or empty defaults
                child_first_name: familyDetails.children[0]?.firstName || "",
                child_last_name: familyDetails.children[0]?.lastName || "",
                child_gender: familyDetails.children[0]?.gender || "",
                child_dob: familyDetails.children[0]?.dateOfBirth || "",
                child_support_parent: familyDetails.children[0]?.supportParent || false,
                child_support_parent_first_name: familyDetails.children[0]?.supportParentFirstName || "",
                child_support_parent_last_name: familyDetails.children[0]?.supportParentLastName || ""
            };

            // For a real app, this would be an API call
            // Example:
            // const response = await fetch('/api/family-details', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(backendData)
            // });
            //
            // if (!response.ok) {
            //     throw new Error('Failed to save family details');
            // }
            //
            // const result = await response.json();
            // return result;

            // For demo, just log the data and simulate a delay
            console.log("Saving family details:", backendData);
            await new Promise(resolve => setTimeout(resolve, 1000));

            dispatch(setSaving(false));
            dispatch(setError(null));

            return backendData;
        } catch (error) {
            dispatch(setSaving(false));
            dispatch(setError(error instanceof Error ? error.message : "An unknown error occurred"));
            throw error;
        }
    }
);

// Thunk to fetch family details from the backend
export const fetchFamilyDetails = createAsyncThunk(
    "familyDetails/fetchFamilyDetails",
    async (familyId: string, { dispatch }) => {
        try {
            dispatch(setSaving(true));

            // For a real app, this would be an API call
            // Example:
            // const response = await fetch(`/api/family-details/${familyId}`);
            // if (!response.ok) {
            //     throw new Error('Failed to fetch family details');
            // }
            // const data = await response.json();

            // For demo, just log and simulate a delay
            console.log("Fetching family details for ID:", familyId);
            await new Promise(resolve => setTimeout(resolve, 1000));

            dispatch(setSaving(false));
            dispatch(setError(null));

            // Return mock data for demonstration
            return {
                id: familyId,
                // ... would return actual data from backend
            };
        } catch (error) {
            dispatch(setSaving(false));
            dispatch(setError(error instanceof Error ? error.message : "An unknown error occurred"));
            throw error;
        }
    }
);