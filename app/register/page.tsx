"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import {
    setUsername,
    setEmail,
    setPassword,
    setConfirmPassword,
    registerUser,
    clearForm,
} from "@/lib/slices/registrationSlice"

export default function RegisterPage() {
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const { toast } = useToast()
    const { username, email, password, confirmPassword, loading, error } = useSelector(
        (state: RootState) => state.registration,
    )

    const [validationError, setValidationError] = useState("")

    const validateForm = () => {
        if (!username || !email || !password || !confirmPassword) {
            setValidationError("All fields are required")
            return false
        }
        if (password !== confirmPassword) {
            setValidationError("Passwords do not match")
            return false
        }
        if (password.length < 16) {
            setValidationError("Password must be at least 16 characters long")
            return false
        }
        setValidationError("")
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        try {
            await dispatch(registerUser()).unwrap()
            toast({
                title: "Registration Successful",
                description: "Your account has been created.",
            })
            dispatch(clearForm())
            router.push("/")
        } catch (error) {
            toast({
                title: "Registration Failed",
                description: error as string,
                variant: "destructive",
            })
        }
    }
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create new account</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{" "}
                        <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
                            sign in to your existing account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => dispatch(setUsername(e.target.value))}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => dispatch(setEmail(e.target.value))}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => dispatch(setPassword(e.target.value))}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <Input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => dispatch(setConfirmPassword(e.target.value))}
                            />
                        </div>
                    </div>

                    {(validationError || error) && (
                        <Alert variant="destructive">
                            <AlertDescription>{validationError || error}</AlertDescription>
                        </Alert>
                    )}

                    <Button type="submit" className="w-full bg-[#1e56b0] hover:bg-[#1a4c9e]" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                    </Button>
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
        </div>
    )
}

