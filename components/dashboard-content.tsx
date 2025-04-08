"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { HealthVisitorSearch } from "./HealthVisitorSearch"
import { UserRoleManagement } from "./UserRoleManagement"

interface StatisticProps {
    title: string
    value: number
    isLoading?: boolean
}

function Statistic({ title, value, isLoading = false }: StatisticProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                    <p className="text-2xl font-bold">{value}</p>
                )}
            </CardContent>
        </Card>
    )
}

export function DashboardContent() {
    const user = useSelector((state: RootState) => state.user)
    const { user: authUser } = useAuth()
    const families = useSelector((state: RootState) => state.family.families)
    const assessments = useSelector((state: RootState) => state.family.assessments)

    // State for storing user counts
    const [healthVisitorCount, setHealthVisitorCount] = useState(0)
    const [assistantHealthVisitorCount, setAssistantHealthVisitorCount] = useState(0)
    const [isLoadingCounts, setIsLoadingCounts] = useState(false)

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

    useEffect(() => {
        if (authUser?.role === "Manager") {
            const fetchUserCounts = async () => {
                setIsLoadingCounts(true)
                try {
                    // Use the existing filterUsers query with role parameter
                    const healthVisitorQuery = `
                      query {
                        filterUsers(role: "Health Visitor") {
                          id
                        }
                      }
                    `

                    const assistantHealthVisitorQuery = `
                      query {
                        filterUsers(role: "Assistant Health Visitor") {
                          id
                        }
                      }
                    `

                    // Execute both queries in parallel
                    const [hvResponse, ahvResponse] = await Promise.all([
                        fetch('/graphql', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ query: healthVisitorQuery })
                        }),
                        fetch('/graphql', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ query: assistantHealthVisitorQuery })
                        })
                    ])

                    // Process responses
                    if (!hvResponse.ok || !ahvResponse.ok) {
                        throw new Error('Failed to fetch user counts')
                    }

                    const hvData = await hvResponse.json()
                    const ahvData = await ahvResponse.json()

                    if (hvData.errors || ahvData.errors) {
                        throw new Error('GraphQL errors occurred')
                    }

                    // Set the counts based on the number of users returned
                    setHealthVisitorCount(hvData.data.filterUsers.length)
                    setAssistantHealthVisitorCount(ahvData.data.filterUsers.length)
                } catch (error) {
                    
                } finally {
                    setIsLoadingCounts(false)
                }
            }

            fetchUserCounts()
        }
    }, [authUser?.role])

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