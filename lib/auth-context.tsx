"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

// Define the User Role type for the application
export type UserRole = "Health Visitor" | "Assistant Health Visitor" | "Manager" | "Admin"

// User interface for auth context
export type User = {
    id: string
    username: string
    role: UserRole
    healthBoard: string
    // For Assistant Health Visitors, track their assigned families
    assignedFamilies?: string[]
}

// Create a Redux slice for user state - incorporated from userSlice.ts
export const userSlice = createSlice({
    name: "user",
    initialState: {
        id: "",
        username: "",
        role: "Assistant Health Visitor" as UserRole,
        healthBoard: "",
    },
    reducers: {
        setUser: (state, action: PayloadAction<{
            id: string;
            username: string;
            role: UserRole;
            healthBoard: string;
        }>) => {
            return { ...state, ...action.payload }
        },
        clearUser: (state) => {
            state.id = ""
            state.username = ""
            state.role = "Assistant Health Visitor"
            state.healthBoard = ""
        },
    },
})

// Export the Redux actions
export const { setUser, clearUser } = userSlice.actions

// Define the interface for auth context
type AuthContextType = {
    user: User | null
    selectRole: (role: string) => Promise<User>
    logout: () => void
    assignFamily: (familyId: string, assistantId: string) => void
    isAssignedFamily: (familyId: string) => boolean
    getAssignedFamilies: () => string[]
    getPendingAssessments: () => Array<{id: string, familyId: string, assistantId: string}>
    approveAssessment: (assessmentId: string) => void
    rejectAssessment: (assessmentId: string) => void
    addPendingAssessment: (assessmentId: string, familyId: string) => void
}

// Interface for pending assessments
interface PendingAssessment {
    id: string
    familyId: string
    assistantId: string
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
    const [user, setUserState] = useState<User | null>(null)
    const [assignedFamilies, setAssignedFamilies] = useState<Record<string, string[]>>({})
    const [pendingAssessments, setPendingAssessments] = useState<PendingAssessment[]>([])

    useEffect(() => {
        // Check for existing session
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            setUserState(parsedUser)

            // Also update Redux store
            dispatch(setUser({
                id: parsedUser.id,
                username: parsedUser.username,
                role: parsedUser.role,
                healthBoard: parsedUser.healthBoard
            }))
        }

        // Load assignments and pending assessments from localStorage
        const storedAssignments = localStorage.getItem("assignedFamilies")
        if (storedAssignments) {
            setAssignedFamilies(JSON.parse(storedAssignments))
        }

        const storedPendingAssessments = localStorage.getItem("pendingAssessments")
        if (storedPendingAssessments) {
            setPendingAssessments(JSON.parse(storedPendingAssessments))
        }
    }, [dispatch])

    const selectRole = async (role: string): Promise<User> => {
        const roleMap: Record<string, UserRole> = {
            "Health Visitor": "Health Visitor",
            "Assistant Health Visitor": "Assistant Health Visitor",
            "Manager": "Manager",
            "Admin": "Admin"
        }

        if (!roleMap[role]) {
            throw new Error("Invalid role selected")
        }

        // Generate a random ID for the user
        const userId = `user_${Math.floor(Math.random() * 10000)}`

        const newUser: User = {
            id: userId,
            username: `Example ${role}`,
            role: roleMap[role],
            healthBoard: "Swansea Uni Health Board"
        }

        // Update local state
        setUserState(newUser)

        // Update Redux store
        dispatch(setUser({
            id: newUser.id,
            username: newUser.username,
            role: newUser.role,
            healthBoard: newUser.healthBoard
        }))

        // Store in localStorage
        localStorage.setItem("user", JSON.stringify(newUser))

        return newUser
    }

    const logout = () => {
        // Clear local state
        setUserState(null)

        // Clear Redux store
        dispatch(clearUser())

        // Clear from localStorage
        localStorage.removeItem("user")
    }

    // Family assignment functions
    const assignFamily = (familyId: string, assistantId: string) => {
        const newAssignments = { ...assignedFamilies }

        // Initialize if this assistant doesn't have assignments yet
        if (!newAssignments[assistantId]) {
            newAssignments[assistantId] = []
        }

        // Add the family if not already assigned
        if (!newAssignments[assistantId].includes(familyId)) {
            newAssignments[assistantId].push(familyId)
            setAssignedFamilies(newAssignments)
            localStorage.setItem("assignedFamilies", JSON.stringify(newAssignments))
        }
    }

    const isAssignedFamily = (familyId: string) => {
        if (!user) return false

        // Health Visitors and others can see all families
        if (user.role !== "Assistant Health Visitor") return true

        // For Assistant Health Visitors, check if this family is assigned
        return assignedFamilies[user.id]?.includes(familyId) || false
    }

    const getAssignedFamilies = () => {
        if (!user) return []

        // Assistant Health Visitors only see their assigned families
        if (user.role === "Assistant Health Visitor") {
            return assignedFamilies[user.id] || []
        }

        // Others can see all families
        return []
    }

    // Assessment approval functions
    const getPendingAssessments = () => {
        return pendingAssessments
    }

    const approveAssessment = (assessmentId: string) => {
        // Remove from pending and update storage
        const updatedPending = pendingAssessments.filter(a => a.id !== assessmentId)
        setPendingAssessments(updatedPending)
        localStorage.setItem("pendingAssessments", JSON.stringify(updatedPending))
    }

    const rejectAssessment = (assessmentId: string) => {
        // Same logic as approve for now, but could add rejection reason, etc.
        const updatedPending = pendingAssessments.filter(a => a.id !== assessmentId)
        setPendingAssessments(updatedPending)
        localStorage.setItem("pendingAssessments", JSON.stringify(updatedPending))
    }

    // Add a pending assessment (to be called from Send for Approval button)
    const addPendingAssessment = (assessmentId: string, familyId: string) => {
        if (!user) return

        const newPending = [
            ...pendingAssessments,
            { id: assessmentId, familyId, assistantId: user.id }
        ]

        setPendingAssessments(newPending)
        localStorage.setItem("pendingAssessments", JSON.stringify(newPending))
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                selectRole,
                logout,
                assignFamily,
                isAssignedFamily,
                getAssignedFamilies,
                getPendingAssessments,
                approveAssessment,
                rejectAssessment,
                addPendingAssessment
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}