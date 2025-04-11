"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/auth-context"

export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    allowedRoles: UserRole[]
) {
    return function AuthenticatedComponent(props: any) {
        const { user, isLoading } = useAuth()
        const router = useRouter()

        useEffect(() => {

            if (isLoading) return

            // If there's no user, redirect to the role selection page
            if (!user) {
                router.push("/")
                return
            }

            // If user has a role but it's not in the allowed roles, redirect to unauthorized
            if (user.role && !allowedRoles.includes(user.role)) {
                router.push("/unauthorized")
            }
        }, [user, router, isLoading])

        // Show nothing during loading state
        if (isLoading) {
            return null
        }

        // Don't render anything during the authentication check
        // This prevents the flash of unauthorized content
        if (!user) {
            return null
        }

        // If user has a role but it's not allowed, don't render the component
        if (user.role && !allowedRoles.includes(user.role)) {
            return null
        }

        // If we get here, user is authenticated and authorized
        return <WrappedComponent {...props} />
    }
}

/**
 * Custom hook for direct component-level authorization
 *
 * @param requiredRole A specific role required for access
 * @returns Object with isAuthorized flag to check in your component
 */
export function useRoleAuth(requiredRole: UserRole ) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {

        // Don't redirect during loading
        if (isLoading) return

        // If no user, redirect to login
        if (!isLoading && !user) {
            router.push("/")
            return
        }

        // If wrong role, redirect to unauthorized
        if (!isLoading && user && user.role !== requiredRole) {
            router.push("/unauthorized")
        }
    }, [user, router, requiredRole, isLoading])

    return {
        isAuthorized: user && user.role === requiredRole,
        isLoading
    }
}

/**
 * Custom hook for checking against multiple allowed roles
 *
 * @param allowedRoles Array of roles that can access the component
 * @returns Object with isAuthorized flag to check in your component
 */
export function useMultiRoleAuth(allowedRoles: UserRole[]) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Don't redirect during loading
        if (isLoading) return

        // If no user, redirect to login
        if (!isLoading && !user) {
            router.push("/")
            return
        }

        // If user has a role that's not in allowed roles, redirect
        if (!isLoading && user && user.role && !allowedRoles.includes(user.role)) {
            router.push("/unauthorized")
        }
    }, [user, router, allowedRoles, isLoading])

    return {
        isAuthorized: user && user.role ? allowedRoles.includes(user.role) : false,
        isLoading
    }
}