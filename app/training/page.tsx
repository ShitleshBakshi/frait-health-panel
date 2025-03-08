"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { TrainingContent } from "@/components/training-content"
import { withAuth } from "@/components/with-auth"

function TrainingPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 bg-gray-50">
                    <TrainingContent />
                </main>
            </div>
        </div>
    )
}

export default withAuth(TrainingPage, ["super_admin", "restricted_user"])

