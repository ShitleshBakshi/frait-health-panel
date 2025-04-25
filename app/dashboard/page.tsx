"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { withAuth } from "@/components/with-auth"
import { UserRole } from "@/lib/auth-context"

function DashboardPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 bg-gray-50">
                    <DashboardContent />
                </main>
            </div>
        </div>
    )
}

// Use the UserRole enum for allowed roles
export default withAuth (DashboardPage, [
    UserRole.HEALTH_VISITOR,
    UserRole.ASSISTANT_HEALTH_VISITOR,
    UserRole.MANAGER,
    UserRole.ADMIN
])

