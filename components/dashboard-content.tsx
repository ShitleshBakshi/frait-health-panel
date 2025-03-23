"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { HealthVisitorSearch } from "./HealthVisitorSearch"
import { UserRoleManagement } from "./UserRoleManagement"

interface StatisticProps {
    title: string
    value: number
}

function Statistic({ title, value }: StatisticProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{value}</p>
            </CardContent>
        </Card>
    )
}

export function DashboardContent() {
    const user = useSelector((state: RootState) => state.user)
    const { user: authUser } = useAuth()
    const families = useSelector((state: RootState) => state.family.families)
    const assessments = useSelector((state: RootState) => state.family.assessments)

    // Get counts for different assessment statuses
    const completedAssessments = assessments.filter(a => a.status === "DONE").length
    const inProgressAssessments = assessments.filter(a => a.status === "IN PROGRESS").length
    const pendingAssessments = assessments.filter(a => a.status === "PENDING_APPROVAL").length

    if (authUser?.role === "Admin") {
        return (
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Welcome {user.username} - Administrator Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Use this dashboard to manage user roles and permissions.
                    </p>
                </div>

                <UserRoleManagement />
            </div>
        )
    }

    if (authUser?.role === "Manager") {
        return (
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Welcome {user.username} - {user.healthBoard}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Track health visitor performance and assessment statuses.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Statistic title="Families" value={families.length} />
                        <Statistic title="All Assessments" value={assessments.length} />
                        <Statistic title="Completed Assessments" value={completedAssessments} />
                        <Statistic title="Pending Approvals" value={pendingAssessments} />
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Health Visitor Performance</h2>
                    <HealthVisitorSearch />
                </div>
            </div>
        )
    }

    // For Health Visitor role
    if (authUser?.role === "Health Visitor") {
        return (
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Welcome {user.username} - {user.healthBoard}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage families and review assessment submissions.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Statistic title="Families" value={families.length} />
                        <Statistic title="Assessments" value={assessments.length} />
                        <Statistic title="Pending Approvals" value={pendingAssessments} />
                    </div>
                </div>

                {pendingAssessments > 0 && (
                    <Card className="bg-orange-50 border-orange-200">
                        <CardHeader>
                            <CardTitle className="text-orange-800">Pending Approvals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-orange-700">
                                You have {pendingAssessments} assessment{pendingAssessments !== 1 ? 's' : ''} pending your approval.
                                Please review these submissions from Assistant Health Visitors.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        )
    }

    // For Assistant Health Visitor role
    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    Welcome {user.username} - {user.healthBoard}
                </h1>
                <p className="text-gray-600 mt-2">
                    View assigned families and complete assessments.
                </p>
            </div>

            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Statistic
                        title="Assigned Families"
                        value={authUser?.assignedFamilies?.length || 0}
                    />
                    <Statistic title="Assessments" value={assessments.length} />
                    <Statistic title="Completed Assessments" value={completedAssessments} />
                </div>
            </div>
        </div>
    )
}