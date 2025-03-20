"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    allowedRoles: string[]
) {
    return function AuthenticatedComponent(props: any) {
        const { user } = useAuth()
        const router = useRouter()

        useEffect(() => {
            if (!user) {
                router.push("/")
            } else if (!allowedRoles.includes(user.role)) {
                router.push("/unauthorized")
            }
        }, [user, router, allowedRoles])

        if (!user || !allowedRoles.includes(user.role)) {
            return null
        }

        return <WrappedComponent {...props} />
    }
}

