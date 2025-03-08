import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { FamilyAssessment } from "@/type/assessment"

interface FamilyState {
    assessments: FamilyAssessment[]
}

const initialState: FamilyState = {
    assessments: [],
}

const familySlice = createSlice({
    name: "family",
    initialState,
    reducers: {
        addFamilyAssessment: (state, action: PayloadAction<FamilyAssessment>) => {
            state.assessments.unshift(action.payload)
        },

        updateFamilyAssessment: (state, action: PayloadAction<FamilyAssessment>) => {
            const index = state.assessments.findIndex(
                (assessment) => assessment.id === action.payload.id
            )
            if (index !== -1) {
                state.assessments[index] = action.payload
            }
        },

        // Initialize/replace all assessments (useful when fetching from an API)
        setFamilyAssessments: (state, action: PayloadAction<FamilyAssessment[]>) => {
            state.assessments = action.payload
        },

        // Remove an assessment by ID
        removeFamilyAssessment: (state, action: PayloadAction<string>) => {
            state.assessments = state.assessments.filter(
                (assessment) => assessment.id !== action.payload
            )
        },

        // Clear all assessments
        clearFamilyAssessments: (state) => {
            state.assessments = []
        },
    },
})

export const {
    addFamilyAssessment,
    updateFamilyAssessment,
    setFamilyAssessments,
    removeFamilyAssessment,
    clearFamilyAssessments
} = familySlice.actions

export default familySlice.reducer