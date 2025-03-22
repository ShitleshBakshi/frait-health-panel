import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AssessmentLevel } from "@/type/assessment";

// Define interfaces for assessment items
export interface AssessmentItem {
    id: number;
    level: AssessmentLevel | null;
}

// Assessment state interface
interface AssessmentState {
    // Current editing state (temporary data)
    currentAssessment: {
        mainParentAssessment: AssessmentItem[];
        supportingParentAssessment: AssessmentItem[];
        childAssessment: AssessmentItem[];
        externalInfluenceAssessment: AssessmentItem[];
        familyId: number | null;
        assessmentId: number | null;
    };
    // Loading status
    loading: boolean;
    error: string | null;
}

// Initial state
const initialState: AssessmentState = {
    currentAssessment: {
        mainParentAssessment: [],
        supportingParentAssessment: [],
        childAssessment: [],
        externalInfluenceAssessment: [],
        familyId: null,
        assessmentId: null
    },
    loading: false,
    error: null
};

// Create slice
const assessmentSlice = createSlice({
    name: "assessment",
    initialState,
    reducers: {
        // Start a new assessment
        startNewAssessment: (state, action: PayloadAction<{ familyId: number }>) => {
            state.currentAssessment = {
                ...initialState.currentAssessment,
                familyId: action.payload.familyId,
            };
            state.loading = false;
            state.error = null;
        },

        // Load an existing assessment for editing
        loadAssessment: (state, action: PayloadAction<{
            assessmentId: number;
            mainParentAssessment: AssessmentItem[];
            supportingParentAssessment?: AssessmentItem[];
            childAssessment?: AssessmentItem[];
            externalInfluenceAssessment: AssessmentItem[];
            familyId: number;
        }>) => {
            state.currentAssessment = {
                mainParentAssessment: action.payload.mainParentAssessment,
                supportingParentAssessment: action.payload.supportingParentAssessment || [],
                childAssessment: action.payload.childAssessment || [],
                externalInfluenceAssessment: action.payload.externalInfluenceAssessment,
                familyId: action.payload.familyId,
                assessmentId: action.payload.assessmentId
            };
            state.loading = false;
            state.error = null;
        },

        // Update main parent assessment items
        updateMainParentAssessment: (state, action: PayloadAction<AssessmentItem[]>) => {
            state.currentAssessment.mainParentAssessment = action.payload;
        },

        // Update supporting parent assessment items
        updateSupportingParentAssessment: (state, action: PayloadAction<AssessmentItem[]>) => {
            state.currentAssessment.supportingParentAssessment = action.payload;
        },

        // Update child assessment items
        updateChildAssessment: (state, action: PayloadAction<AssessmentItem[]>) => {
            state.currentAssessment.childAssessment = action.payload;
        },

        // Update external influence assessment items
        updateExternalInfluenceAssessment: (state, action: PayloadAction<AssessmentItem[]>) => {
            state.currentAssessment.externalInfluenceAssessment = action.payload;
        },

        // Clear current assessment
        resetAssessment: (state) => {
            state.currentAssessment = initialState.currentAssessment;
            state.loading = false;
            state.error = null;
        },

        // Set loading state
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        // Set error state
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        }
    }
});

// Export actions
export const {
    startNewAssessment,
    loadAssessment,
    updateMainParentAssessment,
    updateSupportingParentAssessment,
    updateChildAssessment,
    updateExternalInfluenceAssessment,
    resetAssessment,
    setLoading,
    setError
} = assessmentSlice.actions;

// Export reducer
export default assessmentSlice.reducer;