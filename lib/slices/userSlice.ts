import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface UserState {
    id: string
    username: string
    role: "super_admin" | "restricted_user"
    healthBoard: string
}

const initialState: UserState = {
    id: "",
    username: "",
    role: "restricted_user",
    healthBoard: "",
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserState>) => {
            return { ...state, ...action.payload }
        },
        clearUser: () => initialState,
    },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer

