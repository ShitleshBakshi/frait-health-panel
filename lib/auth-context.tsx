"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {useDispatch, useSelector} from "react-redux"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import {RootState} from "@/lib/store";
import {
    setUser,
    clearUser,
    assignFamilyToAssistant,
    addPendingAssessment as addPendingAssessmentAction,
    removeAssessment,
    FIXED_ASSISTANT_ID
} from "@/lib/slices/userSlice"

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

    // Create user object if we have an ID
    const user = reduxUser.id ? {
        id: reduxUser.id,
        username: reduxUser.username,
        role: reduxUser.role,
        healthBoard: reduxUser.healthBoard
    } : null;

    const ASSISTANT_USERNAME = "Sarah Johnson"

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

        // Use fixed ID for Assistant Health Visitor
        let userId: string;
        let username: string;

        if (role === "Assistant Health Visitor") {
            userId = FIXED_ASSISTANT_ID;
            username = ASSISTANT_USERNAME;
        } else {
            // Generate random ID for other roles
            userId = `user_${Math.floor(Math.random() * 10000)}`;
            username = `Example ${role}`;
        }

        const newUser: User = {
            id: userId,
            username: `Example ${role}`,
            role: roleMap[role],
            healthBoard: "Swansea Uni Health Board"
        }

        // Update Redux store only
        dispatch(setUser({
            id: newUser.id,
            username: newUser.username,
            role: newUser.role,
            healthBoard: newUser.healthBoard
        }))

        return newUser
    }

    const logout = () => {
        // Clear Redux store only
        dispatch(clearUser())
    }

    // Family assignment functions using Redux
    const assignFamily = (familyId: string, assistantId: string) => {
        dispatch(assignFamilyToAssistant({ familyId, assistantId }))
    }

    const isAssignedFamily = (familyId: string) => {
        if (!user) return false

        // Health Visitors and others can see all families
        if (user.role !== "Assistant Health Visitor") return true

        // For Assistant Health Visitors, check if this family is assigned
        return !!reduxUser.assignedFamilies[FIXED_ASSISTANT_ID]?.includes(familyId);

    }

    const getAssignedFamilies = () => {
        // if (!user) return [];
        //
        // // Assistant Health Visitors only see their assigned families
        // if (user.role === "Assistant Health Visitor") {
        //     // Get only families assigned to the CURRENT Assistant Health Visitor
        //     const currentUserAssignments = reduxUser.assignedFamilies[user.id] || [];
        //
        //     // Make sure we're returning an array
        //     return Array.isArray(currentUserAssignments)
        //         ? currentUserAssignments
        //         : [];
        // }

        // Others can see all families
        return reduxUser.assignedFamilies[FIXED_ASSISTANT_ID] || [];
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
                selectRole,
                logout,
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