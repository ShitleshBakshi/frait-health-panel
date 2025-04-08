"use client"

import React, {useEffect, useMemo, useState, useRef} from "react"
import {calculateCategoryScores,
    calculateOverallScore,
    shouldHighlightCell} from "@/lib/assessment-utils"
import {ChevronDown, Clock, Eye, FileText, GaugeCircle, Trash2, Users} from "lucide-react"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "./ui/accordion"
import {Alert, AlertDescription} from "./ui/alert"
import {useToast} from "@/components/ui/use-toast"
import {MainParentInfo} from "./main-parent-info-form"
import {SupportingParentInfo} from "./supporting-parent-info-form"
import {Button} from "./ui/button"
import { useRouter } from "next/navigation"
import {MainParentAssessment} from "./main-parent-assessment"
import {SupportingParentAssessment} from "./supporting-parent-assessment"
import {ExternalInfluenceAssessment} from "./external-assessment";
import {Switch} from "@/components/ui/switch";
import {FormField} from "@/components/ui/form-field";
import {ChildInfoForm} from "./child-info-form"
import {ChildAssessment} from "./child-assessment"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "./ui/dialog"
import { useSelector, useDispatch } from "react-redux"
import {useAuth} from "@/lib/auth-context"
import {
    loadAssessment,
    updateMainParentAssessment,
    updateExternalInfluenceAssessment,
    AssessmentItem,
    resetAssessment,
    startNewAssessment, updateSupportingParentAssessment, updateChildAssessment
} from "@/lib/slices/assessmentSlice"
import {
    setFamilyId,
    setMainParent,
    updateMainParent,
    removeMainParent,
    addSupportingParent,
    removeSupportingParent,
    addChild,
    removeChild,
    setSaving,
    setError,
    resetSupportingParents,
    resetChildren,
    setSupportingParents,
    setChildren,
    ParentInfo,
    ChildInfo
} from "@/lib/slices/familyDetailsSlice";
import { saveFamilyDetails, fetchFamilyDetailsFromBackend } from "@/lib/thunks/familyDetailsThunks";
import { saveAssessmentToBackend } from "@/lib/thunks/assessment-thunks";
import {addFamilyAssessment, type Family} from "@/lib/slices/familySlice"
import type {AppDispatch, RootState} from "@/lib/store"
import type { AssessmentLevel } from "@/type/assessment"

interface FamilyAssessmentProps {
    familyId: number
    assessmentId?: number
    mode?: "edit" | "view"
}

interface AssessmentStatus {
    mainParent: {
        info: boolean
        assessment: boolean
    }
    supportingParent: boolean
    child: boolean
    externalInfluence: boolean

}

interface FamilyAssessment {
    id: string
    familyId: number
    mainParent: ParentInfo
    supportingParents: ParentInfo[]
    children: ChildInfo[]
    mainParentAssessment: AssessmentItem[]
    supportingParentAssessment: AssessmentItem[]
    childAssessment: AssessmentItem[]
    externalInfluenceAssessment: AssessmentItem[]
    status: "DRAFT" | "IN PROGRESS" | "DONE" | "PENDING_APPROVAL"
    assessorHv: string
    reviewerHv: string
    createdAt: string
    updatedAt: string
}

