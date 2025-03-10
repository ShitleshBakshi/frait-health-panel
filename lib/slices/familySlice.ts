import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { FamilyAssessment } from "@/type/assessment"
import { persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"

interface FamilyState {
    assessments: FamilyAssessment[]
    currentFamilyId: string | null
    loading: boolean
    error: string | null
}

const initialState: FamilyState = {
    assessments: [],
    currentFamilyId: null,
    loading: false,
    error: null
}

// Sample assessment data for testing purpose
const sampleAssessment: FamilyAssessment = {
    id: "sample-assessment-1",
    familyId: "3",
    status: "DONE",
    assessorHv: "John Doe",
    reviewerHv: "Jane Smith",
    createdAt: "2023-03-15T10:30:00Z",
    updatedAt: "2023-03-15T15:45:00Z",
    mainParent: {
        id: "parent-1",
        firstName: "Sarah",
        lastName: "Stevens",
        dateOfBirth: "15/06/1985"
    },
    supportingParents: [
        {
            id: "parent-2",
            firstName: "Michael",
            lastName: "Stevens",
            dateOfBirth: "22/09/1982"
        }
    ],
    children: [
        {
            id: "child-1",
            firstName: "Emma",
            lastName: "Stevens",
            dateOfBirth: "10/04/2020",
            gender: "female"
        }
    ],
    mainParentAssessment: [
        { id: 1, level: "low" },
        { id: 2, level: "med" },
        { id: 3, level: "low-med" },
        { id: 4, level: "no-concern" },
        { id: 5, level: "no-concern" },
        { id: 6, level: "low" }
    ],
    externalInfluenceAssessment: [
        { id: 1, level: "low" },
        { id: 2, level: "no-concern" },
        { id: 3, level: "no-concern" },
        { id: 4, level: "low-med" },
        { id: 5, level: "low" },
        { id: 6, level: "no-concern" },
        { id: 7, level: "low" },
        { id: 8, level: "no-concern" },
        { id: 9, level: "low" },
        { id: 10, level: "no-concern" },
        { id: 11, level: "low" },
        { id: 12, level: "no-concern" },
        { id: 13, level: "low-med" },
        { id: 14, level: "no-concern" },
        { id: 15, level: "low" }
    ]
};

const familySlice = createSlice({
    name: "family",
    initialState: {
        ...initialState,
        assessments: [sampleAssessment]
    },
    reducers: {
        setCurrentFamily: (state, action: PayloadAction<string>) => {
            state.currentFamilyId = action.payload;
        },
        addFamilyAssessment: (state, action: PayloadAction<FamilyAssessment>) => {
            const exists = state.assessments.some(a => a.id === action.payload.id);
            if (!exists) {
                state.assessments.unshift(action.payload);
            }
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

        // Set loading state (for async operations)
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        // Set error state
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        }
    },
})

// Configure Redux persist
const persistConfig = {
    key: 'family',
    storage,
    whitelist: ['assessments'] // Only persist the assessments array
};

// Create and export the persisted reducer
const persistedReducer = persistReducer(persistConfig, familySlice.reducer);

export const {
    setCurrentFamily,
    addFamilyAssessment,
    updateFamilyAssessment,
    setFamilyAssessments,
    removeFamilyAssessment,
    clearFamilyAssessments,
    setLoading,
    setError
} = familySlice.actions

export default persistedReducer;