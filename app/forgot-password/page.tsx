"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{" "}
                        <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
                            return to sign in
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <Input id="email" name="email" type="email" required className="mt-1" />
                    </div>

                    <Button type="submit" className="w-full bg-[#1e56b0] hover:bg-[#1a4c9e]">
                        Send reset link
                    </Button>
                </form>
            </div>
        </div>
    )
}

