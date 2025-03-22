import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { FamilyAssessment } from "@/components/family-assessment"

export default function NewAssessmentPage({ params }: { params: { id: number } }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 bg-gray-50">
                    <FamilyAssessment familyId={params.id} />
                </main>
            </div>
        </div>
    )
}

