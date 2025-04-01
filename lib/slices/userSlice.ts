import {createAction, createSlice, type PayloadAction} from "@reduxjs/toolkit"
import { UserRole } from "@/lib/auth-context"

interface PendingAssessment {
    id: string
    familyId: string
    assistantId: string
}

export const FIXED_ASSISTANT_ID = "user2";

interface UserState {
    id: string
    username: string
    role: UserRole
    healthBoard: string
    assignedFamilies: Record<string, string[]> // Map assistantId to array of familyIds
    pendingAssessments: PendingAssessment[]
}

const initialState: UserState = {
    id: "",
    username: "",
    role: "Assistant Health Visitor" as UserRole,
    healthBoard: "",
    assignedFamilies: {
        [FIXED_ASSISTANT_ID]: []
    },
    pendingAssessments: []
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{
            id: string;
            username: string;
            role: UserRole;
            healthBoard: string;
        }>) => {
            state.id = action.payload.id
            state.username = action.payload.username
            state.role = action.payload.role
            state.healthBoard = action.payload.healthBoard
        },
        clearUser: (state) => {
            // Store the current assigned families
            const preservedAssignments = { ...state.assignedFamilies };

            // Reset the state to initial values
            Object.assign(state, initialState);

            // Restore the preserved family assignments
            state.assignedFamilies = preservedAssignments;
        },
        // Add action to assign a family to an assistant
        assignFamilyToAssistant: (state, action: PayloadAction<{
            familyId: string;
            assistantId: string;
        }>) => {
            const { familyId } = action.payload

            const assistantId = FIXED_ASSISTANT_ID

            // Initialize the array if it doesn't exist
            if (!state.assignedFamilies[assistantId]) {
                state.assignedFamilies[assistantId] = []
            }

            // Add the family if not already assigned
            if (!state.assignedFamilies[assistantId].includes(familyId)) {
                state.assignedFamilies[assistantId].push(familyId)
            }
        },
        // Add action to add a pending assessment
        addPendingAssessment: (state, action: PayloadAction<{
            assessmentId: string;
            familyId: string;
            assistantId: string;
        }>) => {
            state.pendingAssessments.push({
                id: action.payload.assessmentId,
                familyId: action.payload.familyId,
                assistantId: action.payload.assistantId
            })
        },
        // Add action to remove an assessment (approve/reject)
        removeAssessment: (state, action: PayloadAction<string>) => {
            state.pendingAssessments = state.pendingAssessments.filter(
                assessment => assessment.id !== action.payload
            )
        }
    },
})


export const {
    setUser,
    clearUser,
    assignFamilyToAssistant,
    addPendingAssessment,
    removeAssessment
} = userSlice.actions
export default userSlice.reducer

