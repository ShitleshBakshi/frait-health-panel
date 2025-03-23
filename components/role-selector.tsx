"use client"

import {useEffect, useState} from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useDispatch } from "react-redux"
import { useAuth } from "@/lib/auth-context"
import {setUser} from "@/lib/slices/userSlice"

export default function RoleSelector() {
    const router = useRouter()
    const dispatch = useDispatch()
    const { toast } = useToast()
    const { selectRole, user } = useAuth()
    const [selectedRole, setSelectedRole] = useState<string>("")

    useEffect(() => {
        if (user && user.role) {
            router.push("/dashboard")
        }
    }, [user, router])

    const handleRoleSelect = async () => {
        if (!selectedRole) {
            toast({
                title: "Role Selection Required",
                description: "Please select a role to continue",
                variant: "destructive",
            })
            return
        }

        try {
            const user = await selectRole(selectedRole)
            dispatch(
                setUser({
                    id: user.id,
                    username: `Example ${selectedRole}`,
                    role: user.role,
                    healthBoard: "Swansea Uni Health Board",
                })
            )
            toast({
                title: "Role Selected",
                description: `You are now using the application as: ${selectedRole}`,
            })
            router.push("/dashboard")
        } catch (error) {
            toast({
                title: "Role Selection Failed",
                description: "An error occurred selecting the role.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-[#1e2756] text-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center h-16">
                        <div className="h-10 w-24 relative">
                            {/* Logo would go here */}
                            <div className="text-xl font-bold">FRAIT</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Select Your Role</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Role</label>
                            <Select onValueChange={setSelectedRole} value={selectedRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role to continue" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Health Visitor">Health Visitor</SelectItem>
                                    <SelectItem value="Assistant Health Visitor">Assistant Health Visitor</SelectItem>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="button"
                            onClick={handleRoleSelect}
                            className="w-full bg-[#1e56b0] hover:bg-[#1a4c9e]"
                        >
                            Continue
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}