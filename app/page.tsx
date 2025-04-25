"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AuthLoading } from "@/components/auth-loading"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getLandingPageByRole } from "@/lib/utils"

export default function RootPage() {
    const router = useRouter()
    const { user, isLoading, error } = useAuth()

    // Redirect to role-specific landing page if authenticated
    useEffect(() => {
        if (!isLoading && user) {
            // Get the appropriate landing page based on user role
            const landingPage = getLandingPageByRole(user.role)
            router.push(landingPage)
        }
    }, [user, router, isLoading])

    // Show loading state while authenticating
    if (isLoading) {
        return <AuthLoading />
    }

    // Show error if authentication failed
    if (error) {
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

    // Should not reach here, but in case it does, show loading
    return <AuthLoading />
}
