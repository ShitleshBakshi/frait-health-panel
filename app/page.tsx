"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useDispatch } from "react-redux"
import { setUser } from "@/lib/slices/userSlice"

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const { toast } = useToast()
    const dispatch = useDispatch()

    const validatePassword = (password: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{16,}$/
        return regex.test(password)
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validatePassword(password)) {
            setError("Invalid password. Please check the password requirements.")
            toast({
                title: "Login Failed",
                description: "Invalid password. Please check the password requirements.",
                variant: "destructive",
            })
            return
        }
        // TODO: perform authentication here
        try {
            const user = await login(username, password)
            dispatch(
                setUser({
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    healthBoard: "Swansea Uni Health Board", // This should come from the backend in a real application
                }),
            )
            toast({
                title: "Login Successful",
                description: "Welcome back!",
            })
            router.push("/dashboard")
        } catch (error) {
            setError("Invalid credentials. Please try again.")
            toast({
                title: "Login Failed",
                description: "Please check your credentials and try again.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-[#1e2756] text-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-24 relative">
                            <Image
                                src="/Frait-Logo.png"
                                alt="FRAIT Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <nav className="hidden md:flex ml-8 space-x-6">
                            <Link href="/" className="hover:text-gray-200">
                                Home
                            </Link>
                            <Link href="/" className="hover:text-gray-200">
                                Content to add
                            </Link>
                            <Link href="/" className="hover:text-gray-200">
                                Content to add
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto space-y-8">
                    <div>
                        <h1 className="text-2xl font-bold">Login</h1>
                        <p className="text-sm text-gray-600 mt-2">Please enter your credentials to access your account.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="username" className="block text-sm font-medium">
                                    Username
                                </label>
                                <Input
                                    id="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium">
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox id="save-password" />
                                <label
                                    htmlFor="save-password"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Save Password
                                </label>
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4">
                            <Button type="submit" className="w-full bg-[#1e56b0] hover:bg-[#1a4c9e]">
                                Login
                            </Button>

                            <div className="flex items-center justify-between">
                                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                                    Forgotten password?
                                </Link>
                                <Link href="/register" className="text-sm text-blue-600 hover:underline">
                                    New Registration
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

