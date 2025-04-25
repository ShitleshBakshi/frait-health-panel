"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { getLandingPageByRole } from "@/lib/utils"

export default function UnauthorizedPage() {
    const { user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [landingPage, setLandingPage] = useState("/dashboard")
    
    // Get the required role from query params if available
    const requiredRole = searchParams.get("requiredRole")
    
    useEffect(() => {
        // If user is authenticated, determine their landing page
        if (user) {
            const userLandingPage = getLandingPageByRole(user.role)
            setLandingPage(userLandingPage)
        }
    }, [user])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="text-center max-w-md px-4">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Unauthorized Access</h1>
                <p className="text-xl text-gray-600 mb-4">You do not have permission to access this page.</p>
                
                {requiredRole && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                        <p className="text-amber-800">
                            This page requires <strong>{requiredRole}</strong> role access.
                            {user && (
                                <> Your current role is <strong>{user.role}</strong>.</>
                            )}
                        </p>
                    </div>
                )}
                
                <div className="space-y-4">
                    <Link href={landingPage}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                            Go to {user?.role || "Dashboard"}
                        </Button>
                    </Link>
                    
                    <p className="text-sm text-gray-500">
                        If you believe you should have access to this page, please contact your system administrator.
                    </p>
                </div>
            </div>
        </div>
    )
}

