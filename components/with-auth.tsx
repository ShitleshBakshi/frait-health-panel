"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { useMsal } from "@azure/msal-react"
import { loginRequest } from "@/lib/msal-config"

export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    allowedRoles: UserRole[]
) {
    return function AuthenticatedComponent(props: any) {
        const { user, isLoading } = useAuth()
        const router = useRouter()

        // Check if authentication is enabled
        const isAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTHENTICATION === 'true';

        // Only use MSAL hooks if authentication is enabled
        let instance: any = null;
        let accounts: any[] = [];
        
        if (isAuthEnabled) {
            try {
                const msalData = useMsal();
                instance = msalData.instance;
                accounts = msalData.accounts;
            } catch (error) {
                // MSAL hooks not available, which is expected when auth is disabled
                console.debug('MSAL hooks not available, authentication is disabled');
            }
        }

        useEffect(() => {
            const checkAuth = async () => {
                if (isLoading) return

                // If authentication is disabled, skip all checks
                if (!isAuthEnabled) {
                    return;
                }

                // MSAL authentication flow
                if (accounts.length === 0) {
                    try {
                        await instance.loginRedirect(loginRequest)
                        return
                    } catch (error) {
                        console.error("MSAL login failed:", error)
                        router.push("/login")
                        return
                    }
                }

                // If there's no user in our context, redirect to root for initialization
                if (!user) {
                    router.push("/")
                    return
                }

                // If user has a role but it's not in the allowed roles, redirect to unauthorised
                if (user.role && !allowedRoles.includes(user.role)) {
                    // Pass the required role information to the unauthorised page
                    const requiredRoleParam = allowedRoles.length === 1 
                        ? `?requiredRole=${allowedRoles[0]}` 
                        : ""
                    router.push(`/unauthorised${requiredRoleParam}`)
                }
            }

            checkAuth()
        }, [user, router, isLoading, instance, accounts, isAuthEnabled])

        // If authentication is disabled, render component directly
        if (!isAuthEnabled) {
            return <WrappedComponent {...props} />
        }

        // Show nothing during loading state
        if (isLoading) {
            return null
        }

        // Don't render anything during the authentication check
        if (!user || accounts.length === 0) {
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
export function useRoleAuth(requiredRole: UserRole) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    // Check if authentication is enabled
    const isAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTHENTICATION === 'true';

    // Only use MSAL hooks if authentication is enabled
    let instance: any = null;
    let accounts: any[] = [];
    
    if (isAuthEnabled) {
        try {
            const msalData = useMsal();
            instance = msalData.instance;
            accounts = msalData.accounts;
        } catch (error) {
            // MSAL hooks not available, which is expected when auth is disabled
            console.debug('MSAL hooks not available, authentication is disabled');
        }
    }

    useEffect(() => {
        const checkAuth = async () => {
            // Don't redirect during loading
            if (isLoading) return

            // If authentication is disabled, skip all checks
            if (!isAuthEnabled) {
                return;
            }

            // MSAL authentication flow
            if (accounts.length === 0) {
                try {
                    await instance.loginRedirect(loginRequest)
                    return
                } catch (error) {
                    console.error("MSAL login failed:", error)
                    router.push("/login")
                    return
                }
            }

            // If no user in context, redirect to root
            if (!isLoading && !user) {
                router.push("/")
                return
            }

            // If wrong role, redirect to unauthorised with role information
            if (!isLoading && user && user.role !== requiredRole) {
                router.push(`/unauthorised?requiredRole=${requiredRole}`)
            }
        }

        checkAuth()
    }, [user, router, requiredRole, isLoading, instance, accounts, isAuthEnabled])

    const isAuthenticated = isAuthEnabled ? accounts.length > 0 : true;

    return {
        isAuthorized: isAuthEnabled ? (user && user.role === requiredRole && isAuthenticated) : true,
        isLoading: isLoading
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

    // Check if authentication is enabled
    const isAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTHENTICATION === 'true';

    // Only use MSAL hooks if authentication is enabled
    let instance: any = null;
    let accounts: any[] = [];
    
    if (isAuthEnabled) {
        try {
            const msalData = useMsal();
            instance = msalData.instance;
            accounts = msalData.accounts;
        } catch (error) {
            // MSAL hooks not available, which is expected when auth is disabled
            console.debug('MSAL hooks not available, authentication is disabled');
        }
    }

    useEffect(() => {
        const checkAuth = async () => {
            // Don't redirect during loading
            if (isLoading) return

            // If authentication is disabled, skip all checks
            if (!isAuthEnabled) {
                return;
            }

            // MSAL authentication flow
            if (accounts.length === 0) {
                try {
                    await instance.loginRedirect(loginRequest)
                    return
                } catch (error) {
                    console.error("MSAL login failed:", error)
                    router.push("/login")
                    return
                }
            }

            // If no user in context, redirect to root
            if (!isLoading && !user) {
                router.push("/")
                return
            }

            // If user has a role that's not in allowed roles, redirect with role information
            if (!isLoading && user && user.role && !allowedRoles.includes(user.role)) {
                // For multiple roles, we don't specify a single required role
                const rolesParam = allowedRoles.length === 1 
                    ? `?requiredRole=${allowedRoles[0]}` 
                    : ""
                router.push(`/unauthorised${rolesParam}`)
            }
        }

        checkAuth()
    }, [user, router, allowedRoles, isLoading, instance, accounts, isAuthEnabled])

    const isAuthenticated = isAuthEnabled ? accounts.length > 0 : true;

    return {
        isAuthorized: isAuthEnabled ? (user && user.role ? allowedRoles.includes(user.role) && isAuthenticated : false) : true,
        isLoading: isLoading
    }
}



