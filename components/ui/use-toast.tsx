"use client"

import { useState, useCallback } from "react"
import type * as React from "react"

interface Toast {
    id: string
    title?: string
    description?: string
    action?: React.ReactNode
    duration?: number
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback(({ title, description, action, duration = 5000 }: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substr(2, 9)
        const toast: Toast = { id, title, description, action, duration }

        setToasts((currentToasts) => [...currentToasts, toast])

        if (duration)
            setTimeout(() => {
                setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id))
            }, duration)
    }, [])

    return {
        toast: addToast,
        toasts,
        dismissToast: (id: string) => setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id)),
    }
}

