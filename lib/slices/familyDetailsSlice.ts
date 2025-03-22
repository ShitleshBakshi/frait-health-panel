import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define types matching backend models
export interface ParentInfo {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    relationToChild: string;
    educationLevel: string;
    parentalResponsibility: boolean;
    informationProvider: boolean;
}

export interface ChildInfo {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    supportParent?: boolean;
    supportParentFirstName?: string;
    supportParentLastName?: string;
}

// State structure for family details
interface FamilyDetailsState {
    familyId: string | null;
    mainParent: ParentInfo | null;
    supportingParents: ParentInfo[];
    children: ChildInfo[];
    isSaving: boolean;
    error: string | null;
    lastSaved: string | null;
}

// Initial state
const initialState: FamilyDetailsState = {
    familyId: null,
    mainParent: null,
    supportingParents: [],
    children: [],
    isSaving: false,
    error: null,
    lastSaved: null
};

// Create the slice
const familyDetailsSlice = createSlice({
    name: "familyDetails",
    initialState,
    reducers: {
        // Set family ID
        setFamilyId: (state, action: PayloadAction<string>) => {
            state.familyId = action.payload;
        },

        // Main parent actions
        setMainParent: (state, action: PayloadAction<ParentInfo>) => {
            state.mainParent = action.payload;
        },
        updateMainParent: (state, action: PayloadAction<Partial<ParentInfo>>) => {
            if (state.mainParent) {
                state.mainParent = { ...state.mainParent, ...action.payload };
            }
        },
        removeMainParent: (state) => {
            state.mainParent = null;
        },

        // Supporting parent actions
        addSupportingParent: (state, action: PayloadAction<ParentInfo>) => {
            state.supportingParents.push(action.payload);
        },
        updateSupportingParent: (state, action: PayloadAction<{ id: number, data: Partial<ParentInfo> }>) => {
            const { id, data } = action.payload;
            if (id >= 0 && id < state.supportingParents.length) {
                state.supportingParents[id] = { ...state.supportingParents[id], ...data };
            }
        },
        removeSupportingParent: (state, action: PayloadAction<number>) => {
            state.supportingParents = state.supportingParents.filter((_, index) => index !== action.payload);
        },
        resetSupportingParents: (state) => {
            state.supportingParents = [];
        },
        setSupportingParents: (state, action: PayloadAction<ParentInfo[]>) => {
            state.supportingParents = action.payload;
        },


        // Child actions
        addChild: (state, action: PayloadAction<ChildInfo>) => {
            state.children.push(action.payload);
        },
        updateChild: (state, action: PayloadAction<{ id: number, data: Partial<ChildInfo> }>) => {
            const { id, data } = action.payload;
            if (id >= 0 && id < state.children.length) {
                state.children[id] = { ...state.children[id], ...data };
            }
        },
        removeChild: (state, action: PayloadAction<number>) => {
            state.children = state.children.filter((_, index) => index !== action.payload);
        },

        resetChildren: (state) => {
            state.children = [];
        },
        setChildren: (state, action: PayloadAction<ChildInfo[]>) => {
            state.children = action.payload;
        },

        // Status actions
        setSaving: (state, action: PayloadAction<boolean>) => {
            state.isSaving = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setLastSaved: (state, action: PayloadAction<string>) => {
            state.lastSaved = action.payload;
        },

        // Set complete family details
        setFamilyDetails: (state, action: PayloadAction<{
            id: string;
            mainParent: ParentInfo;
            supportingParent: ParentInfo;
            child: ChildInfo;
        }>) => {
            const { id, mainParent, supportingParent, child } = action.payload;
            state.familyId = id;
            state.mainParent = mainParent;
            state.supportingParents = [supportingParent];
            state.children = [child];
        },


        // Reset the entire state
        resetFamilyDetails: () => initialState
    }
});

// Export actions
export const {
    setFamilyId,
    setMainParent,
    updateMainParent,
    removeMainParent,
    addSupportingParent,
    updateSupportingParent,
    removeSupportingParent,
    resetSupportingParents,
    setSupportingParents,
    addChild,
    updateChild,
    removeChild,
    resetChildren,
    setChildren,
    setSaving,
    setError,
    setLastSaved,
    setFamilyDetails,
    resetFamilyDetails
} = familyDetailsSlice.actions;

// Export reducer
export default familyDetailsSlice.reducer;