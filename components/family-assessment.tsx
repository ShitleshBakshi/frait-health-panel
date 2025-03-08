"use client"

import React, {useEffect, useMemo, useState} from "react"
import {useAssessmentStore} from "@/lib/assessment-store"
import {assessmentMapping, type CategoryScores, getRowIndexForScore, getScoreForLevel} from "@/lib/assessment-utils"
import {ChevronDown, Clock, FileText, GaugeCircle, Trash2, Users} from "lucide-react"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "./ui/accordion"
import {Alert, AlertDescription} from "./ui/alert"
import {useToast} from "@/components/ui/use-toast"
import {MainParentInfo} from "./main-parent-info-form"
import {SupportingParentInfo} from "./supporting-parent-info-form"
import {Button} from "./ui/button"
import {MainParentAssessment} from "./main-parent-assessment"
import {SupportingParentAssessment} from "./supporting-parent-assessment"
import {ExternalInfluenceAssessment} from "./external-assessment";
import {Switch} from "@/components/ui/switch";
import {FormField} from "@/components/ui/form-field";
import {ChildInfoForm} from "./child-info-form"
import {ChildAssessment} from "./child-assessment"
import {useRouter} from "next/navigation";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "./ui/dialog"
import { useSelector, useDispatch } from "react-redux"
import { addFamilyAssessment } from "@/lib/slices/familySlice"
import {RootState} from "@/lib/store";

interface AssessmentItem {
    id: number
    level: AssessmentLevel | null
}


interface FamilyAssessmentProps {
    familyId: string
    assessmentId?: string
    mode?: "edit" | "view"
}

interface ParentInfo {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: string
}

interface ChildInfo {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    supportingParentId?: string
}

interface AssessmentStatus {
    mainParent: {
        info: boolean
        assessment: boolean
    }
    supportingParents: {
        [key: string]: {
            info: boolean
            assessment: boolean
        }
    }
    externalInfluence: boolean
    children: {
        [key: string]: {
            info: boolean
            assessment: boolean
        }
    }
}

type AssessmentLevel = "no-concern"| "low" | "low-med" | "med" | "med-high" | "high"

interface FamilyAssessment {
    id: string
    familyId: string
    mainParent: ParentInfo
    supportingParents: ParentInfo[]
    children: ChildInfo[]
    mainParentAssessment: AssessmentItem[]
    externalInfluenceAssessment: AssessmentItem[]
    status: "DRAFT" | "IN PROGRESS" | "DONE"
    assessorHv: string
    reviewerHv: string
    createdAt: string
    updatedAt: string
}

