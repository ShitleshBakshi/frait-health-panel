"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const router = useRouter()

    // Redirect to root for auto authentication
    useEffect(() => {
        router.push("/")
    }, [router])

    // Return null as this page should not be rendered
    return null
}