"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type User = {
    id: string
    username: string
    role: "super_admin" | "restricted_user"
    healthBoard?: string
}

type AuthContextType = {
    user: User | null
    login: (username: string, password: string) => Promise<User>
    logout: () => void
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
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        // Check for existing session
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const login = async (username: string, password: string): Promise<User>  => {
        // Mock login logic
        if (username === "admin" && password === "Admin123456789012") {
            const user: User = { id: "1", username: "admin", role: "super_admin", healthBoard: "Swansea Uni Health Board" }
            setUser(user)
            localStorage.setItem("user", JSON.stringify(user))
            return(user)
        } else if (username === "user" && password === "User1234567890123") {
            const user: User = { id: "2", username: "user", role: "restricted_user", healthBoard: "Swansea Uni Health Board" }
            setUser(user)
            localStorage.setItem("user", JSON.stringify(user))
            return user
        } else {
            throw new Error("Invalid credentials")
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("user")
    }

    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