export function FamilyAssessment({ familyId, assessmentId, mode = "edit"}: FamilyAssessmentProps) {
    const router = useRouter()
    const dispatch = useDispatch()
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
        supportingParents: {},
        externalInfluence: false,
        children: {},
    })


    const [fraiDialogOpen, setFraiDialogOpen] = useState(false)

    const assessmentStore = useAssessmentStore()
    const {toast} = useToast()
    // Function to calculate category scores
    const calculateCategoryScores = (): CategoryScores => {
        const scores: CategoryScores = {
            "responsive-parenting": 0,
            "family-health": 0,
            engagement: 0,
            "family-support": 0,
            "socio-economic": 0,
        }

        // Helper function to update scores
        const updateScore = (
            items: AssessmentItem[],
            mapping: typeof assessmentMapping.mainParent | typeof assessmentMapping.externalInfluence,
        ) => {
            items.forEach((item) => {
                if (item.level) {
                    const category = mapping[item.id as keyof typeof mapping]
                    if (category) {
                        const score = getScoreForLevel(item.level)
                        scores[category] = score
                    }
                }
            })
        }

        // Process main parent assessment
        updateScore(assessmentStore.mainParentAssessment.items, assessmentMapping.mainParent)

        // Process external influence assessment
        updateScore(assessmentStore.externalInfluenceAssessment.items, assessmentMapping.externalInfluence)

        return scores
    }

    // Add this function to calculate overall score
    const calculateOverallScore = (scores: CategoryScores): number => {
        return Object.values(scores).reduce((sum, score) => sum + score, 0)
    }

    // Update the Dialog content to show the calculated scores
    const scores = calculateCategoryScores()
    const overallScore = calculateOverallScore(scores)


    const shouldHighlightCell = (rowIndex: number, colIndex: number): boolean => {
        const categories = [
            "responsive-parenting",
            "family-health",
            "engagement",
            "family-support",
            "socio-economic",
        ] as const
        const category = categories[colIndex]
        const score = scores[category]
        return score > 0 && rowIndex === getRowIndexForScore(score)
    }

    const handleMainParentInfoSubmit = (data: Omit<ParentInfo, "id">) => {
        setMainParentInfo({ ...data, id: Date.now().toString() })
        setMainParentFormOpen(false)
        setAssessmentStatus((prev) => ({
            ...prev,
            mainParent: { ...prev.mainParent, info: true },
        }))
    }

    const handleSupportingParentInfoSubmit = (data: Omit<ParentInfo, "id">) => {
        const newSupportingParent = { ...data, id: Date.now().toString() }
        setSupportingParentsInfo((prev) => [...prev, newSupportingParent])
        setSupportingParentFormOpen(false)
        setAssessmentStatus((prev) => ({
            ...prev,
            supportingParents: {
                ...prev.supportingParents,
                [newSupportingParent.id]: { info: true, assessment: false },
            },
        }))
    }

    const handleDeleteSupportingParent = (id: string) => {
        setSupportingParentsInfo((prev) => prev.filter((parent) => parent.id !== id))
        setAssessmentStatus((prev) => {
            const { [id]: _, ...rest } = prev.supportingParents
            return { ...prev, supportingParents: rest }
        })
    }

    const handleAssessSupportingParent = (id: string) => {
        setSelectedSupportingParentId(id)
        setSupportingParentAssessmentOpen(true)
    }

    const handleChildInfoSubmit = (data: Omit<ChildInfo, "id">) => {
        const newChild = {...data, id: Date.now().toString()}
        setChildrenInfo((prev) => [...prev, newChild])
        setChildInfoFormOpen(false)
        setAssessmentStatus((prev) => ({
            ...prev,
            children: {
                ...prev.children,
                [newChild.id]: { info: true, assessment: false },
            },
        }))
    }

    const handleDeleteChild = (id: string) => {
        setChildrenInfo((prev) => prev.filter((child) => child.id !== id))
        setAssessmentStatus((prev) => {
            const { [id]: _, ...rest } = prev.children
            return { ...prev, children: rest }
        })
    }

    const handleAssessChild = (id: string) => {
        setSelectedChildId(id)
        setChildAssessmentOpen(true)
    }

    const handleMainParentAssessmentComplete = () => {
        setAssessmentStatus((prev) => ({
            ...prev,
            mainParent: { ...prev.mainParent, assessment: true },
        }))
        setMainParentAssessmentOpen(false)
    }

    const handleSupportingParentAssessmentComplete = (id: string) => {
        setAssessmentStatus((prev) => ({
            ...prev,
            supportingParents: {
                ...prev.supportingParents,
                [id]: { ...prev.supportingParents[id], assessment: true },
            },
        }))
        setSupportingParentAssessmentOpen(false)
    }

    const handleExternalInfluenceComplete = () => {
        setAssessmentStatus((prev) => ({
            ...prev,
            externalInfluence: true,
        }))
        setExternalInfluenceAssessmentOpen(false)
    }

    const handleChildAssessmentComplete = (id: string) => {
        setAssessmentStatus((prev) => ({
            ...prev,
            children: {
                ...prev.children,
                [id]: { ...prev.children[id], assessment: true },
            },
        }))
        setChildAssessmentOpen(false)
    }

    const isAssessmentComplete = useMemo(() => {
        // Check if main parent info and assessment are complete
        if (!assessmentStatus.mainParent.info || !assessmentStatus.mainParent.assessment) {
            return false
        }

        // Check if all supporting parents are assessed
        const allSupportingParentsAssessed = Object.values(assessmentStatus.supportingParents).every(
            (parent) => parent.info && parent.assessment,
        )

        if (!allSupportingParentsAssessed) {
            return false
        }

        // Check if external influence is assessed
        if (!assessmentStatus.externalInfluence) {
            return false
        }

        // Check if all children are assessed
        return Object.values(assessmentStatus.children).every(
            (child) => child.info && child.assessment)
    }, [assessmentStatus])

    const handleFinalize = () => {
        const assessmentId = Date.now().toString();
        const currentTime = new Date().toISOString();
        const mainParentAssessmentItems = assessmentStore.mainParentAssessment.items.map(item => ({
            id: item.id,
            level: item.level
        }));
        const externalInfluenceAssessmentItems = assessmentStore.externalInfluenceAssessment.items.map(item => ({
            id: item.id,
            level: item.level
        }));

        const familyAssessment: FamilyAssessment = {
            id: assessmentId,
            familyId,
            mainParent: mainParentInfo!,
            supportingParents: supportingParentsInfo,
            children: childrenInfo,
            mainParentAssessment: mainParentAssessmentItems,
            externalInfluenceAssessment: externalInfluenceAssessmentItems,
            status: "DONE",
            assessorHv: "Current User",
            reviewerHv: "Current User",
            createdAt: currentTime,
            updatedAt: currentTime
        };

        // Dispatch the action to add the assessment to Redux
        dispatch(addFamilyAssessment(familyAssessment));

        toast({
            title: "Assessment Finalized",
            description: "The assessment has been successfully finalized.",
        });


        assessmentStore.reset();

        setTimeout(() => {
            router.push(`/families/${familyId}`);
        }, 2000);
    }

    useEffect(() => {
        // Only run in view mode and when we have an assessmentId
        if (mode === "view" && assessmentId) {
            // Get assessment data from Redux
            const assessmentData = useSelector((state: RootState) =>
                state.family.assessments.find(assessment => assessment.id === assessmentId)
            );

            if (assessmentData) {
                // Load data into the Zustand store for score calculation
                assessmentStore.updateMainParentAssessment({
                    items: assessmentData.mainParentAssessment.map(item => ({
                        id: item.id,
                        level: item.level as AssessmentLevel
                    }))
                });

                assessmentStore.updateExternalInfluenceAssessment({
                    items: assessmentData.externalInfluenceAssessment.map(item => ({
                        id: item.id,
                        level: item.level as AssessmentLevel
                    }))
                });

                // Set display data
                setMainParentInfo(assessmentData.mainParent);
                setSupportingParentsInfo(assessmentData.supportingParents);
                setChildrenInfo(assessmentData.children);
            }
        }
    }, [mode, assessmentId]);

    if (mode === "view") {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-4">
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-600 font-medium">Family: Stevens</span>
                </div>

                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-700">
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
                                {supportingParentsInfo.map((parent) => (
                                    <div key={parent.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-600">{`${parent.firstName} ${parent.lastName}`}</span>
                                            <span className="text-gray-500">({parent.dateOfBirth})</span>
                                        </div>
                                    </div>
                                ))}
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
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

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
                                                    className={`border p-2 ${shouldHighlightCell(rowIndex, colIndex) ? "bg-yellow-200" : ""}`}
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
                    <h1 className="text-2xl font-semibold text-gray-900">Family: Stevens</h1>
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
                                    ? "Your assessment is ready to be finalised."
                                    : "Please complete your assessment's required elements to finalise it."}
                            </AlertDescription>
                            {isAssessmentComplete && (
                                <Button onClick={handleFinalize} size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                                    Finalise
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
                    onComplete={() => handleSupportingParentAssessmentComplete(selectedSupportingParentId!)}
                    assessmentType={"supportingParent"}
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
                    onComplete={() => handleChildAssessmentComplete(selectedChildId!)}
                    assessmentType={"child"}
                />
                <div className="h-16" />
            </div>
        </div>
    )
}

