import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    fetchGraphQL,
    SAVE_FRAT_ASSESSMENT_MUTATION,
    SAVE_FRAI_ASSESSMENT_MUTATION
} from "@/lib/api";
import {
    generateFratPayload,
    generateFraiPayload
} from '@/lib/assessment-mapping-utils';
import type { RootState } from "@/lib/store";
import { setLoading, setError } from "@/lib/slices/assessmentSlice";

/**
 * Save assessment data to the backend
 * This thunk performs two operations:
 * 1. Saves the detailed FRAT assessment items
 * 2. Saves the calculated FRAI assessment scores
 */
export const saveAssessmentToBackend = createAsyncThunk(
    'assessment/saveToBackend',
    async (assessmentNumber: number, { getState, dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true));
            const state = getState() as RootState;
            const { mainParentAssessment,
                    supportingParentAssessment,
                    childAssessment,
                    externalInfluenceAssessment,
                    familyId} = state.assessment.currentAssessment;

            if (!familyId) {
                throw new Error("No family ID available for the assessment");
            }

            // Step 1: Generate FRAT payload using the utility function
            const fratVariables = generateFratPayload(
                familyId,
                mainParentAssessment,
                supportingParentAssessment,
                childAssessment,
                externalInfluenceAssessment,
                assessmentNumber
            );

            // Step 2: Save FRAT assessment
            const fratResult = await fetchGraphQL(SAVE_FRAT_ASSESSMENT_MUTATION, {fratAssessmentInput: fratVariables});

            if (!fratResult.createFratAssessment) {
                throw new Error("Failed to save FRAT assessment");
            }

            // Step 3: Generate and save FRAI scores using the utility function
            const fraiVariables = generateFraiPayload(
                familyId,
                assessmentNumber.toString(),
                mainParentAssessment,
                externalInfluenceAssessment,

            );

            const fraiResult = await fetchGraphQL(SAVE_FRAI_ASSESSMENT_MUTATION, fraiVariables);

            if (!fraiResult.createInitialFraiAssessment) {
                throw new Error("Failed to save FRAI assessment");
            }

            dispatch(setLoading(false));
            return {
                success: true,
                fratSaved: true,
                fraiSaved: true,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error instanceof Error ? error.message : "Failed to save assessment"));
            return rejectWithValue(error instanceof Error ? error.message : "Failed to save assessment");

        }
    }
);

/**
 * Load assessment data from the backend
 * This thunk retrieves both FRAT and FRAI data and converts it to the frontend format
 */
export const loadAssessmentFromBackend = createAsyncThunk(
    'assessment/loadFromBackend',
    async (familyId: number, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true));

            // Query to get both FRAT and FRAI data
            const query = `
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
          getSpecificFraiAssessment(family_id: $familyId, assessment_id: $assessmentId) {
            responsive_parenting
            family_health
            family_engagement
            family_support
            socio_economic
            overall_score
          }
        }
      `;

            const result = await fetchGraphQL(query, { familyId });

            if (!result.getFratAssessmentDetails) {
                throw new Error("Failed to load assessment data");
            }

            // At this point, we would convert the backend data to frontend format
            // This would typically be done with a utility function similar to
            // the ones we're using for saving data

            dispatch(setLoading(false));
            return result;
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error instanceof Error ? error.message : "Failed to load assessment"));
            return rejectWithValue(error instanceof Error ? error.message : "Failed to load assessment");
        }
    }
);

/**
 * Load all FRAI assessments for a family
 */
export const loadFraiAssessmentsForFamily = createAsyncThunk(
    'assessment/loadFraiAssessments',
    async (familyId: number, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true));

            const query = `
                query GetFraiAssessments($familyId: Int!) {
                    getFraiAssessmentsByFamily(family_id: $familyId) {
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

            const result = await fetchGraphQL(query, { familyId });

            if (!result.getFraiAssessmentsByFamily) {
                throw new Error("Failed to load FRAI assessments");
            }

            dispatch(setLoading(false));
            return result.getFraiAssessmentsByFamily;
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error instanceof Error ? error.message : "Failed to load FRAI assessments"));
            return rejectWithValue(error instanceof Error ? error.message : "Failed to load FRAI assessments");
        }
    }
);