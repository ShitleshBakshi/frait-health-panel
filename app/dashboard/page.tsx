"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { withAuth } from "@/components/with-auth"

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

export default withAuth(DashboardPage, ["super_admin"])

