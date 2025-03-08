import { configureStore } from "@reduxjs/toolkit"
import userReducer from "./slices/userSlice"
import familyReducer from "./slices/familySlice"
import registrationReducer from "./slices/registrationSlice"

export const store = configureStore({
    reducer: {
        user: userReducer,
        family: familyReducer,
        registration: registrationReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

