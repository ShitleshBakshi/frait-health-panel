"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
    calculateCategoryScores,
    calculateOverallScore,
    shouldHighlightCell, type CategoryScores
} from "@/lib/assessment-utils";


export default function FRAIReport() {
    const router = useRouter();
    const params = useParams();
    const familyId = params?.id as string;
    const assessmentId = params?.assessid as string;

    const assessmentData = useSelector((state: RootState) =>
        state.family.assessments.find(a => a.id === assessmentId)
    );

    const [scores, setScores] = useState<CategoryScores>({
        "responsive-parenting": 0,
        "family-health": 0,
        "engagement": 0,
        "family-support": 0,
        "socio-economic": 0
    });
    const [overallScore, setOverallScore] = useState<number>(0);

    useEffect(() => {
        if (assessmentData) {
            // Calculate scores based on the current assessment data
            const scores = calculateCategoryScores({
                assessment: {
                    currentAssessment: {
                        mainParentAssessment: assessmentData.mainParentAssessment,
                        externalInfluenceAssessment: assessmentData.externalInfluenceAssessment,
                        familyId: null,
                        assessmentId: null
                    }
                }
            } as RootState);

            setScores(scores);
            setOverallScore(calculateOverallScore(scores));
        }
    }, [assessmentData]);

    if (!assessmentData) {
        return <div className="p-6">Assessment not found</div>;
    }

    const familyName = assessmentData.mainParent.lastName;

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const assessmentDate = formatDate(assessmentData.createdAt);

    const handlePrint = () => {
        const printContents = document.getElementById('printable-report')?.innerHTML;
        const originalContents = document.body.innerHTML;

        if (printContents) {
            const printStyles = `
        body { 
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        table { 
          width: 100%;
          border-collapse: separate;
          border-spacing: 2px;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px;
        }
        th {
          background-color: #1e56b0;
          color: white;
          text-align: center;
        }
        .header-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .header-box {
          background-color: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          width: 48%;
        }
        .title {
          text-align: center;
          margin-bottom: 24px;
          font-size: 24px;
          font-weight: bold;
        }
        .score-box {
          background-color: #1e56b0;
          color: white;
          padding: 16px;
          border-radius: 8px;
          margin: 24px 0;
        }
        .score-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .score-item {
          background-color: #1f2937;
          padding: 16px;
          border-radius: 8px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .score-circle {
          width: 32px;
          height: 32px;
          background-color: #22c55e;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          margin-right: 12px;
        }
        .highlighted-cell {
          background-color: #fef9c3;
        }
        .score-wrapper {
          display: flex;
          align-items: center;
        }
        @media print {
          @page {
            size: landscape;
            margin: 1cm;
          }
        }
      `;

            document.body.innerHTML = `
        <style>${printStyles}</style>
        <div>
          <div class="title">Family Resilience Assessment Instrument</div>
          
          <div class="header-row">
            <div class="header-box">
              <p style="font-weight: 500;">Date of Initial Assessment/Review:</p>
              <p style="font-size: 18px;">${assessmentDate}</p>
            </div>
            <div class="header-box">
              <p style="font-weight: 500;">Name of Family Assessed:</p>
              <p style="font-size: 18px;">${familyName}</p>
            </div>
          </div>

          ${printContents}
        </div>
      `;

            window.print();
            document.body.innerHTML = originalContents;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Family Resilience Assessment Instrument</h1>
                <Button
                    onClick={() => router.push(`/families/${familyId}`)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Back to Family
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">Date of Initial Assessment/Review:</p>
                    <p className="text-lg">{assessmentDate}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">Name of Family Assessed:</p>
                    <p className="text-lg">{familyName}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full border-separate border-spacing-0">
                    <thead>
                    <tr>
                        <th className="border p-2 bg-[#1e56b0] text-white text-center"></th>
                        <th className="border p-2 bg-[#1e56b0] text-white text-center">Responsive Parenting</th>
                        <th className="border p-2 bg-[#1e56b0] text-white text-center">Family Health</th>
                        <th className="border p-2 bg-[#1e56b0] text-white text-center">Engagement</th>
                        <th className="border p-2 bg-[#1e56b0] text-white text-center">Family Support</th>
                        <th className="border p-2 bg-[#1e56b0] text-white text-center">Socio/Economic Factors</th>
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
                            "Parental chronic health problems seldom have impact on the child's needs",
                            "Parents usually recognise the negative impact of dysfunctional behaviour in others on their family",
                            "History of being mainly able to withstand adversity",
                            "Always able to meet regular financial demands but not always able to meet large unexpected financial demands",
                        ],
                        [
                            "Parental childhood experience has led to a conflicting impact on the child's needs.",
                            "Parental chronic health problems sometimes have impact on the child's needs",
                            "Parents sometimes recognise the negative impact of others' dysfunctional behaviour on their family",
                            "Current evidence does not allow a judgement to be made about withstanding adversity.",
                            "Able to meet prioritised financial demands but forced to neglect deprioritised financial demands",
                        ],
                        [
                            "Parental childhood experience has a mainly negative impact on the child's needs",
                            "Parental chronic health problems often impact on the child's needs",
                            "Parents usually do not recognise the negative impact of others' dysfunctional behaviour on their family",
                            "History of being mainly unable to withstand adversity",
                            "Occasionally able to meet prioritised financial demands but sometimes forced to neglect them",
                        ],
                        [
                            "Parental childhood experience has an entirely negative impact on the child's needs",
                            "Parental chronic health problems have a constant impact on the child's needs",
                            "Parents never recognise the negative impact of others' dysfunctional behaviour on their family",
                            "History of being entirely unable to withstand adversity",
                            "Not able to meet prioritised financial demands",
                        ],
                    ].map((rowTexts, rowIndex) => (
                        <tr key={5 - rowIndex}>
                            <td className="border p-2 font-bold text-center bg-gray-50 w-16">{5 - rowIndex}</td>
                            {rowTexts.map((text, colIndex) => {
                                const categories = [
                                    "responsive-parenting",
                                    "family-health",
                                    "engagement",
                                    "family-support",
                                    "socio-economic",
                                ];
                                const isHighlighted = shouldHighlightCell(rowIndex, colIndex, scores);

                                return (
                                    <td
                                        key={colIndex}
                                        className={`border p-2 text-sm ${
                                            isHighlighted ? "bg-yellow-200" : ""
                                        }`}
                                    >
                                        {text}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 mb-4 bg-[#1e56b0] text-white p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Final Score: {overallScore} out of 25</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                {Object.entries(scores).map(([category, score]) => (
                    <div key={category} className="bg-[#1f2937] p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                                {score}
                            </div>
                            <div>
                                <h4 className="text-white text-sm">
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

            <div className="flex justify-between mt-6">
                <Button
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Print Report
                </Button>
                <Button
                    onClick={() => router.push(`/families/${familyId}`)}
                    className="bg-gray-600 hover:bg-gray-700"
                >
                    Back to Family
                </Button>
            </div>
        </div>
    );
}