"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Input } from "./input"

interface GenderSelectProps {
    name: string
    placeholder?: string
}

export function GenderSelect({ name, placeholder = "Select gender" }: GenderSelectProps) {
    const [selectedGender, setSelectedGender] = useState<string>("")
    const [customGender, setCustomGender] = useState<string>("")

    const genderOptions = [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Others - Please specify" },
    ]

    return (
        <div className="space-y-2">
            <Select name={name} value={selectedGender} onValueChange={(value) => setSelectedGender(value)}>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {selectedGender === "other" && (
                <Input
                    name={`${name}-custom`}
                    placeholder="Please specify gender"
                    value={customGender}
                    onChange={(e) => setCustomGender(e.target.value)}
                    className="mt-2"
                />
            )}
        </div>
    )
}

