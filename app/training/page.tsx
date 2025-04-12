"use client"

import {Header} from "@/components/header"
import {Sidebar} from "@/components/sidebar"
import {TrainingContent} from "@/components/training-content"
import {withAuth} from "@/components/with-auth"
import {UserRole} from "@/lib/auth-context";

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

export default withAuth(TrainingPage, [UserRole.HEALTH_VISITOR, UserRole.ASSISTANT_HEALTH_VISITOR, UserRole.MANAGER, UserRole.ADMIN])

