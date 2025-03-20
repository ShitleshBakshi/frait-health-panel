"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { FamilyAssessment } from "@/components/family-assessment"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AssessmentPage({ params, searchParams }: {
    params: { id: number; assessid: string };
    searchParams?: { mode?: string }
}) {
    // Implement authentication directly instead of using withAuth
    const { user } = useAuth()
    const router = useRouter()

    // Handle authentication directly in the component
    useEffect(() => {
        if (!user) {
            router.push("/")
        } else if (user.role !== "super_admin") {
            router.push("/unauthorized")
        }
    }, [user, router])

    // Return null while checking auth or if not authorized
    if (!user || user.role !== "super_admin") {
        return null
    }

    // Determine if we're in view mode based on the search params
    const mode = searchParams?.mode === "view" ? "view" : "edit";


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