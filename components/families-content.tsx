"use client"

import {useEffect, useState} from "react"
import { Input } from "./ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import {ChevronLeft, ChevronRight, MoreHorizontal, Plus, Clock, Eye, Copy, FileText} from "lucide-react"
import Link from "next/link"
import { setCurrentFamily } from "@/lib/slices/familySlice"
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/lib/store";
import type { FamilyAssessment } from "@/type/assessment"

interface Family {
    id: number
    name: string
    town: string
    postcode: string
    updatedAt: string
}

const families: Family[] = [
    {
        id: 3,
        name: "Stevens",
        town: "Pontypridd",
        postcode: "CF37 1DL",
        updatedAt: "20-10-2022 13:45:41",
    },
]

interface FamiliesContentProps {
    initialFamilyId?: string
    showAssessments?: boolean
}

export function FamiliesContent({
                                    initialFamilyId,
                                    showAssessments: initialShowAssessments = false,
                                }: FamiliesContentProps)  {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedFamily, setSelectedFamily] = useState<Family | null>(initialFamilyId ? families.find((f) => f.id.toString() === initialFamilyId) || null : null)
    const [showAssessments, setShowAssessments] = useState(initialShowAssessments || !!initialFamilyId)
    const assessments = useSelector((state: RootState) => state.family.assessments)
    const filteredFamilies = families.filter((family) => family.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const handleFamilySelect = (family: Family) => {
        setSelectedFamily(family)
        setShowAssessments(true)
        dispatch(setCurrentFamily(family.id.toString()));
    }

    const filteredAssessments = selectedFamily
        ? assessments.filter(assessment => assessment.familyId === selectedFamily.id.toString())
        : [];

    const renderActionButtons = (assessment: FamilyAssessment) => {
        return (
            <div className="flex items-center gap-4">
                {assessment.status === "IN PROGRESS" && (
                    <Link
                        href={`/families/${assessment.familyId}/assessment/${assessment.id}`}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Continue</span>
                    </Link>
                )}
                <Link
                    href={`/families/${assessment.familyId}/assessment/${assessment.id}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                >
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">View</span>
                </Link>
                <Link
                    href={`/families/${assessment.familyId}/assessment/${assessment.id}/clone`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                >
                    <Copy className="h-4 w-4" />
                    <span className="text-sm">Clone</span>
                </Link>
                {assessment.status === "DONE" && (
                    <>
                        <Link
                            href={`/families/${assessment.familyId}/assessment/${assessment.id}/frat`}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">FRAT</span>
                        </Link>
                        <Link
                            href={`/families/${assessment.familyId}/assessment/${assessment.id}/frai`}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">FRAI</span>
                        </Link>
                    </>
                )}
            </div>
        )
    }

    useEffect(() => {
        if (initialFamilyId) {
            dispatch(setCurrentFamily(initialFamilyId));
        }
    }, [dispatch, initialFamilyId]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {!showAssessments ? (
                <>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Families</h1>
                    </div>

                    <div className="space-y-4">
                        <Input
                            placeholder="Family name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-md"
                        />

                        <div className="border rounded-lg bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">#</TableHead>
                                        <TableHead>NAME</TableHead>
                                        <TableHead>TOWN</TableHead>
                                        <TableHead>POSTCODE</TableHead>
                                        <TableHead>UPDATED AT</TableHead>
                                        <TableHead className="w-16">ACTIONS</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFamilies.map((family) => (
                                        <TableRow key={family.id}>
                                            <TableCell>{family.id}</TableCell>
                                            <TableCell>{family.name}</TableCell>
                                            <TableCell>{family.town}</TableCell>
                                            <TableCell>{family.postcode}</TableCell>
                                            <TableCell>{family.updatedAt}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handleFamilySelect(family)}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex items-center justify-center space-x-2">
                            <Button variant="outline" size="sm">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                                1
                            </Button>
                            <Button variant="outline" size="sm">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg
                                    className="w-5 h-5 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-xl font-semibold">Assessments</h1>
                        </div>
                        <Link href={`/families/${selectedFamily?.id}/assessment/new`}>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                New
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <h2 className="text-blue-600">Family: {selectedFamily?.name}</h2>
                    </div>

                    <div className="border rounded-lg bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">#</TableHead>
                                    <TableHead>STATUS</TableHead>
                                    <TableHead>ASSESSOR HV</TableHead>
                                    <TableHead>REVIEWER HV</TableHead>
                                    <TableHead>CREATED AT</TableHead>
                                    <TableHead>UPDATED AT</TableHead>
                                    <TableHead>ACTIONS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssessments.map((assessment) => (
                                    <TableRow key={assessment.id}>
                                        <TableCell>{assessment.id.slice(0, 8)}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    assessment.status === "DONE"
                                                        ? "bg-green-100 text-green-800"
                                                        : assessment.status === "IN PROGRESS"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {assessment.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{assessment.assessorHv}</TableCell>
                                        <TableCell>{assessment.reviewerHv || "-"}</TableCell>
                                        <TableCell>{new Date(assessment.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(assessment.updatedAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{renderActionButtons(assessment)}</TableCell>
                                    </TableRow>
                                ))}
                                {filteredAssessments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                                            No assessments found for this family. Create a new assessment to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-center space-x-2">
                        <Button variant="outline" size="sm"
                                onClick={() => {
                                    setSelectedFamily(null);
                                    setShowAssessments(false);
                                }}>
                            <ChevronLeft className="h-4 w-4" />
                            Back to families
                        </Button>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" disabled={filteredAssessments.length <= 5}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                                1
                            </Button>
                            <Button variant="outline" size="sm" disabled={filteredAssessments.length <= 5}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

