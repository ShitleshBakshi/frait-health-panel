"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function UnauthorizedPage() {
    const router = useRouter()
    const { user, logout } = useAuth()

    // If no user, redirect to home/login
    useEffect(() => {
        if (!user) {
            router.push("/")
        }
    }, [user, router])

    const handleLogout = () => {
        logout()
        router.push("/")
    }

    const handleGoHome = () => {
        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-[#1e2756] text-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center h-16">
                        <div className="h-10 w-24 relative">
                            <div className="text-xl font-bold">FRAIT</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <AlertTriangle className="h-12 w-12 text-orange-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Unauthorized Access</CardTitle>

                            You don't have permission to access this page with your current role: {user?.role}

                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600 text-center">
                            Please select a different role or return to the dashboard.
                        </p>
                        <div className="flex flex-col space-y-2">
                            <Button
                                onClick={handleGoHome}
                                className="w-full bg-[#1e56b0] hover:bg-[#1a4c9e]"
                            >
                                Return to Dashboard
                            </Button>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="w-full"
                            >
                                Change Role
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}