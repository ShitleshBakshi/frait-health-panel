"use client"

import {Header} from "@/components/header"
import {Sidebar} from "@/components/sidebar"
import {FamiliesContent} from "@/components/families-content"
import {withAuth} from "@/components/with-auth"
import {UserRole} from "@/lib/auth-context";

function FamiliesPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 bg-gray-50">
                    <FamiliesContent />
                </main>
            </div>
        </div>
    )
}

export default withAuth(FamiliesPage, [UserRole.HEALTH_VISITOR, UserRole.ASSISTANT_HEALTH_VISITOR, UserRole.MANAGER, UserRole.ADMIN])

