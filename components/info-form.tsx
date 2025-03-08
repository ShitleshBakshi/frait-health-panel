"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { FormField } from "@/components/ui/form-field"
import { DatePicker } from "@/components/ui/date-picker"
import { SelectField } from "@/components/ui/select-field"
import {format} from "date-fns";
import { GenderSelect } from "@/components/ui/gender-select"

export interface InfoFormProps {
    open: boolean
    onClose: () => void
    onSubmit: (data: { firstName: string; lastName: string; dateOfBirth: string }) => void
    title: string
    relationshipLabel?: string
    showParentalResponsibility?: boolean
    showInformationProvider?: boolean
}


const relationshipOptions = [
    { value: "birth-mother", label: "Birth Mother" },
    { value: "birth-father", label: "Birth Father" },
    { value: "adoptive-mother", label: "Adoptive Mother" },
    { value: "adoptive-father", label: "Adoptive Father" },
    { value: "step-mother", label: "Step Mother" },
    { value: "step-father", label: "Step Father" },
    { value: "other", label: "Other Family Member [please state e.g. Grand-mother" },
]

const educationOptions = [
    { value: "None", label: "No qualifications" },
    { value: "level1", label: "Level 1" },
    { value: "level2", label: "Level 2" },
    { value: "level3", label: "Level 3" },
    { value: "level4", label: "Level 4 and above" },
    { value: "other", label: "Other qualifications" },
]

export function InfoForm({
                             open,
                             onClose,
                             onSubmit,
                             title,
                             relationshipLabel = "Relationship to child/children",
                             showParentalResponsibility = true,
                             showInformationProvider = true,
                         }: InfoFormProps) {
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [parentalResponsibility, setParentalResponsibility] = useState(false)
    const [informationProvider, setInformationProvider] = useState(false)
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
        }

        onSubmit(data)

        toast({
            title: "Information updated",
            description: "successfully",
            duration: 500,
        })
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="First name">
                        <Input placeholder="First name" name="firstName" required />
                    </FormField>

                    <FormField label="Last name">
                        <Input placeholder="Last name" name="lastName" required />
                    </FormField>

                    <FormField label="Date of birth">
                        <DatePicker selected={date} onSelect={(date) => setDate(date)} />
                    </FormField>

                    <FormField label="Gender">
                        <GenderSelect name="gender" />
                    </FormField>

                    <FormField label={relationshipLabel}>
                        <SelectField options={relationshipOptions} placeholder="Select relationship" name="relationship" />
                    </FormField>

                    <FormField label="Educational qualification level">
                        <SelectField options={educationOptions} placeholder="Select education level" name="education" />
                    </FormField>

                    {showParentalResponsibility && (
                        <FormField label="Parental Responsibility">
                            <Switch
                                checked={parentalResponsibility}
                                onCheckedChange={setParentalResponsibility}
                                name="parentalResponsibility"
                            />
                        </FormField>
                    )}

                    {showInformationProvider && (
                        <FormField label="Information provider">
                            <Switch
                                checked={informationProvider}
                                onCheckedChange={setInformationProvider}
                                name="informationProvider"
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

