"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

// Mock data for available assistants
const MOCK_ASSISTANTS = [
    { id: "asst_1", name: "Assistant Smith" },
    { id: "asst_2", name: "Assistant Johnson" },
    { id: "asst_3", name: "Assistant Williams" },
]

interface FamilyAssignmentModalProps {
    open: boolean
    onClose: () => void
    familyId: string
    familyName: string
}

export function FamilyAssignmentModal({
                                          open,
                                          onClose,
                                          familyId,
                                          familyName
                                      }: FamilyAssignmentModalProps) {
    const [selectedAssistant, setSelectedAssistant] = useState<string>("")
    const { assignFamily } = useAuth()
    const { toast } = useToast()

    // Reset selection when modal opens
    useEffect(() => {
        if (open) {
            setSelectedAssistant("")
        }
    }, [open])

    const handleAssign = () => {
        if (!selectedAssistant) {
            toast({
                title: "Selection Required",
                description: "Please select an Assistant Health Visitor to assign this family to.",
                variant: "destructive",
            })
            return
        }

        // Assign the family to the selected assistant
        assignFamily(familyId, selectedAssistant)

        toast({
            title: "Family Assigned",
            description: `Family "${familyName}" has been assigned to the selected Assistant Health Visitor.`,
        })

        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Assign Family to Assistant Health Visitor</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div>
                        <p className="font-medium mb-2">Family:</p>
                        <p>{familyName}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="font-medium">Select Assistant Health Visitor:</label>
                        <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an Assistant Health Visitor" />
                            </SelectTrigger>
                            <SelectContent>
                                {MOCK_ASSISTANTS.map(assistant => (
                                    <SelectItem key={assistant.id} value={assistant.id}>
                                        {assistant.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleAssign} className="bg-blue-600 hover:bg-blue-700">
                        Assign Family
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}