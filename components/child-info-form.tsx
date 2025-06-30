"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { FormField } from "@/components/ui/form-field"
import { DatePicker } from "@/components/ui/date-picker"
import { GenderSelect } from "@/components/ui/gender-select"
import {format} from "date-fns";
import {SelectField} from "@/components/ui/select-field";

interface ChildInfoFormProps {
    open: boolean
    onClose: () => void
    onSubmit: (data: { firstName: string; lastName: string; dateOfBirth: string; gender: string; supportingParentId?: string}) => void
    supportingParents: { id: string; name: string }[]
    sameParentsForAllChildren: boolean
}

export function ChildInfoForm({ open, onClose, onSubmit, supportingParents, sameParentsForAllChildren}: ChildInfoFormProps) {
    const [date, setDate] = useState<Date | undefined>(undefined)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const gender = formData.get("gender") as string
        const customGender = formData.get("gender-custom") as string
        const finalGender = gender === "other" && customGender ? customGender : gender

        const data = {
            firstName: formData.get("firstName") as string,
            lastName: formData.get("lastName") as string,
            dateOfBirth: date ? format(date, "dd/MM/yyyy") : "",
            gender: finalGender,
            supportingParentId: !sameParentsForAllChildren ? (formData.get("supportingParent") as string) : undefined,
        }

        onSubmit(data)

        toast({
            title: "Child information added",
            description: "successfully",
            duration: 500,
        })
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>The child&apos;s information</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="First name">
                        <Input placeholder="First name" name="firstName" required />
                    </FormField>

                    <FormField label="Last name">
                        <Input placeholder="Last name" name="lastName" required />
                    </FormField>

                    <FormField label="Gender">
                        <GenderSelect name="gender" />
                    </FormField>

                    <FormField label="Date of birth">
                        <DatePicker selected={date} onSelect={(date) => setDate(date)} />
                    </FormField>

                    {!sameParentsForAllChildren && (
                        <FormField label="Supporting Parent">
                            <SelectField
                                options={supportingParents.map((parent) => ({ value: parent.id, label: parent.name }))}
                                placeholder="Select supporting parent"
                                name="supportingParent"
                            />
                        </FormField>
                    )}
                    <div className="flex justify-between">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Submit
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

