"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { fetchGraphQL } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/auth-context'
import { Loader2 } from "lucide-react"

// Define user type interface
interface DatabaseUser {
    id: string | number;
    name: string;
    email: string;
    role: string;
    external_id?: string;
    identity_provider?: string;
}

// This is a development-only utility for testing authentication with database users
// DO NOT USE IN PRODUCTION

const GET_USERS_QUERY = `
  query GetUsers {
    getUsers(limit: 50) {
      id
      name
      email
      role
      externalId
      identityProvider
    }
  }
`;

// Modified mutation to login with a specific user ID
// Note: You'll need to create this mutation in your backend
const LOGIN_WITH_USER_ID_MUTATION = `
  mutation LoginWithUserId($userId: Int!) {
    loginWithUserId(userId: $userId) {
      success
      message
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export default function DbUserAuthTestUtility() {
    const [users, setUsers] = useState<DatabaseUser[]>([])
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [loginStatus, setLoginStatus] = useState<{
        success: boolean;
        message: string;
        inProgress: boolean;
    }>({ success: false, message: '', inProgress: false })

    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        // Load users from the backend
        const loadUsers = async () => {
            try {
                setLoading(true)
                const data = await fetchGraphQL(GET_USERS_QUERY)
                if (data?.getUsers) {
                    setUsers(data.getUsers)
                }
            } catch (error) {
                console.error('Error loading users:', error)
                toast({
                    title: 'Error',
                    description: 'Failed to load database users. Check console for details.',
                    variant: 'destructive'
                })
            } finally {
                setLoading(false)
            }
        }

        loadUsers()
    }, [toast])

    const handleLogin = async () => {
        if (!selectedUserId) {
            toast({
                title: 'Error',
                description: 'Please select a user to test with',
                variant: 'destructive'
            })
            return
        }

        try {
            setLoginStatus({ success: false, message: 'Authenticating...', inProgress: true })
            setLoading(true)

            // Call backend to login with the selected user ID
            // Note: You'll need to implement this mutation in your backend
            const data = await fetchGraphQL(
                LOGIN_WITH_USER_ID_MUTATION,
                { userId: parseInt(selectedUserId) }
            )

            if (data?.loginWithUserId?.success) {
                const { token, user } = data.loginWithUserId

                // Store auth token in localStorage
                localStorage.setItem('auth_token', token)

                setLoginStatus({
                    success: true,
                    message: `Authentication successful as ${user.name}`,
                    inProgress: false
                })

                toast({
                    title: 'Success',
                    description: `Logged in as ${user.name} (${user.role})`
                })

                // Redirect to dashboard after a brief delay to show success message
                setTimeout(() => router.push('/dashboard'), 1500)
            } else {
                setLoginStatus({
                    success: false,
                    message: data?.loginWithUserId?.message || 'Authentication failed.',
                    inProgress: false
                })

                toast({
                    title: 'Authentication Failed',
                    description: data?.loginWithUserId?.message || 'Failed to authenticate with selected user',
                    variant: 'destructive'
                })
            }
        } catch (error) {
            console.error('Login error:', error)
            setLoginStatus({
                success: false,
                message: 'Authentication error. See console for details.',
                inProgress: false
            })

            toast({
                title: 'Error',
                description: 'Failed to authenticate. Check console for details.',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    // Get role color based on user role
    const getRoleColor = (role: string) => {
        switch(role) {
            case UserRole.ADMIN:
                return 'bg-red-100 text-red-800'
            case UserRole.MANAGER:
                return 'bg-green-100 text-green-800'
            case UserRole.HEALTH_VISITOR:
                return 'bg-blue-100 text-blue-800'
            case UserRole.ASSISTANT_HEALTH_VISITOR:
                return 'bg-purple-100 text-purple-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    // Group users by role for better selection
    const usersByRole = users.reduce((acc, user) => {
        const role = user.role || 'Unknown'
        if (!acc[role]) acc[role] = []
        acc[role].push(user)
        return acc
    }, {} as Record<string, any[]>)

    // Sort roles by importance
    const sortedRoles = Object.keys(usersByRole).sort((a, b) => {
        const roleOrder = {
            [UserRole.ADMIN]: 1,
            [UserRole.MANAGER]: 2,
            [UserRole.HEALTH_VISITOR]: 3,
            [UserRole.ASSISTANT_HEALTH_VISITOR]: 4,
            'Unknown': 5
        }
        return (roleOrder[a as UserRole] || 99) - (roleOrder[b as UserRole] || 99)
    })

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">DB User Authentication Testing</CardTitle>
                    <p className="text-center text-sm text-gray-500">
                        Test with actual database users
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm font-medium text-yellow-800 mb-1">Testing with Database Users:</p>
                        <p className="text-xs text-yellow-700">
                            This utility authenticates with actual users from the database,
                            bypassing Windows authentication for testing purposes.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select User for Testing</label>
                        <Select
                            value={selectedUserId}
                            onValueChange={setSelectedUserId}
                            disabled={loading || loginStatus.inProgress}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a user..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {sortedRoles.map(role => (
                                    <div key={role} className="pb-2">
                                        <div className={`px-2 py-1 text-xs font-semibold ${getRoleColor(role)}`}>
                                            {role}
                                        </div>
                                        {usersByRole[role].map(user => (
                                            <SelectItem key={user.id} value={user.id.toString()} className="pl-4">
                                                {user.name} {user.external_id ? `(${user.external_id})` : ''}
                                            </SelectItem>
                                        ))}
                                    </div>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedUserId && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md space-y-1">
                            {(() => {
                                const user = users.find(u => u.id.toString() === selectedUserId)
                                if (!user) return null
                                return (
                                    <>
                                        <p className="text-sm">
                                            <span className="font-semibold">Name:</span> {user.name}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-semibold">Role:</span> {user.role}
                                        </p>
                                        {user.external_id && (
                                            <p className="text-sm">
                                                <span className="font-semibold">Windows ID:</span> {user.external_id}
                                            </p>
                                        )}
                                        <p className="text-sm">
                                            <span className="font-semibold">Email:</span> {user.email}
                                        </p>
                                        {user.identity_provider && (
                                            <p className="text-sm">
                                                <span className="font-semibold">Provider:</span> {user.identity_provider}
                                            </p>
                                        )}
                                    </>
                                )
                            })()}
                        </div>
                    )}

                    <Button
                        onClick={handleLogin}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={loading || loginStatus.inProgress || !selectedUserId}
                    >
                        {loginStatus.inProgress ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            'Login with Selected DB User'
                        )}
                    </Button>

                    {loginStatus.message && (
                        <div className={`p-3 rounded-md ${
                            loginStatus.inProgress ? 'bg-blue-50 border border-blue-200' :
                                loginStatus.success ? 'bg-green-50 border border-green-200' :
                                    'bg-red-50 border border-red-200'
                        }`}>
                            <p className={`text-sm ${
                                loginStatus.inProgress ? 'text-blue-800' :
                                    loginStatus.success ? 'text-green-800' :
                                        'text-red-800'
                            }`}>
                                {loginStatus.message}
                            </p>
                        </div>
                    )}

                    <div className="text-xs text-gray-500 mt-4">
                        <p>Important Notes:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>This utility is for testing purposes only</li>
                            <li>All users are loaded directly from your database</li>
                            <li>No mock users or fake data is used</li>
                            <li>In production, Windows authentication will be used instead</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}