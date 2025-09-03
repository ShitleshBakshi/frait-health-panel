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


// Track which families are assigned to which assistants
interface FamilyAssignments {
    [assistantId: string]: string[]; // array of family IDs
}

interface FamilyState {
    families: Family[]
    assessments: FamilyAssessment[]
    currentFamilyId: string | null
    nextFamilyId: number
    loading: boolean
    error: string | null
    familyAssignments: FamilyAssignments
}

const initialState: FamilyState = {
    families: [],
    assessments: [],
    currentFamilyId: null,
    nextFamilyId: 1,
    loading: false,
    error: null,
    familyAssignments: {}
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
        createInitialFamily(input: $input) {
            id
            familyName
            childDob
            nhsNumber
        }
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

export const loadFamilyAssessments = createAsyncThunk(
    'family/loadAssessments',
    async (familyId: number, { rejectWithValue }) => {
        try {
            // Use separate queries for FRAT and FRAI assessments as per backend structure
            const fratQuery = `
                query GetFratAssessments($familyId: Int!) {
                    getFratAssessmentsByFamily(familyId: $familyId) {
                        id
                        assessmentid
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
                }
            `;

            const fraiQuery = `
                query GetFraiAssessments($familyId: Int!) {
                    getFraiAssessmentsByFamily(familyId: $familyId) {
                        id
                        assessmentid
                        responsive_parenting
                        family_health
                        family_engagement
                        family_support
                        socio_economic
                        overall_score
                    }
                }
            `;

            const familyDetailsQuery = `
                query GetFamilyDetails($familyId: Int!) {
                    getFamilyDetails(familyId: $familyId) {
                        id
                        main_parent_first_name
                        main_parent_last_name
                        main_parent_dob
                        main_parent_gender
                        main_parent_relation_to_child
                        main_parent_education_level
                        main_parent_parental_responsibility
                        main_parent_information_provider
                        supporting_parents {
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
                            dob
                            gender
                            support_parent
                            support_parent_first_name
                            support_parent_last_name
                        }
                    }
                }
            `;

            // Execute all queries in parallel
            const [fratResult, fraiResult, familyDetailsResult] = await Promise.all([
                fetchGraphQL(fratQuery, { familyId }).catch(() => ({ getFratAssessmentsByFamily: [] })),
                fetchGraphQL(fraiQuery, { familyId }).catch(() => ({ getFraiAssessmentsByFamily: [] })),
                fetchGraphQL(familyDetailsQuery, { familyId }).catch(() => ({ getFamilyDetails: null }))
            ]);

            // Transform backend data to frontend format
            const fratAssessments = fratResult.getFratAssessmentsByFamily || [];
            const fraiAssessments = fraiResult.getFraiAssessmentsByFamily || [];
            const familyDetails = familyDetailsResult.getFamilyDetails;

            // Create assessments map by assessmentid
            const assessmentMap = new Map();

            // Process FRAT assessments
            fratAssessments.forEach((frat: any) => {
                const assessmentKey = `${familyId}_${frat.assessmentid}`;
                if (!assessmentMap.has(assessmentKey)) {
                    assessmentMap.set(assessmentKey, {
                        id: assessmentKey,
                        familyId: familyId,
                        status: "DONE", // Backend doesn't track status, assume completed
                        assessorHv: "System", // Backend doesn't track assessor
                        reviewerHv: "Pending",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        mainParent: familyDetails ? {
                            firstName: familyDetails.main_parent_first_name,
                            lastName: familyDetails.main_parent_last_name,
                            dateOfBirth: familyDetails.main_parent_dob
                        } : null,
                        supportingParents: familyDetails?.supporting_parents || [],
                        children: familyDetails?.children || [],
                        mainParentAssessment: [],
                        supportingParentAssessment: [],
                        childAssessment: [],
                        externalInfluenceAssessment: []
                    });
                }

                // Map FRAT fields to assessment structure (simplified)
                const assessment = assessmentMap.get(assessmentKey);
                // This is a simplified mapping - you may need to adjust based on your frontend needs
                for (let i = 1; i <= 36; i++) {
                    const fieldName = `assessment_${i}`;
                    if (frat[fieldName]) {
                        assessment.mainParentAssessment.push({
                            id: i,
                            level: frat[fieldName]
                        });
                    }
                }
            });

            // Process FRAI assessments (these contain the calculated scores)
            fraiAssessments.forEach((frai: any) => {
                const assessmentKey = `${familyId}_${frai.assessmentid}`;
                if (!assessmentMap.has(assessmentKey)) {
                    assessmentMap.set(assessmentKey, {
                        id: assessmentKey,
                        familyId: familyId,
                        status: "DONE",
                        assessorHv: "System",
                        reviewerHv: "Pending",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        mainParent: familyDetails ? {
                            firstName: familyDetails.main_parent_first_name,
                            lastName: familyDetails.main_parent_last_name,
                            dateOfBirth: familyDetails.main_parent_dob
                        } : null,
                        supportingParents: familyDetails?.supporting_parents || [],
                        children: familyDetails?.children || [],
                        mainParentAssessment: [],
                        supportingParentAssessment: [],
                        childAssessment: [],
                        externalInfluenceAssessment: []
                    });
                }

                // Add FRAI scores to the assessment
                const assessment = assessmentMap.get(assessmentKey);
                assessment.fraiScores = {
                    responsiveParenting: frai.responsive_parenting,
                    familyHealth: frai.family_health,
                    familyEngagement: frai.family_engagement,
                    familySupport: frai.family_support,
                    socioEconomic: frai.socio_economic,
                    overallScore: frai.overall_score
                };
            });

            return Array.from(assessmentMap.values());
        } catch (error) {
            return rejectWithValue('Failed to load family assessments');
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
                nhsNumber: familyInput.nhsNumber || "Not Provided",
                childDob: familyInput.childDob || "Not Provided"
            };


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
            const exists = state.assessments.some(
                a => a.familyId === action.payload.familyId &&
                    a.id === action.payload.id
            );
            if (!exists) {
                state.assessments.unshift(action.payload);
            }
        },

        updateFamilyAssessment: (state, action: PayloadAction<FamilyAssessment>) => {
            const index = state.assessments.findIndex(
                (assessment) => assessment.familyId === action.payload.familyId && assessment.id === action.payload.id
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
        },

        // Assign a family to an assistant health visitor
        assignFamily: (state, action: PayloadAction<{familyId: string, assistantId: string}>) => {
            const { familyId, assistantId } = action.payload;

            // Initialize array for this assistant if it doesn't exist
            if (!state.familyAssignments[assistantId]) {
                state.familyAssignments[assistantId] = [];
            }

            // Add family if not already assigned
            if (!state.familyAssignments[assistantId].includes(familyId)) {
                state.familyAssignments[assistantId].push(familyId);
            }
        },

        // Unassign a family from an assistant health visitor
        unassignFamily: (state, action: PayloadAction<{familyId: string, assistantId: string}>) => {
            const { familyId, assistantId } = action.payload;

            if (state.familyAssignments[assistantId]) {
                state.familyAssignments[assistantId] = state.familyAssignments[assistantId]
                    .filter(id => id !== familyId);
            }
        },

        // Get all families assigned to an assistant
        getAssignedFamilies: (state, action: PayloadAction<{assistantId: string}>) => {
            // This is a read-only operation but we included it for completeness
            // Actual data retrieval will happen in a selector
            return state;
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
            })

            // Load family assessments
            .addCase(loadFamilyAssessments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadFamilyAssessments.fulfilled, (state, action) => {
                // Merge new assessments with existing ones, avoiding duplicates
                const newAssessments = action.payload;
                newAssessments.forEach((assessment: FamilyAssessment) => {
                    const exists = state.assessments.find(a => a.id === assessment.id);
                    if (!exists) {
                        state.assessments.push(assessment);
                    }
                });
                state.loading = false;
            })
            .addCase(loadFamilyAssessments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
})

// Configure Redux persist
const persistConfig = {
    key: 'family',
    storage,
    whitelist: ['families','assessments', 'familyAssignments']
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
    setError,
    assignFamily,
    unassignFamily,
    getAssignedFamilies
} = familySlice.actions

export default persistedReducer;