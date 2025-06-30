"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"

// Mock data for health visitors and their assignments
const MOCK_HEALTH_VISITORS = [
    {
        id: "hv_1",
        name: "Dr. Sarah Johnson",
        assignedFamilies: [
            { id: "fam_1", name: "Smith", assessmentStatus: "Done" },
            { id: "fam_2", name: "Williams", assessmentStatus: "In Progress" },
            { id: "fam_3", name: "Brown", assessmentStatus: "Asst HV" }
        ]
    },
    {
        id: "hv_2",
        name: "Dr. James Miller",
        assignedFamilies: [
            { id: "fam_4", name: "Jones", assessmentStatus: "Done" },
            { id: "fam_5", name: "Wilson", assessmentStatus: "Done" }
        ]
    },
    {
        id: "hv_3",
        name: "Dr. Emily Davis",
        assignedFamilies: [
            { id: "fam_6", name: "Taylor", assessmentStatus: "In Progress" },
            { id: "fam_7", name: "Moore", assessmentStatus: "Asst HV" },
            { id: "fam_8", name: "Anderson", assessmentStatus: "Asst HV" },
            { id: "fam_9", name: "Thomas", assessmentStatus: "Done" }
        ]
    }
]

export function HealthVisitorSearch() {
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState<typeof MOCK_HEALTH_VISITORS>([])
    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setSearchResults([])
            setHasSearched(false)
            return
        }

        const filtered = MOCK_HEALTH_VISITORS.filter(hv =>
            hv.name.toLowerCase().includes(searchTerm.toLowerCase())
        )

        setSearchResults(filtered)
        setHasSearched(true)
    }

    // Count assessments by status
    const countAssessmentsByStatus = (healthVisitor: typeof MOCK_HEALTH_VISITORS[0]) => {
        const counts = {
            done: 0,
            inProgress: 0,
            pending: 0
        }

        healthVisitor.assignedFamilies.forEach(family => {
            if (family.assessmentStatus === "Done") counts.done++
            else if (family.assessmentStatus === "In Progress") counts.inProgress++
            else if (family.assessmentStatus === "Asst HV") counts.pending++
        })

        return counts
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Search Health Visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                />
                <Button
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                </Button>
            </div>

            {hasSearched && (
                <>
                    <h2 className="text-lg font-medium mt-6">Search Results</h2>

                    {searchResults.length === 0 ? (
                        <p className="text-gray-500">No health visitors found matching your search.</p>
                    ) : (
                        <div className="space-y-8">
                            {searchResults.map(healthVisitor => {
                                const counts = countAssessmentsByStatus(healthVisitor)

                                return (
                                    <Card key={healthVisitor.id}>
                                        <CardHeader>
                                            <CardTitle>{healthVisitor.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <div className="bg-green-50 p-3 rounded-md border border-green-100">
                                                    <p className="text-sm text-green-700">Completed</p>
                                                    <p className="text-2xl font-bold text-green-700">{counts.done}</p>
                                                </div>
                                                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                                                    <p className="text-sm text-blue-700">In Progress</p>
                                                    <p className="text-2xl font-bold text-blue-700">{counts.inProgress}</p>
                                                </div>
                                                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
                                                    <p className="text-sm text-yellow-700">Asst HV</p>
                                                    <p className="text-2xl font-bold text-yellow-700">{counts.pending}</p>
                                                </div>
                                            </div>

                                            <h3 className="font-medium mb-2">Assigned Families</h3>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Family Name</TableHead>
                                                        <TableHead className="text-right">Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {healthVisitor.assignedFamilies.map(family => (
                                                        <TableRow key={family.id}>
                                                            <TableCell>{family.name}</TableCell>
                                                            <TableCell className="text-right">
                                                                <span
                                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                        family.assessmentStatus === "Done"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : family.assessmentStatus === "In Progress"
                                                                                ? "bg-blue-100 text-blue-800"
                                                                                : "bg-yellow-100 text-yellow-800"
                                                                    }`}
                                                                >
                                                                    {family.assessmentStatus}
                                                                </span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}