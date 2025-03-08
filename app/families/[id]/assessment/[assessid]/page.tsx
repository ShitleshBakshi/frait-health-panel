import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { FamilyAssessment } from "@/components/family-assessment"

export default function AssessmentPage({ params }: { params: { id: string; assessmentId: string } }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 bg-gray-50">
                    <FamilyAssessment familyId={params.id}
                                      assessmentId={params.assessmentId}
                                      mode="view"/>
                </main>
            </div>
        </div>
    )
}

