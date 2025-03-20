"use client"
import React from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { RootState } from "@/lib/store";
import { FamilyAssessment, AssessmentLevel } from "@/type/assessment";
import { calculateCategoryScores, calculateOverallScore } from "@/lib/assessment-utils";

// Print styles for the FRAT report
const printStyles = `
@media print {
  header, nav, button, .no-print {.
    display: none !important;
  }
  body {
    background-color: white;
    margin: 0;
    padding: 0;
  }
  main {
    padding: 0 !important;
    margin: 0 !important;
    background-color: white !important;
  }
  table {
    page-break-inside: avoid;
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    border: 1px solid #ddd;
  }
  .bg-blue-100 {
    background-color: #dbeafe !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  h2 {
    page-break-before: always;
  }
  .section {
    page-break-inside: avoid;
  }
  .section:first-child h2 {
    page-break-before: avoid;
  }
}`;

interface FRATReportProps {
    assessmentId: string;
    familyId: string;
}

// Assessment item types for the different sections
interface SectionItem {
    id: number;
    title: string;
}

// Section A: Main Parent/Carer items
const sectionAItems: SectionItem[] = [
    { id: 1, title: "Main Parent/Carer's physical health" },
    { id: 2, title: "Main Parent/Carer is depressed/has mental health issues" },
    { id: 3, title: "Main Parent/Carer's lifestyle factors" },
    { id: 4, title: "Main Parent/Carer's experience of good parenting as a child" },
    { id: 5, title: "Main Parent/Carer's experience of being a parent" },
    { id: 6, title: "History of domestic abuse" }
];

// Section B: Supporting Parent/Carer items
const sectionBItems: SectionItem[] = [
    { id: 7, title: "Supporting Parent/Carer's physical health" },
    { id: 8, title: "Supporting Parent/Carer is depressed/has mental health issues" },
    { id: 9, title: "Supporting Parent/Carer's lifestyle factors" },
    { id: 10, title: "Supporting Parent/Carer's experience of good parenting as a child" },
    { id: 11, title: "Supporting Parent/Carer's experience of being a parent" },
    { id: 12, title: "History of domestic abuse" }
];

// Section C: External influence items
const sectionCItems: SectionItem[] = [
    { id: 13, title: "Parental age younger than 18 years" },
    { id: 14, title: "Number of children/young people in the household" },
    { id: 15, title: "Adequate housing" },
    { id: 16, title: "Family struggling to manage their finances" },
    { id: 17, title: "Family isolated due to cultural differences" },
    { id: 18, title: "Family access to extended family support" },
    { id: 19, title: "Family access to local charities" },
    { id: 20, title: "Family's ability to cope with stress" },
    { id: 21, title: "Family's ability to recognise problems/circumstances that need to change" },
    { id: 22, title: "Family not wanting to change when there are concerns" },
    { id: 23, title: "Family's ability to make decisions to change" },
    { id: 24, title: "Family's control over life events" },
    { id: 25, title: "Family values & beliefs affecting family health" },
    { id: 26, title: "Family basic standard of education" },
    { id: 27, title: "Family engagement with services" }
];

// Section D: Child's health and well-being items
const sectionDItems: SectionItem[] = [
    { id: 28, title: "Child's physical health" },
    { id: 29, title: "Family not attending appointments" },
    { id: 30, title: "Child's education/learning needs being met" },
    { id: 31, title: "Child's emotional development" },
    { id: 32, title: "Family tension causing stress within family" },
    { id: 33, title: "Parents' ability to provide for all physical needs" },
    { id: 34, title: "Child's feeding/eating well" },
    { id: 35, title: "Parents' awareness of the need to protect the child from harm in the home/elsewhere" },
    { id: 36, title: "Frequent attendance at Emergency Department(s)" }
];

// Assessment level labels
const assessmentLevels = ["No concern", "Low", "Low/Med", "Med", "Med/High", "High"];

