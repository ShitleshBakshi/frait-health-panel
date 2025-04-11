"use client"

import { Loader2 } from "lucide-react"

export function AuthLoading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <h2 className="text-center text-2xl font-semibold text-gray-900">
                    Authenticating...
                </h2>
                <p className="text-center text-sm text-gray-600">
                    Please wait while we log you in automatically
                </p>
            </div>
        </div>
    )
}