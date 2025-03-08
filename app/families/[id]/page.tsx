import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { FamiliesContent } from "@/components/families-content"

export default function FamilyPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 bg-gray-50">
                    <FamiliesContent initialFamilyId={params.id} showAssessments={true} />
                </main>
            </div>
        </div>
    )
}

