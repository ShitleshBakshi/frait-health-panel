import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface RegistrationState {
    username: string
    email: string
    password: string
    confirmPassword: string
    loading: boolean
    error: string | null
}

const initialState: RegistrationState = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    loading: false,
    error: null,
}

export const registerUser = createAsyncThunk("registration/registerUser", async (_, { getState, rejectWithValue }) => {
    const state = getState() as { registration: RegistrationState }
    const { username, email, password, confirmPassword } = state.registration

    if (password !== confirmPassword) {
        return rejectWithValue("Passwords do not match")
    }

    // Here you would typically make an API call to register the user
    // For now, we'll simulate a successful registration
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { username, email }
})

const registrationSlice = createSlice({
    name: "registration",
    initialState,
    reducers: {
        setUsername: (state, action) => {
            state.username = action.payload
        },
        setEmail: (state, action) => {
            state.email = action.payload
        },
        setPassword: (state, action) => {
            state.password = action.payload
        },
        setConfirmPassword: (state, action) => {
            state.confirmPassword = action.payload
        },
        clearForm: (state) => {
            return initialState
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false
                state.error = null
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { setUsername, setEmail, setPassword, setConfirmPassword, clearForm } = registrationSlice.actions
export default registrationSlice.reducer

