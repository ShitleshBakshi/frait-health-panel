"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { FamilyAssessment } from "@/components/family-assessment"
import { useMultiRoleAuth } from "@/components/with-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AssessmentPage({ params, searchParams }: {
    params: { id: number; assessid: number };
    searchParams?: { mode?: string }
}) {
    // Implement authentication directly instead of using withAuth
    const { isAuthorized, isLoading } = useMultiRoleAuth([
        "Health Visitor",
        "Assistant Health Visitor",
        "Manager",
        "Admin"
    ])

    const router = useRouter()

    // Determine if we're in view mode based on the search params
    const mode = searchParams?.mode === "view" ? "view" : "edit";

    if (isLoading) {
        return null
    }

    // Don't render if not authorized
    if (!isAuthorized) {
        return null
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 bg-gray-50">
                    <FamilyAssessment
                        familyId={params.id}
                        assessmentId={params.assessid}
                        mode={mode}
                    />
                </main>
            </div>
        </div>
    )
}