export default function FRATReport({ assessmentId, familyId }: FRATReportProps) {
    const router = useRouter();
    const assessment = useSelector((state: RootState) =>
        state.family.assessments.find(a => a.id === assessmentId)
    ) as FamilyAssessment | undefined;

    const scores = useSelector((state: RootState) => calculateCategoryScores(state));
    const overallScore = calculateOverallScore(scores);

    if (!assessment) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex flex-1">
                    <Sidebar />
                    <main className="flex-1 bg-gray-50 p-6 flex justify-center items-center">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold mb-4">Assessment not found</h1>
                            <Button
                                onClick={() => router.push(`/families/${familyId}`)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Return to Family
                            </Button>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const {
        mainParent,
        supportingParents,
        children,
        mainParentAssessment,
        externalInfluenceAssessment,
        assessorHv,
        createdAt
    } = assessment;

    const child = children.length > 0 ? children[0] : null;
    const supportingParent = supportingParents.length > 0 ? supportingParents[0] : null;

    // Function to get assessment level for an item
    const getAssessmentLevel = (collection: any[], itemId: number): AssessmentLevel | null => {
        const item = collection.find(item => item.id === itemId);
        return item?.level || null;
    };

    // Function to format assessment level text
    const formatLevel = (level: AssessmentLevel | null): string => {
        if (!level) return '';
        return level.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('/');
    };

    // Function to check if an item has a specific level
    const hasLevel = (collection: any[], itemId: number, level: string): boolean => {
        const itemLevel = getAssessmentLevel(collection, itemId);
        if (!itemLevel) return false;
        return formatLevel(itemLevel).toLowerCase() === level.toLowerCase();
    };

    // Component to render an assessment table row
    const AssessmentRow = ({ item, collection }: { item: SectionItem, collection: any[] }) => (
        <tr className="border-t">
            <td className="px-4 py-2">{item.id}. {item.title}</td>
            {assessmentLevels.map(level => (
                <td
                    key={`${item.id}-${level}`}
                    className={`px-4 py-2 text-center ${hasLevel(collection, item.id, level) ? 'bg-blue-100' : ''}`}
                >
                    {hasLevel(collection, item.id, level) && '✓'}
                </td>
            ))}
        </tr>
    );

    // Component to render an assessment table
    const AssessmentTable = ({ items, collection }: { items: SectionItem[], collection: any[] }) => (
        <div className="border rounded-md overflow-hidden">
            <table className="w-full">
                <thead>
                <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">My concerns are about:</th>
                    {assessmentLevels.map(level => (
                        <th key={level} className="px-4 py-2 text-center w-16">{level}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {items.map(item => (
                    <AssessmentRow key={item.id} item={item} collection={collection} />
                ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col">
            <style dangerouslySetInnerHTML={{ __html: printStyles }} />
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 bg-gray-50 p-6">
                    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold">Family Resilience Assessment Tool</h1>
                                <div className="flex gap-2 no-print">
                                    <Button
                                        onClick={() => window.print()}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Print Report
                                    </Button>
                                    <Button
                                        onClick={() => router.back()}
                                        className="bg-gray-500 hover:bg-gray-600"
                                    >
                                        Back
                                    </Button>
                                </div>
                            </div>

                            {/* Header Information */}
                            <div className="section mb-8 border-b pb-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Name of Family Assessed:</p>
                                        <p className="font-medium">{mainParent.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Health Visitor completing assessment:</p>
                                        <p className="font-medium">{assessorHv}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Date of initial assessment/review:</p>
                                        <p className="font-medium">{new Date(createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Main Parent/Carer Information */}
                            <div className="section mb-8">
                                <h2 className="text-lg font-semibold mb-4">Main Parent/Carer:</h2>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Name:</p>
                                        <p className="font-medium">{mainParent.firstName} {mainParent.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">M/F:</p>
                                        <p className="font-medium">F</p> {/* Default to F for demonstration */}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Parental Responsibility:</p>
                                        <p className="font-medium">Y</p> {/* Default to Y for demonstration */}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">Relationship to Named Child:</p>
                                    <div className="grid grid-cols-4 gap-2 border rounded-md p-2">
                                        <div className="border p-2 rounded-md font-medium bg-blue-50">
                                            <p>Birth Mother</p>
                                        </div>
                                        <div className="border p-2 rounded-md">
                                            <p>Adoptive Mother</p>
                                        </div>
                                        <div className="border p-2 rounded-md">
                                            <p>Step Mother</p>
                                        </div>
                                        <div className="border p-2 rounded-md">
                                            <p>Other family member</p>
                                        </div>
                                        <div className="border p-2 rounded-md">
                                            <p>Birth Father</p>
                                        </div>
                                        <div className="border p-2 rounded-md">
                                            <p>Adoptive Father</p>
                                        </div>
                                        <div className="border p-2 rounded-md">
                                            <p>Step Father</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Main Parent/Carer's Age:</p>
                                        <p className="font-medium">35</p> {/* Placeholder age */}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">Educational qualification level:</p>
                                    <div className="grid grid-cols-6 gap-2 border rounded-md p-2">
                                        <div className="border p-2 rounded-md">
                                            <p>No qualifications</p>
                                        </div>
                                        <div className="border p-2 rounded-md">
                                            <p>Level 1</p>
                                        </div>
                                        <div className="border p-2 rounded-md font-medium bg-blue-50">
                                            <p>Level 2</p>
                                        </div>
                                        <div className="border p-2 rounded-md">
                                            <p>Level 3</p>
                                        </div>
                                        <div className="border p-2 rounded-md">
                                            <p>Level 4 & above</p>
                                        </div>
                                        <div className="border p-2 rounded-md">
                                            <p>Other qualifications</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Supporting Parent/Carer Information */}
                            {supportingParent && (
                                <div className="section mb-8">
                                    <h2 className="text-lg font-semibold mb-4">Supporting Parent/Carer:</h2>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Name:</p>
                                            <p className="font-medium">{supportingParent.firstName} {supportingParent.lastName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">M/F:</p>
                                            <p className="font-medium">M</p> {/* Default to M for demonstration */}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Parental Responsibility:</p>
                                            <p className="font-medium">Y</p> {/* Default to Y for demonstration */}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-2">Relationship to child:</p>
                                        <div className="grid grid-cols-4 gap-2 border rounded-md p-2">
                                            <div className="border p-2 rounded-md">
                                                <p>Birth Mother</p>
                                            </div>
                                            <div className="border p-2 rounded-md">
                                                <p>Adoptive Mother</p>
                                            </div>
                                            <div className="border p-2 rounded-md">
                                                <p>Step Mother</p>
                                            </div>
                                            <div className="border p-2 rounded-md">
                                                <p>Other family member</p>
                                            </div>
                                            <div className="border p-2 rounded-md font-medium bg-blue-50">
                                                <p>Birth Father</p>
                                            </div>
                                            <div className="border p-2 rounded-md">
                                                <p>Adoptive Father</p>
                                            </div>
                                            <div className="border p-2 rounded-md">
                                                <p>Step Father</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Child's Information */}
                            {child && (
                                <div className="section mb-8">
                                    <h2 className="text-lg font-semibold mb-4">Child's Information:</h2>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Child's Name:</p>
                                            <p className="font-medium">{child.firstName} {child.lastName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">M/F:</p>
                                            <p className="font-medium">{child.gender === 'male' ? 'M' : 'F'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Child's date of birth:</p>
                                            <p className="font-medium">{child.dateOfBirth}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section A: Main Parent/Carer */}
                            <div className="section mb-8">
                                <h2 className="text-lg font-semibold mb-4">Section A: Main Parent/Carer:</h2>
                                <AssessmentTable items={sectionAItems} collection={mainParentAssessment} />
                            </div>

                            {/* Section B: Supporting Parent/Carer */}
                            {supportingParent && (
                                <div className="section mb-8">
                                    <h2 className="text-lg font-semibold mb-4">Section B: Supporting Parent/Carer:</h2>
                                    {/* Using placeholder data for Section B */}
                                    <div className="border rounded-md overflow-hidden">
                                        <table className="w-full">
                                            <thead>
                                            <tr className="bg-gray-100">
                                                <th className="px-4 py-2 text-left">My concerns are about:</th>
                                                {assessmentLevels.map(level => (
                                                    <th key={level} className="px-4 py-2 text-center w-16">{level}</th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {sectionBItems.map((item, index) => (
                                                <tr key={item.id} className="border-t">
                                                    <td className="px-4 py-2">{item.id}. {item.title}</td>
                                                    <td className={`px-4 py-2 text-center ${index === 0 || index === 1 || index === 5 ? 'bg-blue-100' : ''}`}>
                                                        {(index === 0 || index === 1 || index === 5) && '✓'}
                                                    </td>
                                                    <td className={`px-4 py-2 text-center ${index === 2 || index === 4 ? 'bg-blue-100' : ''}`}>
                                                        {(index === 2 || index === 4) && '✓'}
                                                    </td>
                                                    <td className={`px-4 py-2 text-center ${index === 3 ? 'bg-blue-100' : ''}`}>
                                                        {index === 3 && '✓'}
                                                    </td>
                                                    <td className="px-4 py-2 text-center"></td>
                                                    <td className="px-4 py-2 text-center"></td>
                                                    <td className="px-4 py-2 text-center"></td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Section C: Main Parent/Carer Name */}
                            <div className="section mb-8">
                                <h2 className="text-lg font-semibold mb-4">Section C: Main Parent/Carer: {mainParent.firstName} {mainParent.lastName}</h2>
                                <AssessmentTable items={sectionCItems} collection={externalInfluenceAssessment} />
                            </div>

                            {/* Section D: Child Information */}
                            {child && (
                                <div className="section mb-8">
                                    <h2 className="text-lg font-semibold mb-4">Section D: Main Parent/Carer: {mainParent.firstName} {mainParent.lastName} - Child's Name: {child.firstName} {child.lastName}</h2>
                                    {/* Using placeholder data for Section D */}
                                    <div className="border rounded-md overflow-hidden">
                                        <table className="w-full">
                                            <thead>
                                            <tr className="bg-gray-100">
                                                <th className="px-4 py-2 text-left">My concerns are about:</th>
                                                {assessmentLevels.map(level => (
                                                    <th key={level} className="px-4 py-2 text-center w-16">{level}</th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {sectionDItems.map((item, index) => (
                                                <tr key={item.id} className="border-t">
                                                    <td className="px-4 py-2">{item.id}. {item.title}</td>
                                                    <td className={`px-4 py-2 text-center ${index !== 1 && index !== 4 ? 'bg-blue-100' : ''}`}>
                                                        {index !== 1 && index !== 4 && '✓'}
                                                    </td>
                                                    <td className={`px-4 py-2 text-center ${index === 1 ? 'bg-blue-100' : ''}`}>
                                                        {index === 1 && '✓'}
                                                    </td>
                                                    <td className={`px-4 py-2 text-center ${index === 4 ? 'bg-blue-100' : ''}`}>
                                                        {index === 4 && '✓'}
                                                    </td>
                                                    <td className="px-4 py-2 text-center"></td>
                                                    <td className="px-4 py-2 text-center"></td>
                                                    <td className="px-4 py-2 text-center"></td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}