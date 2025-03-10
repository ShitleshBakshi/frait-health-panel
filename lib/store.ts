import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from "./slices/userSlice";
import familyReducer from "./slices/familySlice";
import registrationReducer from "./slices/registrationSlice";
import assessmentReducer from "./slices/assessmentSlice";

// Define persist configuration type
interface PersistConfig {
    key: string;
    storage: typeof storage;
    whitelist: string[];
}

// Persist configuration
const persistConfig: PersistConfig = {
    key: 'root',
    storage,
    whitelist: ['user', 'family'],
};

// Combine reducers
const rootReducer = combineReducers({
    user: userReducer,
    family: familyReducer,
    registration: registrationReducer,
    assessment: assessmentReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with proper middleware setup
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;