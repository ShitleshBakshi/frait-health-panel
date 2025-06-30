import type React from "react"
import { Label } from "./label"

interface FormFieldProps {
    label: string
    children: React.ReactNode
}

export function FormField({ label, children }: FormFieldProps) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
        </div>
    )
}

