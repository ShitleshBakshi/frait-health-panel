"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Unauthorized Access</h1>
                <p className="text-xl text-gray-600 mb-8">You do not have permission to access this page.</p>
                <Link href="/dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">Return to Dashboard</Button>
                </Link>
            </div>
        </div>
    )
}

