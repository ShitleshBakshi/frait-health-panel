import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import FRAIReport from "@/components/frai-report"

export default function FRAIPage({ params }: { params: { id: string; assessid: string } }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 bg-gray-50">
                    <FRAIReport />
                </main>
            </div>
        </div>
    )
}