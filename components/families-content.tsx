"use client"

import {useEffect, useState} from "react"
import { Input } from "./ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import {ChevronLeft, ChevronRight, MoreHorizontal, Plus, Clock, Eye, Copy, FileText, UserPlus} from "lucide-react"
import Link from "next/link"
import { setCurrentFamily, addFamily, addFamiliesBulk, fetchFamilies, type Family } from "@/lib/slices/familySlice"
import {useDispatch, useSelector} from "react-redux";
import {RootState, AppDispatch} from "@/lib/store";
import type { FamilyAssessment } from "@/type/assessment"
import {useToast} from "@/hooks/use-toast";
import {NewFamilyForm} from "@/components/NewFamilyForm";
import {Alert, AlertDescription} from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context"
import { FamilyAssignmentModal } from "./FamilyAssignmentModal"
import { AssessmentApprovalModal } from "./AssessmentApprovalModal"

interface FamiliesContentProps {
    initialFamilyId?: string
    showAssessments?: boolean
}

export function FamiliesContent({
                                    initialFamilyId,
                                    showAssessments: initialShowAssessments = false,
                                }: FamiliesContentProps)  {
    const dispatch = useDispatch<AppDispatch>();
    const { toast } = useToast();
    const { user, isAssignedFamily, getAssignedFamilies, getPendingAssessments } = useAuth()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
    const [showAssessments, setShowAssessments] = useState(initialShowAssessments || !!initialFamilyId)
    const [newFamilyFormOpen, setNewFamilyFormOpen] = useState(false)
    const [assignFamilyModalOpen, setAssignFamilyModalOpen] = useState(false)
    const [approvalModalOpen, setApprovalModalOpen] = useState(false)
    const [selectedAssessment, setSelectedAssessment] = useState<any>(null)

    // Get families & assessments from Redux store
    const families = useSelector((state: RootState) => state.family.families)
    const assessments = useSelector((state: RootState) => state.family.assessments)
    const nextFamilyId = useSelector((state: RootState) => state.family.nextFamilyId)
    const loading = useSelector((state: RootState) => state.family.loading)
    const error = useSelector((state: RootState) => state.family.error)

    // Filter families based on role and search term
    const filteredFamilies = families.filter((family) =>{
        if (!family || !family.name) return false;
        // For Assistant Health Visitors, only show assigned families
        if (user?.role === "Assistant Health Visitor") {
            const assignedFamilies = getAssignedFamilies()
            if (!assignedFamilies.includes(family.id.toString())) {
                return false
            }
        }

        return family && family.name ?
            family.name.toLowerCase().includes(searchTerm.toLowerCase()) :
            false})

    const handleFamilySelect = (family: Family) => {
        setSelectedFamily(family)
        setShowAssessments(true)
        dispatch(setCurrentFamily(family.id.toString()));
    }

    // // Open the assign family modal
    // const handleOpenAssignModal = () => {
    //     if (selectedFamily) {
    //         setAssignFamilyModalOpen(true)
    //     } else {
    //         toast({
    //             title: "No family selected",
    //             description: "Please select a family to assign first.",
    //             variant: "destructive"
    //         });
    //     }
    // }

    // Initial load of family data
    useEffect(() => {
        dispatch(fetchFamilies())
    }, [dispatch])

    // Listen for family assignment updates (especially for Assistant Health Visitors)
    useEffect(() => {
        const handleAssignmentUpdate = () => {
            // Refresh families when assignments change
            dispatch(fetchFamilies());
        };

        window.addEventListener('familyAssignmentUpdated', handleAssignmentUpdate);
        return () => {
            window.removeEventListener('familyAssignmentUpdated', handleAssignmentUpdate);
        };
    }, [dispatch]);

    // Set selected family from initialFamilyId
    useEffect(() => {
        if (initialFamilyId) {
            const family = families.find(f => f.id.toString() === initialFamilyId)
            if (family) {
                setSelectedFamily(family)
                dispatch(setCurrentFamily(initialFamilyId))
            }
        }
    }, [initialFamilyId, families, dispatch])

    // Handler for adding a new family manually
    const handleAddFamily = async (familyData: any) => {
        try {
            const newFamily = await dispatch(addFamily(familyData)).unwrap()
            toast({
                title: "Success",
                description: "Family  has been added successfully."
            })
            setNewFamilyFormOpen(false)

            dispatch(fetchFamilies());

            if (user?.role === "Health Visitor") {
                // Wait a moment for the Redux store to update
                setTimeout(() => {
                    setSelectedFamily(newFamily);
                    dispatch(setCurrentFamily(newFamily.id.toString()));
                    toast({
                        title: "Family Selected",
                        description: `You can now assign this family to an Assistant Health Visitor or create an assessment.`,
                        duration: 5000,
                    });
                }, 500);
            }

        } catch (error) {
            toast({
                title: "Error",
                description: error as string,
                variant: "destructive"
            })
        }
    }

    // Handler for importing families from Excel
    const handleExcelUpload = async (familiesData: any[]) => {
        try {
            await dispatch(addFamiliesBulk(familiesData)).unwrap()
            toast({
                title: "Success",
                description: `${familiesData.length} families imported successfully`
            })
            setNewFamilyFormOpen(false)
        } catch (error) {
            toast({
                title: "Error",
                description: error as string,
                variant: "destructive"
            })
        }
    }

    // const handleExcelUpload = (familiesData: any[]) => {
    //     // Process the data and assign unique IDs
    //     const newFamilies: Family[] = familiesData.map(data => ({
    //         id: `excel-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Generate a unique ID
    //         name: data.name,
    //         nhsNumber: data.nhsNumber,
    //         childDob: data.childDob,
    //         updatedAt: data.updatedAt
    //     }));
    //
    //     dispatch(addFamilies(newFamilies));
    //     setNewFamilyFormOpen(false);
    // };

    // Handle refresh button click
    const handleRefresh = () => {
        dispatch(fetchFamilies())
        toast({
            title: "Refreshing",
            description: "Fetching the latest families data"
        })
    }

    const filteredAssessments = selectedFamily
        ? assessments.filter((assessment) => {
            const assessmentFamilyId =
                typeof assessment.familyId === 'string' ? parseInt(assessment.familyId, 10) : assessment.familyId;

            const selectedFamilyId =
                typeof selectedFamily.id === 'string' ? parseInt(selectedFamily.id, 10) : selectedFamily.id;

            return assessmentFamilyId === selectedFamilyId;
        })
        : [];

    // Get pending assessments that need approval (for Health Visitors)
    const pendingApprovals = getPendingAssessments()

    // Open approval modal for a specific assessment
    const openApprovalModal = (assessment: FamilyAssessment) => {
        // In a real application, you would fetch assessment details here
        setSelectedAssessment({
            id: assessment.id,
            familyId: assessment.familyId,
            familyName: selectedFamily?.name || "Unknown Family",
            assistantId: "asst_1", // This would come from the real data
            assistantName: "Assistant Smith", // This would come from the real data
            date: new Date().toLocaleDateString(),
        })
        setApprovalModalOpen(true)
    }


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
                    href={`/families/${assessment.familyId}/assessment/${assessment.id}?mode=view`}
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

                {/* For Health Visitors - Approval button for pending assessments */}
                {user?.role === "Health Visitor" && assessment.status === "PENDING_APPROVAL" && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                        onClick={() => openApprovalModal(assessment)}
                    >
                        Review
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {!showAssessments ? (
                <>
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">Families</h1>
                        {/* Add Assign button for Health Visitors */}
                        {user?.role === "Health Visitor" && (
                            <Button
                                onClick={() => setAssignFamilyModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <UserPlus className="mr-2 h-4 w-4" /> Assign Family
                            </Button>
                        )}
                        <Button
                            onClick={() => setNewFamilyFormOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="mr-2 h-4 w-4" /> New Family
                        </Button>

                        {/* Add Assign button for Health Visitors */}
                        {user?.role === "Health Visitor" && selectedFamily && (
                            <Button
                                onClick={() => setAssignFamilyModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <UserPlus className="mr-2 h-4 w-4" /> Assign
                            </Button>
                        )}

                    </div>

                    {/* Error alert if there's an error from Redux */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

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
                                        <TableHead>NHS NUMBER</TableHead>
                                        <TableHead>UPDATED AT</TableHead>
                                        <TableHead className="w-16">ACTIONS</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFamilies.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                                                {user?.role === "Assistant Health Visitor"
                                                    ? "No assigned families found. Families must be assigned by a Health Visitor."
                                                    : "No families found matching your search criteria."}
                                            </TableCell>
                                        </TableRow>
                                    ) : ( filteredFamilies.map((family) => (
                                        <TableRow key={family.id}>
                                            <TableCell>{family.id}</TableCell>
                                            <TableCell>{family.name}</TableCell>
                                            <TableCell>{family.nhsNumber || "-"}</TableCell>
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
                                    ))
                                    )}
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
                                        <TableCell>{assessment.id.includes('_')
                                            ? assessment.id.split('_')[1]
                                            : assessment.id.slice(0, 8)}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    assessment.status === "DONE"
                                                        ? "bg-green-100 text-green-800"
                                                        : assessment.status === "IN PROGRESS"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : assessment.status === "PENDING_APPROVAL"
                                                                ? "bg-orange-100 text-orange-800"
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
            <NewFamilyForm
                open={newFamilyFormOpen}
                onClose={() => setNewFamilyFormOpen(false)}
                onSubmit={handleAddFamily}
                onExcelUpload={handleExcelUpload}
            />
            <FamilyAssignmentModal
                open={assignFamilyModalOpen}
                onClose={() => setAssignFamilyModalOpen(false)}
            />
            {/* Assessment Approval Modal */}
            {selectedAssessment && (
                <AssessmentApprovalModal
                    open={approvalModalOpen}
                    onClose={() => setApprovalModalOpen(false)}
                    assessment={selectedAssessment}
                />
            )}
        </div>
    )
}