export function FamilyAssessment({ familyId, assessmentId, mode = "edit"}: FamilyAssessmentProps) {
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const { toast } = useToast()
    const { user } = useAuth()
    const prevFamilyIdRef = useRef<number | undefined | null>(null);
    const prevAssessmentIdRef = useRef<number | undefined | null>(null);

    // const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
    const family = useSelector((state: RootState) => {
        return state.family.families.find(f => {
            // Convert both IDs to strings for comparison
            const storeId = typeof f.id === 'string' ? f.id : String(f.id);
            const currentFamilyId = typeof familyId === 'string' ? familyId : String(familyId);

            return storeId === currentFamilyId;
        });
    });

    const [mainParentFormOpen, setMainParentFormOpen] = useState(false)
    const [mainParentAssessmentOpen, setMainParentAssessmentOpen] = useState(false)
    const [mainParentInfo, setMainParentInfo] = useState<ParentInfo | null>(null)

    const [supportingParentFormOpen, setSupportingParentFormOpen] = useState(false)
    const [supportingParentAssessmentOpen, setSupportingParentAssessmentOpen] = useState(false)
    const [supportingParentsInfo, setSupportingParentsInfo] = useState<ParentInfo[]>([])
    const [selectedSupportingParentId, setSelectedSupportingParentId] = useState<string | null>(null)

    const [externalInfluenceAssessmentOpen, setExternalInfluenceAssessmentOpen] = useState(false)

    const [childInfoFormOpen, setChildInfoFormOpen] = useState(false)
    const [childrenInfo, setChildrenInfo] = useState<ChildInfo[]>([])
    const [sameParentsForAllChildren, setSameParentsForAllChildren] = useState(false)

    const [childAssessmentOpen, setChildAssessmentOpen] = useState(false)
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null)


    const [assessmentStatus, setAssessmentStatus] = useState<AssessmentStatus>({
        mainParent: {
            info: false,
            assessment: false,
        },
        supportingParent: false,
        child: false,
        externalInfluence: false,
    })


    const [fraiDialogOpen, setFraiDialogOpen] = useState(false)
    const [assessmenttimelineopen, setassessmenttimelineopen] = useState(false)

    const assessmentData = useSelector((state: RootState) =>
        assessmentId ? state.family.assessments.find(a => a.id === String(assessmentId)) : null
    )

    const currentAssessment = useSelector((state: RootState) => state.assessment.currentAssessment)

    const scores = useSelector((state: RootState) => calculateCategoryScores(state))
    const overallScore = useMemo(() => calculateOverallScore(scores), [scores])

    // Check if an assessment is complete
    const isAssessmentComplete = useMemo(() => {
        // Check if main parent info and assessment are complete
        if (!assessmentStatus.mainParent.info || !assessmentStatus.mainParent.assessment) {
            return false
        }

        // Check if external influence is assessed
        if (!assessmentStatus.externalInfluence) {
            return false
        }

        // Supporting parent assessments are only required if there are supporting parents
        if (supportingParentsInfo.length > 0 && !assessmentStatus.supportingParent) {
            return false;
        }

        // Child assessments are only required if there are children
        if (childrenInfo.length > 0 && !assessmentStatus.child) {
            return false;
        }

        // If we reach here, all required assessments are complete
        return true
    }, [assessmentStatus, supportingParentsInfo.length, childrenInfo.length])

    // Handlers for form submissions and actions
    const handleMainParentInfoSubmit = (data: {
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender?: string;
        relationToChild?: string;
        educationLevel?: string;
        parentalResponsibility?: boolean;
        informationProvider?: boolean;
    }) => {
        const newMainParent: ParentInfo = {
            id: Date.now().toString(),
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender || "",
            relationToChild: data.relationToChild || "",
            educationLevel: data.educationLevel || "",
            parentalResponsibility: data.parentalResponsibility || false,
            informationProvider: data.informationProvider || false
        };
        setMainParentInfo(newMainParent)
        setMainParentFormOpen(false)
        setAssessmentStatus((prev) => ({
            ...prev,
            mainParent: { ...prev.mainParent, info: true },
        }))
    }

    const handleSupportingParentInfoSubmit = (data: {
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender?: string;
        relationToChild?: string;
        educationLevel?: string;
        parentalResponsibility?: boolean;
        informationProvider?: boolean;
    }) =>{
    const newSupportingParent: ParentInfo = {
        id: Date.now().toString(),
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender || "",
        relationToChild: data.relationToChild || "",
        educationLevel: data.educationLevel || "",
        parentalResponsibility: data.parentalResponsibility || false,
        informationProvider: data.informationProvider || false
    };
        setSupportingParentsInfo((prev) => [...prev, newSupportingParent])
        setSupportingParentFormOpen(false)
    }

    const handleDeleteSupportingParent = (id: string) => {
        setSupportingParentsInfo((prev) => prev.filter((parent) => parent.id !== id))
    }

    const handleAssessSupportingParent = (id: string) => {
        setSelectedSupportingParentId(id)
        setSupportingParentAssessmentOpen(true)
    }

    const handleChildInfoSubmit = (data: Omit<ChildInfo, "id">) => {
        const newChild = { ...data, id: Date.now().toString() }
        setChildrenInfo((prev) => [...prev, newChild])
        setChildInfoFormOpen(false)
    }

    const handleDeleteChild = (id: string) => {
        setChildrenInfo((prev) => prev.filter((child) => child.id !== id))
    }

    const handleAssessChild = (id: string) => {
        setSelectedChildId(id)
        setChildAssessmentOpen(true)
    }

    // Update Redux when assessments are completed
    const handleMainParentAssessmentComplete = (items: AssessmentItem[]) => {
        dispatch(updateMainParentAssessment(items))
        setAssessmentStatus((prev) => ({
            ...prev,
            mainParent: { ...prev.mainParent, assessment: true },
        }))
        setMainParentAssessmentOpen(false)
    }

    const handleSupportingParentAssessmentComplete = (items: AssessmentItem[]) => {
        dispatch(updateSupportingParentAssessment(items));
        setAssessmentStatus((prev) => ({
            ...prev,
            supportingParent: true
        }));
        setSupportingParentAssessmentOpen(false);
    }

    const handleChildAssessmentComplete = (items: AssessmentItem[]) => {
        dispatch(updateChildAssessment(items));
        setAssessmentStatus((prev) => ({
            ...prev,
            child: true
        }));
        setChildAssessmentOpen(false);
    }


    const handleExternalInfluenceComplete = (items: AssessmentItem[]) => {
        dispatch(updateExternalInfluenceAssessment(items))
        setAssessmentStatus((prev) => ({
            ...prev,
            externalInfluence: true,
        }))
        setExternalInfluenceAssessmentOpen(false)
    }
    // Function to save family details to the backend
    const saveFamilyDetailsBeforeFinalizing = async () => {
        if (!mainParentInfo) {
            toast({
                title: "Error",
                description: "Main parent information is required",
                variant: "destructive"
            });
            return false;
        }

        try {
            // Save all parents and children to backend
            const result = await dispatch(saveFamilyDetails({
                familyId: familyId,
                mainParentInfo,
                supportingParentsInfo: supportingParentsInfo,
                childrenInfo: childrenInfo
            })).unwrap();

            if (!result.success) {
                toast({
                    title: "Error",
                    description: "Failed to save family details",
                    variant: "destructive"
                });
                return false;
            }

            return true;
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save family details",
                variant: "destructive"
            });
            return false;
        }
    };
    useEffect(() => {
        // Case 1: Different family ID (new family)
        if (prevFamilyIdRef.current && prevFamilyIdRef.current !== familyId) {
            dispatch(resetAssessment());
            dispatch(startNewAssessment({ familyId }));
            setAssessmentStatus({
                mainParent: {
                    info: false,
                    assessment: false,
                },
                supportingParent: false,
                child: false,
                externalInfluence: false,
            });
        }

        // Case 2: Same family but different assessment ID (new assessment for same family)
        else if (
            familyId === prevFamilyIdRef.current &&
            prevAssessmentIdRef.current &&
            assessmentId !== prevAssessmentIdRef.current
        ) {
            
            dispatch(resetAssessment());
            dispatch(startNewAssessment({ familyId }));
            setAssessmentStatus({
                mainParent: {
                    info: false,
                    assessment: false,
                },
                supportingParent: false,
                child: false,
                externalInfluence: false,
            });
        }

        // Case 3: Initial load with assessmentId (viewing or editing existing assessment)
        else if ((mode === "view" || mode === "edit") && assessmentId && assessmentData) {
            // Load the assessment into Redux for viewing or editing
            dispatch(loadAssessment({
                assessmentId,
                familyId: assessmentData.familyId,
                mainParentAssessment: assessmentData.mainParentAssessment.map(item => ({
                    id: item.id,
                    level: item.level as AssessmentLevel
                })),
                supportingParentAssessment: assessmentData.supportingParentAssessment?.map(item => ({
                    id: item.id,
                    level: item.level as AssessmentLevel
                })) || [],
                childAssessment: assessmentData.childAssessment?.map(item => ({
                    id: item.id,
                    level: item.level as AssessmentLevel
                })) || [],
                externalInfluenceAssessment: assessmentData.externalInfluenceAssessment.map(item => ({
                    id: item.id,
                    level: item.level as AssessmentLevel
                }))
            }));

            // Set display data
            setMainParentInfo(assessmentData.mainParent);
            setSupportingParentsInfo(assessmentData.supportingParents || []);
            setChildrenInfo(assessmentData.children || []);

            // Mark all sections as completed in view mode
            setAssessmentStatus({
                mainParent: { info: true, assessment: true },
                supportingParent: true,
                child: true,
                externalInfluence: true,
            });
        }
        // Case 4: First initialization without assessment ID (new assessment)
        else if (!assessmentId && !prevFamilyIdRef.current) {
            dispatch(resetAssessment());
            dispatch(startNewAssessment({ familyId }));
        }

        // Update references for next comparison
        prevFamilyIdRef.current = familyId;
        prevAssessmentIdRef.current = assessmentId;
    }, [familyId, assessmentId, mode, dispatch, assessmentData]);

    // Load family details from backend when creating a new assessment
    useEffect(() => {
        if (familyId && !assessmentId && mode === "edit") {
            // Only load family details for new assessments
            // (for existing ones we're loading from the assessment object)
            dispatch(fetchFamilyDetailsFromBackend(familyId))
                .unwrap()
                .then((data) => {
                    if (!data) return; // No family details exist yet

                    // If we have family details, populate the component state
                    if (data.mainParentInfo) {
                        setMainParentInfo(data.mainParentInfo);
                        setAssessmentStatus((prev) => ({
                            ...prev,
                            mainParent: { ...prev.mainParent, info: true },
                        }));
                    }

                    if (data.supportingParentsInfo?.length > 0) {
                        setSupportingParentsInfo(data.supportingParentsInfo);
                    }

                    if (data.childrenInfo?.length > 0) {
                        setChildrenInfo(data.childrenInfo);
                    }
                })
                .catch((error) => {
                    // If there's no family details yet, we'll just start with empty state
                    
                });
        }
    }, [familyId, assessmentId, mode, dispatch]);

    // Get all existing assessments for this family from Redux store
    const existingAssessments = useSelector((state: RootState) =>
        state.family.assessments.filter(a => a.familyId === familyId)
    );


    const handleFinalize = async () => {
        // Calculate the next assessment number for this family
        const nextAssessmentNumber = existingAssessments.length + 1;

        // Create the new assessment ID in the format familyId_assessmentNumber
        // const assessmentId = `${familyId}_${nextAssessmentNumber}`;
        const updatedAssessmentId = assessmentId ? String(assessmentId) : `${familyId}_${nextAssessmentNumber}`;
        const currentTime = new Date().toISOString();


        try {
            // First, save the family details to the backend
            const familyDetailsSaved = await saveFamilyDetailsBeforeFinalizing();
            if (!familyDetailsSaved) {
                return; // Stop if family details couldn't be saved
            }



            // First, save the assessment data to the backend
            const saveResult = await dispatch(saveAssessmentToBackend(nextAssessmentNumber)).unwrap();

            if (!saveResult.success) {
                toast({
                    title: "Error",
                    description: "Failed to save assessment to server. Please try again.",
                    variant: "destructive"
                });
                return;
            }

            const status = user?.role === "Assistant Health Visitor" ? "PENDING_APPROVAL" : "DONE";


            const familyAssessment: FamilyAssessment = {
                id: updatedAssessmentId,
                familyId,
                mainParent: mainParentInfo!,
                supportingParents: supportingParentsInfo,
                children: childrenInfo,
                mainParentAssessment: currentAssessment.mainParentAssessment,
                supportingParentAssessment: currentAssessment.supportingParentAssessment,
                childAssessment: currentAssessment.childAssessment,
                externalInfluenceAssessment: currentAssessment.externalInfluenceAssessment,
                status: status,
                assessorHv: user?.username || "Current User",
                reviewerHv: "Pending",
                createdAt: currentTime,
                updatedAt: currentTime
            }

            // Save to Redux family slice
            dispatch(addFamilyAssessment(familyAssessment))

            toast({
                title: "Assessment Finalized",
                description: "The assessment has been successfully finalized.",
            });


            dispatch(resetAssessment())


            router.push(`/families/${familyId}`);

            // setTimeout(() => {
            //     window.location.href = `/families/${familyId}`;
            // }, 500);
        }
        catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "An unexpected error occurred",
                variant: "destructive"
            });
        }
    }



    if (mode === "view") {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-4">
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-600 font-medium">Family: {family?.name || "Unknown"}</span>
                </div>

                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-100"
                     onClick={() => setassessmenttimelineopen(true)}>
                    <Clock className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-600">View the assessment timeline</span>
                </div>

                <div
                    className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100"
                    onClick={() => setFraiDialogOpen(true)}
                >
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-600">View FRAI - Overall score: {overallScore}</span>
                </div>

                <Accordion type="single" collapsible className="space-y-2">
                    <AccordionItem value="item-1" className="border rounded-lg bg-white">
                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">A</div>
                                <span>Main Parent/Carer&apos;s health and well-being</span>
                            </div>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-2 pb-4">
                            <div className="pl-9">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-600">{`${mainParentInfo?.firstName} ${mainParentInfo?.lastName}`}</span>
                                        <span className="text-gray-500">({mainParentInfo?.dateOfBirth})</span>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border rounded-lg bg-white">
                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">B</div>
                                <span>Supporting Parent(s)/Carer(s)&apos; health and well-being</span>
                            </div>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-2 pb-4">
                            <div className="pl-9 space-y-4">
                                {supportingParentsInfo.length > 0 ? (
                                    supportingParentsInfo.map((parent) => (
                                        <div key={parent.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600">{`${parent.firstName} ${parent.lastName}`}</span>
                                                <span className="text-gray-500">({parent.dateOfBirth})</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No supporting parents/carers</p>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3" className="border rounded-lg bg-white">
                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">C</div>
                                <span>External Influence</span>
                            </div>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-2 pb-4">
                            <div className="pl-9">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-600">{`${mainParentInfo?.firstName} ${mainParentInfo?.lastName}`}</span>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4" className="border rounded-lg bg-white">
                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-700 text-gray-600">D</div>
                                <span>Child&apos;s health and well-being</span>
                            </div>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-2 pb-4">
                            <div className="space-y-4">
                                {childrenInfo.length > 0 ? (
                                    childrenInfo.map((child) => (
                                        <div key={child.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600">{`${child.firstName} ${child.lastName}`}</span>
                                                <span className="text-gray-500">({child.dateOfBirth})</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No children</p>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Dialog open={assessmenttimelineopen} onOpenChange={setassessmenttimelineopen}>
                    <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Assessment timeline</DialogTitle>
                        </DialogHeader>
                        <div className="relative pl-6 mt-4">
                            {/* Timeline line */}
                            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>

                            {/* First timeline item - Initialised */}
                            <div className="relative mb-8">
                                <div className="absolute left-[-1.25rem] mt-1.5 w-3 h-3 rounded-full bg-blue-600"></div>
                                <div>
                                    <p className="font-medium">Initialised at:</p>
                                    <p className="text-gray-500 mt-1">
                                        {assessmentData ? new Date(assessmentData.createdAt).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        }).replace(',', '') : '20-10-2022 14:44:37'}
                                    </p>
                                </div>
                            </div>

                            {/* Second timeline item - Finalised */}
                            <div className="relative">
                                <div className="absolute left-[-1.25rem] mt-1.5 w-3 h-3 rounded-full bg-blue-600"></div>
                                <div>
                                    <p className="font-medium">Finalised at:</p>
                                    <p className="text-gray-500 mt-1">
                                        {assessmentData ? new Date(assessmentData.updatedAt).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        }).replace(',', '') : '20-10-2022 14:49:54'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={fraiDialogOpen} onOpenChange={setFraiDialogOpen}>
                    <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Score</DialogTitle>
                        </DialogHeader>
                        <div className="overflow-auto">
                            <table className="w-full border-separate border-spacing-2">
                                <thead>
                                <tr>
                                    <th> </th>
                                    <th className="border p-2 bg-blue-400">Responsive Parenting</th>
                                    <th className="border p-2 bg-blue-400">Family Health</th>
                                    <th className="border p-2 bg-blue-400">Engagement</th>
                                    <th className="border p-2 bg-blue-400">Family Support</th>
                                    <th className="border p-2 bg-blue-400">Socio/Economic Factors</th>
                                </tr>
                                </thead>
                                <tbody>
                                {[
                                    [
                                        "Parental childhood experience has an entirely positive impact on the child's needs",
                                        "Parental chronic health problems have no impact on the child's needs or parents have no chronic health problems",
                                        "Parents always recognise the negative impact of dysfunctional behaviour in others on their family",
                                        "History of being entirely able to withstand adversity",
                                        "Always able to meet regular and unexpected financial demands",
                                    ],
                                    [
                                        "Parental childhood experience has a mainly positive impact on the child's needs",
                                        "Parental chronic health problems seldom have no impact on the child's needs",
                                        "Parents usually recognise the negative impact of dysfunctional behaviour in others on their family",
                                        "History of being mainly able to withstand adversity",
                                        "Always able to meet regular financial demands but not always able to meet large unexpected financial demands",
                                    ],
                                    [
                                        "Parental childhood experience has led to a conflicting impact on the child's needs",
                                        "Parental chronic health problems sometimes have no impact on the child's needs",
                                        "Parents sometimes recognise the negative impact of others' dysfunctional behaviour on their family",
                                        "Current evidence does not allow a judgement to be made about withstanding adversity",
                                        "Able to meet priortised financial demands but forced to neglect depriortised financial demands",
                                    ],
                                    [
                                        "Parental childhood experience has a mainly negative impact on the child's needs",
                                        "Parental chronic health problems often impact on the child's needs",
                                        "Parents usually do not recognise the negative impact of others' dysfunctionality behaviour on their family",
                                        "History of being mainly unable to withstand adversity",
                                        "Occasionally able to meet priortised financial demands but sometimes forced to neglect them",
                                    ],
                                    [
                                        "Parental childhood experience has an negative impact on the child's needs",
                                        "Parental chronic health problems have a constant impact on the child's needs",
                                        "Parents never recognise the negative impact of others' dysfunctional behaviour on their family",
                                        "History of being entirely unable to withstand adversity",
                                        "Not able to meet priortised financial demands",
                                    ],
                                ].map((rowTexts, rowIndex) => (
                                    <tr key={5 - rowIndex}>
                                        <td className="border p-2 font-bold text-center bg-gray-50">{5 - rowIndex}</td>
                                        {rowTexts.map((text, colIndex) => (
                                            <React.Fragment key={colIndex}>
                                                <td
                                                    className={`border p-2 ${shouldHighlightCell(rowIndex, colIndex, scores) ? "bg-yellow-200" : ""}`}
                                                >
                                                    {text}
                                                </td>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <div className="mt-8 space-y-4">
                                <div className="bg-[#1a2634] text-white p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold">Overall score: {overallScore} out of 25</h3>
                                    <p className="text-sm text-gray-400">Category scores:</p>
                                </div>

                                <div className="space-y-2">
                                    {Object.entries(scores).map(([category, score]) => (
                                        <div key={category} className="bg-[#1f2937] p-4 rounded-lg flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                                                    {score}
                                                </div>
                                                <div>
                                                    <h4 className="text-white">
                                                        {category
                                                            .split("-")
                                                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                            .join(" ")}
                                                    </h4>
                                                </div>
                                            </div>
                                            <span className="text-white">{score}/5</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }
    return (
        <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-blue-600" />
                    <h1 className="text-2xl font-semibold text-gray-900">Family: {family?.name || "Unknown"}</h1>
                </div>
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="font-medium">Assessment management</h2>
                    </div>


                    <Alert
                        variant={isAssessmentComplete ? "default" : "info"}
                        className={isAssessmentComplete ? "bg-blue-50 border-blue-200" : ""}
                    >
                        <div className="flex items-center justify-between">
                            <AlertDescription>
                                {isAssessmentComplete
                                    ? "Your assessment is ready to be " + (user?.role === "Assistant Health Visitor" ? "submitted for approval." : "finalized.")
                                    : "Please complete your assessment's required elements to continue."}
                            </AlertDescription>
                            {isAssessmentComplete && (
                                <Button
                                    onClick={handleFinalize}
                                    size="sm"
                                    className={user?.role === "Assistant Health Visitor"
                                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                                        : "bg-green-500 hover:bg-green-600 text-white"}
                                >
                                    {user?.role === "Assistant Health Visitor" ? "Send for Approval" : "Finalise"}
                                </Button>
                            )}
                        </div>
                    </Alert>

                    <Accordion type="single" collapsible className="space-y-2">
                        <AccordionItem value="item-1" className="border rounded-lg bg-white">
                            <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                                        A
                                    </div>
                                    <span>Main Parent/Carer&apos;s health and well-being</span>
                                </div>
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-2 pb-4">
                                <div className="pl-9">
                                    {mainParentInfo ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600">{`${mainParentInfo.firstName} ${mainParentInfo.lastName}`}</span>
                                                <span className="text-gray-500">({mainParentInfo.dateOfBirth})</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => setMainParentInfo(null)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="ml-2">Delete</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => setMainParentAssessmentOpen(true)}
                                                >
                                                    <GaugeCircle className="h-4 w-4" />
                                                    <span className="ml-2">Assess</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => setMainParentFormOpen(true)} className="text-blue-600 hover:underline">
                                            Add the main parent/carer&apos;s information
                                        </button>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2" className="border rounded-lg bg-white">
                            <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                                        B
                                    </div>
                                    <span>Supporting Parent(s)/Carer(s)&apos; health and well-being</span>
                                </div>
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-2 pb-4">
                                <div className="pl-9 space-y-4">
                                    {supportingParentsInfo.map((parent) => (
                                        <div key={parent.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600">{`${parent.firstName} ${parent.lastName}`}</span>
                                                <span className="text-gray-500">({parent.dateOfBirth})</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteSupportingParent(parent.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="ml-2">Delete</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => handleAssessSupportingParent(parent.id)}
                                                >
                                                    <GaugeCircle className="h-4 w-4" />
                                                    <span className="ml-2">Assess</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => setSupportingParentFormOpen(true)}
                                    >
                                        Add supporting parent/carer&apos;s information
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3" className="border rounded-lg bg-white">
                            <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                                        C
                                    </div>
                                    <span>External Influence</span>
                                </div>
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-2 pb-4">
                                <div className="pl-9">
                                    {mainParentInfo ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600">{`${mainParentInfo.firstName} ${mainParentInfo.lastName}`}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => setMainParentInfo(null)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="ml-2">Delete</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => setExternalInfluenceAssessmentOpen(true)}
                                                >
                                                    <GaugeCircle className="h-4 w-4" />
                                                    <span className="ml-2">Assess</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Please add the main parent/carer&apos;s information first.</p>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4" className="border rounded-lg bg-white">
                            <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                                        D
                                    </div>
                                    <span>Child&apos;s health and well-being</span>
                                </div>
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-2 pb-4">
                                <div className="space-y-4">
                                    <FormField label="Every child has the same supporting parent(s)">
                                        <Switch
                                            checked={sameParentsForAllChildren}
                                            onCheckedChange={setSameParentsForAllChildren}
                                            name="sameParentsForAllChildren"
                                        />
                                    </FormField>

                                    {childrenInfo.map((child) => (
                                        <div key={child.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600">{`${child.firstName} ${child.lastName}`}</span>
                                                <span className="text-gray-500">({child.dateOfBirth})</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteChild(child.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="ml-2">Delete</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => handleAssessChild(child.id)}
                                                >
                                                    <GaugeCircle className="h-4 w-4" />
                                                    <span className="ml-2">Assess</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => setChildInfoFormOpen(true)}
                                    >
                                        Add a child&apos;s information
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
                <MainParentInfo
                    open={mainParentFormOpen}
                    onClose={() => setMainParentFormOpen(false)}
                    onSubmit={handleMainParentInfoSubmit}
                />
                <MainParentAssessment
                    open={mainParentAssessmentOpen}
                    onClose={() => setMainParentAssessmentOpen(false)}
                    parentName={mainParentInfo ? `${mainParentInfo.firstName} ${mainParentInfo.lastName}` : ""}
                    onComplete={handleMainParentAssessmentComplete}
                    assessmentType = "mainParent"
                />
                <SupportingParentInfo
                    open={supportingParentFormOpen}
                    onClose={() => setSupportingParentFormOpen(false)}
                    onSubmit={handleSupportingParentInfoSubmit}
                />
                <SupportingParentAssessment
                    open={supportingParentAssessmentOpen}
                    onClose={() => setSupportingParentAssessmentOpen(false)}
                    parentName={
                        selectedSupportingParentId
                            ? supportingParentsInfo.find((p) => p.id === selectedSupportingParentId)?.firstName || ""
                            : ""
                    }
                    onComplete={handleSupportingParentAssessmentComplete}
                    assessmentType="supportingParent"
                />
                <ExternalInfluenceAssessment
                    open={externalInfluenceAssessmentOpen}
                    onClose={() => setExternalInfluenceAssessmentOpen(false)}
                    parentName={mainParentInfo ? `${mainParentInfo.firstName} ${mainParentInfo.lastName}` : ""}
                    onComplete={handleExternalInfluenceComplete}
                    assessmentType={"externalInfluence"}
                />
                <ChildInfoForm
                    open={childInfoFormOpen}
                    onClose={() => setChildInfoFormOpen(false)}
                    onSubmit={handleChildInfoSubmit}
                    supportingParents={supportingParentsInfo.map(parent => ({ id: parent.id, name: `${parent.firstName} ${parent.lastName}` }))}
                    sameParentsForAllChildren={sameParentsForAllChildren}
                />

                <ChildAssessment
                    open={childAssessmentOpen}
                    onClose={() => setChildAssessmentOpen(false)}
                    childName={selectedChildId ? childrenInfo.find((c) => c.id === selectedChildId)?.firstName || "" : ""}
                    onComplete={handleChildAssessmentComplete}
                    assessmentType="child"
                />
                <div className="h-16" />
            </div>
        </div>
    )
}
