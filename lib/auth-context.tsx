"use client"

import type React from "react"
import {createContext, useContext, useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {RootState} from "@/lib/store"
import {
    addPendingAssessment as addPendingAssessmentAction,
    assignFamilyToAssistant,
    clearUser,
    removeAssessment,
    setUser
} from "@/lib/slices/userSlice"
import { useMsal } from "@azure/msal-react"
import { loginRequest } from "@/lib/msal-config"

// Define the User Role type to exactly match the backend
export enum UserRole {
    ADMIN = "Admin",
    MANAGER = "Manager",
    HEALTH_VISITOR = "Health Visitor",
    ASSISTANT_HEALTH_VISITOR = "Assistant Health Visitor"
}

// User interface for auth context
export type User = {
    id: string
    username: string
    email?: string
    role: UserRole
    healthBoard: string
    // For Assistant Health Visitors, track their assigned families
    assignedFamilies?: string[]
}


// Define the interface for auth context
type AuthContextType = {
    user: User | null
    logout: () => void
    isLoading: boolean
    error: string | null
    assignFamily: (familyId: string, assistantId: string) => void
    isAssignedFamily: (familyId: string) => boolean
    getAssignedFamilies: () => string[]
    getPendingAssessments: () => Array<{id: string, familyId: string, assistantId: string}>
    approveAssessment: (assessmentId: string) => void
    rejectAssessment: (assessmentId: string) => void
    addPendingAssessment: (assessmentId: string, familyId: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch()
    // Get user data from Redux store
    const reduxUser = useSelector((state: RootState) => state.user)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Create user object if we have an ID
    const user = reduxUser.id ? {
        id: reduxUser.id,
        username: reduxUser.username,
        role: reduxUser.role as UserRole,
        healthBoard: reduxUser.healthBoard
    }: null;

    // Get MSAL instance
    const { instance, accounts } = useMsal();

    // Auto login when the application starts
    useEffect(() => {
        const attemptLogin = async () => {
            try {
                setIsLoading(true);

                // MSAL authentication flow
                if (accounts.length > 0) {
                    // Account exists, try to get token silently
                    try {
                        const response = await instance.acquireTokenSilent({
                            ...loginRequest,
                            account: accounts[0]
                        });

                        if (response) {
                            const account = response.account;
                            // Map claims to user object
                            const userRole = account.idTokenClaims?.roles?.[0] || UserRole.HEALTH_VISITOR;
                            
                            dispatch(setUser({
                                id: account.localAccountId,
                                username: account.name || '',
                                // email: account.username,
                                role: userRole as UserRole,
                                healthBoard: "Powys Health Board" // This should come from claims
                            }));
                            setError(null);
                            return;
                        }
                    } catch (error) {
                        console.error("Error acquiring token:", error);
                        // Token acquisition failed, redirect to login
                        instance.loginRedirect(loginRequest);
                    }
                } else {
                    // No account found, redirect to login
                    instance.loginRedirect(loginRequest);
                }
            } catch (error) {
                console.error("Authentication error:", error);
                setError("Failed to authenticate. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        attemptLogin();
    }, [dispatch, instance, accounts]);

    const logout = async () => {
        // Clear Redux store
        dispatch(clearUser());
        
        // Logout from MSAL
        instance.logoutRedirect();
    }

    // Family assignment functions using Redux
    const assignFamily = (familyId: string, assistantId: string) => {
        dispatch(assignFamilyToAssistant({ familyId, assistantId }))
    }

    const isAssignedFamily = (familyId: string) => {
        if (!user) return false

        // Health Visitors and others can see all families
        if (user.role !== UserRole.ASSISTANT_HEALTH_VISITOR) return true;

        // For Assistant Health Visitors, check if this family is assigned to them
        return !!reduxUser.assignedFamilies[user.id]?.includes(familyId);

    }

    const getAssignedFamilies = () => {
        if (!user) return [];

        // Assistant Health Visitors only see their assigned families
        if (user.role === UserRole.ASSISTANT_HEALTH_VISITOR) {
            // Get only families assigned to the CURRENT Assistant Health Visitor
            return reduxUser.assignedFamilies[user.id] || [];
        }

        // Health Visitors and managers see all assigned families across all assistants
        if (user.role === UserRole.HEALTH_VISITOR || user.role === UserRole.MANAGER) {
            const allAssignedFamilies: string[] = [];
            Object.values(reduxUser.assignedFamilies).forEach(families => {
                allAssignedFamilies.push(...families);
            });
            return [...new Set(allAssignedFamilies)]; // Remove duplicates
        }
        return [];
    }

    // Assessment approval functions using Redux
    const getPendingAssessments = () => {
        return reduxUser.pendingAssessments
    }

    const approveAssessment = (assessmentId: string) => {
        dispatch(removeAssessment(assessmentId))
    }

    const rejectAssessment = (assessmentId: string) => {
        dispatch(removeAssessment(assessmentId))
    }

    // Add a pending assessment
    const addPendingAssessmentToRedux = (assessmentId: string, familyId: string) => {
        if (!user) return

        dispatch(addPendingAssessmentAction({
            assessmentId,
            familyId,
            assistantId: user.id
        }))
    }

    useEffect(() => {
    }, [reduxUser.assignedFamilies, user?.id]);

    return (
        <AuthContext.Provider
            value={{
                user,
                logout,
                isLoading,
                error,
                assignFamily,
                isAssignedFamily,
                getAssignedFamilies,
                getPendingAssessments,
                approveAssessment,
                rejectAssessment,
                addPendingAssessment: addPendingAssessmentToRedux
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}