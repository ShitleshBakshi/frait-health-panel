"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-[#1e2756] text-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center h-20">
                        <div className="relative h-12 w-48">
                            <Image
                                src="/Frait-Logo.png"
                                alt="Logo"
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

                    <form className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="username" className="block text-sm font-medium">
                                    Username
                                </label>
                                <Input id="username" type="text" required />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium">
                                    Password
                                </label>
                                <Input id="password" type="password" required />
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

