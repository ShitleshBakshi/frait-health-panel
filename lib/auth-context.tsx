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
import { useRouter } from "next/navigation"

// Define the User Role type to exactly match the backend
export enum UserRole {
    ADMIN = "POW_EFRAIT_Admins",
    MANAGER = "POW_EFRAIT_Managers",
    HEALTH_VISITOR = "POW_EFRAIT_HealthVisitors",
    ASSISTANT_HEALTH_VISITOR = "POW_EFRAIT_AssistantHealthVisitors"
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
    isUnauthorized: boolean
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
    const router = useRouter()
    // Get user data from Redux store
    const reduxUser = useSelector((state: RootState) => state.user)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isUnauthorized, setIsUnauthorized] = useState(false)

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
                setIsUnauthorized(false);

                // MSAL authentication flow
                if (accounts.length > 0) {
                    // Account exists, try to get token silently
                    try {
                        const response = await instance.acquireTokenSilent({
                            ...loginRequest,
                            account: accounts[0]
                        });

                        if (response) {
                            // Send the token to our backend for validation
                            const backendResponse = await validateTokenWithBackend(response.accessToken);

                            if (backendResponse.success) {
                                const userData = backendResponse.user;
                                
                                // Map the role string from backend to UserRole enum
                                const mapBackendRoleToEnum = (roleString: string): UserRole | null => {
                                    switch (roleString) {
                                        case "Admin":
                                            return UserRole.ADMIN;
                                        case "Manager":
                                            return UserRole.MANAGER;
                                        case "Health Visitor":
                                            return UserRole.HEALTH_VISITOR;
                                        case "Assistant Health Visitor":
                                            return UserRole.ASSISTANT_HEALTH_VISITOR;
                                        default:
                                            console.error(`Unauthorized: Unknown role from backend: ${roleString}`);
                                            return null;
                                    }
                                };

                                const mappedRole = mapBackendRoleToEnum(userData.role);
                                
                                if (!mappedRole) {
                                    // No valid role found - user is unauthorized
                                    setIsUnauthorized(true);
                                    dispatch(clearUser());
                                    router.push('/unauthorised');
                                    return;
                                }

                                dispatch(setUser({
                                    id: userData.id,
                                    username: userData.name,
                                    role: mappedRole,
                                    healthBoard: "Powys Health Board"
                                }));
                               
                                setError(null);
                            } else {
                                throw new Error("Failed to validate token with backend");
                            }
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
    }, [dispatch, instance, accounts, router]);

    // Function to validate token with backend
    const validateTokenWithBackend = async (token: string) => {
        try {
            const response = await fetch('/api/auth/msal/validate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error validating token: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Token validation error:", error);
            throw error;
        }
    };

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

    return (
        <AuthContext.Provider
            value={{
                user,
                logout,
                isLoading,
                error,
                isUnauthorized,
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