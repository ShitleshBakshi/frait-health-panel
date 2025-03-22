import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { FamilyAssessment } from "@/type/assessment"
import { persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import {fetchGraphQL} from "@/lib/api";

// Interface for the family input data
interface FamilyInput {
    id: number;
    name: string;
    nhsNumber?: string;
    childDob: string;
    updatedAt: string;
}

// Interface for the family data in the GraphQL input format
interface FamilyGraphQLInput {
    id: number;
    familyName: string;
    nhsNumber: string;
    childDob: string;
}

export interface Family {
    id: number;
    name: string;
    nhsNumber?: string;
    childDob: string;
    updatedAt: string;
}


interface FamilyState {
    families: Family[]
    assessments: FamilyAssessment[]
    currentFamilyId: string | null
    nextFamilyId: number
    loading: boolean
    error: string | null
}

const initialState: FamilyState = {
    families: [],
    assessments: [],
    currentFamilyId: null,
    nextFamilyId: 1,
    loading: false,
    error: null
}

// GraphQL query to fetch families
const GET_FAMILIES_QUERY = `
    query GetInitialFamilies($limit: Int!, $offset: Int!) {
        getInitialFamilyModels(limit: $limit, offset: $offset) {
            id
            familyName
            childDob
            nhsNumber
        }
    }
`;

// GraphQL mutation to add a new family
const ADD_FAMILY_MUTATION = `
    mutation CreateInitialFamily($input: InitialFamilyInput!) {
        createInitialFamily(input: $input)
    }
`;


// Async thunks for fetching families
export const fetchFamilies = createAsyncThunk(
    'family/fetchFamilies',
    async (_, { rejectWithValue }) => {
        try {
            const data = await fetchGraphQL(GET_FAMILIES_QUERY, {
            limit: 100,
            offset: 0
        });

            const families = data.getInitialFamilyModels.map((family: any) => ({
                id: family.id,
                name: family.familyName|| "Unknown Family",
                nhsNumber: family.nhsNumber,
                childDob: family.childDob,
                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
            }));

            return families;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch families');
        }
    }
);


// Async thunks for adding a new family
export const addFamily = createAsyncThunk(
    'family/addFamily',
    async (familyInput: Omit<FamilyInput, 'id'>, { getState, rejectWithValue }) => {
        try {
            // Get the next available ID from the Redux state
            const state = getState() as { family: FamilyState };
            const nextId = state.family.nextFamilyId;

            // Transform input to match backend schema
            const backendInput: FamilyGraphQLInput = {
                id: nextId, // Use the next ID from state
                familyName: familyInput.name,
                nhsNumber: familyInput.nhsNumber || "UNKNOWN",
                childDob: familyInput.childDob
            };

            console.log("Sending to backend:", backendInput); // Debug log

            // GraphQL mutation to add a new family
            const result = await fetchGraphQL(ADD_FAMILY_MUTATION, {
                input: backendInput
            });

            if (!result.createInitialFamily) {
                throw new Error("Failed to create family");
            }

            return {
                id: nextId,
                name: familyInput.name,
                nhsNumber: familyInput.nhsNumber,
                childDob: familyInput.childDob,
                updatedAt: familyInput.updatedAt,
            };
        } catch (error) {
            console.error("Error adding family:", error);
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to add family');
        }
    }
);

// Async thunks for adding multiple families (from Excel)
export const addFamiliesBulk = createAsyncThunk(
    'family/addFamiliesBulk',
    async (familiesInput: FamilyInput[], { rejectWithValue, dispatch }) => {
        try {
            const successfulFamilies: Family[] = [];
            const errors: string[] = [];

            // Process each family
            for (const familyInput of familiesInput) {
                try {
                    const result = await dispatch(addFamily(familyInput)).unwrap();
                    successfulFamilies.push(result);
                } catch (error) {
                    errors.push(`Failed to add family "${familyInput.name}": ${error}`);
                }
            }

            if (errors.length > 0) {
                return rejectWithValue(`${errors.length} families failed to add. ${successfulFamilies.length} were successful.`);
            }

            return successfulFamilies;
        } catch (error) {
            return rejectWithValue('Failed to add families. Network error.');
        }
    }
);

const familySlice = createSlice({
    name: "family",
    initialState,
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
    extraReducers: (builder) => {
        builder
            // Fetch families
            .addCase(fetchFamilies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFamilies.fulfilled, (state, action) => {
                state.families = action.payload;
                // Update nextFamilyId if we have families to avoid ID conflicts
                if (action.payload.length > 0) {
                    // Find the highest ID in the fetched families and add 1
                    const maxId = Math.max(...action.payload.map((family: { id: number; }) => family.id), 0);
                    state.nextFamilyId = maxId + 1;
                }
                state.loading = false;
            })
            .addCase(fetchFamilies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Add single family
            .addCase(addFamily.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addFamily.fulfilled, (state, action) => {
                state.families.unshift(action.payload);
                state.nextFamilyId += 1;
                state.loading = false;
            })
            .addCase(addFamily.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Add multiple families
            .addCase(addFamiliesBulk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addFamiliesBulk.fulfilled, (state, action) => {
                if (Array.isArray(action.payload)) {
                    state.families = [...action.payload, ...state.families];
                }
                state.loading = false;
            })
            .addCase(addFamiliesBulk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
})

// Configure Redux persist
const persistConfig = {
    key: 'family',
    storage,
    whitelist: ['families','assessments']
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