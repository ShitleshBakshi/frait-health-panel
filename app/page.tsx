"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AuthLoading } from "@/components/auth-loading"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getLandingPageByRole } from "@/lib/utils"

export default function RootPage() {
    const router = useRouter()
    const { user, isLoading, error, isUnauthorized } = useAuth()

    useEffect(() => {
        console.log('RootPage useEffect - Debug info:', {
            isLoading,
            user: user ? { id: user.id, role: user.role } : null,
            error,
            isUnauthorized
        });

        // Don't do anything while loading
        if (isLoading) {
            console.log('Still loading, waiting...');
            return;
        }

        // If unauthorized, the auth context will handle redirect
        if (isUnauthorized) {
            console.log('User is unauthorized');
            return;
        }

        // If user is authenticated, redirect to role-specific landing page
        if (user) {
            const landingPage = getLandingPageByRole(user.role)
            console.log('User found, redirecting to:', landingPage);
            router.push(landingPage)
        } else {
            // No user and not loading - redirect to login
            console.log('No user found, redirecting to login');
            router.push('/login')
        }
    }, [user, router, isLoading, isUnauthorized])

    // Show loading state while authenticating
    if (isLoading) {
        console.log('Rendering AuthLoading component');
        return <AuthLoading />
    }

    // Show error if authentication failed
    if (error) {
        console.log('Rendering error state:', error);
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Authentication Error</h2>
                    </div>
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <p className="text-center text-sm text-gray-600">
                        Please contact your system administrator for assistance.
                    </p>
                </div>
            </div>
        )
    }

    // Show loading while redirecting
    console.log('Rendering final AuthLoading component');
    return <AuthLoading />
}