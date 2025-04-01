"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { assignFamilyToAssistant } from "@/lib/slices/userSlice"
import type { RootState } from "@/lib/store"
import type { Family } from "@/lib/slices/familySlice"

// Interface for Assistant Health Visitor user
interface AssistantUser {
    id: string
    username: string
    role: string
}

interface FamilyAssignmentModalProps {
    open: boolean
    onClose: () => void
}

export function FamilyAssignmentModal({
                                          open,
                                          onClose,
                                      }: FamilyAssignmentModalProps) {
    const [selectedFamilies, setSelectedFamilies] = useState<string[]>([])
    const [selectedAssistant, setSelectedAssistant] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState("")
    const dispatch = useDispatch()
    const { toast } = useToast()

    // Get all users from redux state - in a real app, this would be filtered by role in the backend
    // For now, we'll use mock data for Assistant Health Visitors
    const assistantHealthVisitors = [
        { id: "user2", username: "Assistant Smith", role: "Assistant Health Visitor" },
        { id: "asst_2", username: "Assistant Johnson", role: "Assistant Health Visitor" },
        { id: "asst_3", username: "Assistant Williams", role: "Assistant Health Visitor" },
    ];

    // Get families from Redux store
    const families = useSelector((state: RootState) => state.family.families)

    // Filter families based on search term
    const filteredFamilies = families.filter((family) => {
        if (!family || !family.name) return false;
        return family.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Reset selection when modal opens
    useEffect(() => {
        if (open) {
            setSelectedFamilies([])
            setSelectedAssistant("")
            setSearchTerm("")
        }
    }, [open])

    const handleAssign = () => {
        if (!selectedAssistant) {
            toast({
                title: "Selection Required",
                description: "Please select an Assistant Health Visitor.",
                variant: "destructive",
            })
            return
        }

        if (selectedFamilies.length === 0) {
            toast({
                title: "Selection Required",
                description: "Please select at least one family to assign.",
                variant: "destructive",
            })
            return
        }

        // Dispatch action to assign families in Redux
        selectedFamilies.forEach(familyId => {
            dispatch(assignFamilyToAssistant({
                familyId,
                assistantId: selectedAssistant
            }))
        })

        // Get the selected assistant's name
        const assistant = assistantHealthVisitors.find(a => a.id === selectedAssistant)

        toast({
            title: "Families Assigned",
            description: `${selectedFamilies.length} ${selectedFamilies.length === 1 ? 'family' : 'families'} assigned to ${assistant?.username}.`,
        })

        onClose()
    }

    const toggleFamilySelection = (familyId: string) => {
        setSelectedFamilies(prev => {
            if (prev.includes(familyId)) {
                return prev.filter(id => id !== familyId)
            } else {
                return [...prev, familyId]
            }
        })
    }

    const isAllSelected = selectedFamilies.length === filteredFamilies.length && filteredFamilies.length > 0

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedFamilies([])
        } else {
            setSelectedFamilies(filteredFamilies.map(family => family.id.toString()))
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Assign Families</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-72">
                            <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Health Visitor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {assistantHealthVisitors.map(assistant => (
                                        <SelectItem key={assistant.id} value={assistant.id}>
                                            {assistant.username}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleAssign}
                            disabled={selectedFamilies.length === 0 || !selectedAssistant}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Assign Selected
                        </Button>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="flex items-center gap-1"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Families
                    </Button>

                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search families..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="border rounded-lg bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="w-16">#</TableHead>
                                <TableHead>NAME</TableHead>
                                <TableHead>NHS NUMBER</TableHead>
                                <TableHead>UPDATED AT</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredFamilies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                                        No families found matching your search criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredFamilies.map((family) => (
                                    <TableRow key={family.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedFamilies.includes(family.id.toString())}
                                                onCheckedChange={() => toggleFamilySelection(family.id.toString())}
                                            />
                                        </TableCell>
                                        <TableCell>{family.id}</TableCell>
                                        <TableCell>{family.name}</TableCell>
                                        <TableCell>{family.nhsNumber || "-"}</TableCell>
                                        <TableCell>{family.updatedAt}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}