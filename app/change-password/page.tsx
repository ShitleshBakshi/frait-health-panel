"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

export default function ChangePasswordPage() {
    const router = useRouter()
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const validatePassword = (password: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{16,}$/
        return regex.test(password)
    }

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess(false)

        if (!validatePassword(newPassword)) {
            setError("New password does not meet the requirements.")
            return
        }

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.")
            return
        }

        // In a real application, you would send a request to change the password here
        setSuccess(true)
        // Optionally, redirect to dashboard after a delay
        setTimeout(() => router.push("/dashboard"), 2000)
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 bg-gray-50 p-6">
                    <div className="max-w-md mx-auto space-y-8">
                        <div>
                            <h1 className="text-2xl font-bold">Change Password</h1>
                            <p className="text-sm text-gray-600 mt-2">Update your password using the form below.</p>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="current-password" className="block text-sm font-medium">
                                        Current Password
                                    </label>
                                    <Input
                                        id="current-password"
                                        type="password"
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="new-password" className="block text-sm font-medium">
                                        New Password
                                    </label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="confirm-password" className="block text-sm font-medium">
                                        Confirm New Password
                                    </label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert>
                                    <AlertDescription>Password changed successfully. Redirecting to dashboard...</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-4">
                                <Button type="submit" className="w-full bg-[#1e56b0] hover:bg-[#1a4c9e]">
                                    Change Password
                                </Button>
                            </div>
                        </form>

                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <h2 className="text-sm font-semibold text-blue-800 mb-2">Password Requirements:</h2>
                            <ul className="list-disc list-inside text-sm text-blue-700">
                                <li>Must be at least 16 characters long</li>
                                <li>Must contain uppercase and lowercase letters</li>
                                <li>Must contain at least one numeric character</li>
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

