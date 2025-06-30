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
import {useMsal} from "@azure/msal-react";
import {tokenRequest} from "@/lib/msal-config";
import {InteractionRequiredAuthError} from "@azure/msal-common";

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
    const { instance, accounts } = useMsal();

    // Get all users from redux state - in a real app, this would be filtered by role in the backend
    const [assistantHealthVisitors, setAssistantHealthVisitors] = useState<AssistantUser[]>([]);

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
            // Fetch Assistant Health Visitors from backend
            const fetchAssistants = async () => {
                try {
                    const tokenResponse = await instance.acquireTokenSilent({
                        ...tokenRequest, 
                        account: accounts[0]
                    });

                    // Find the group by display name
                    const groupName = "POW_EFRAIT_AssistantHealthVisitors";
                    const groupSearchResponse = await fetch(
                        `https://graph.microsoft.com/v1.0/groups?$filter=displayName eq '${groupName}'`,
                        {
                            headers: {
                                Authorization: `Bearer ${tokenResponse.accessToken}`
                            }
                        }
                    );

                    if (!groupSearchResponse.ok) {
                        throw new Error("Failed to search for group");
                    }

                    const groupSearchData = await groupSearchResponse.json();

                    if (groupSearchData.value.length === 0) {
                        throw new Error(`Group '${groupName}' not found`);
                    }

                    const groupId = groupSearchData.value[0].id;

                    // Fetch group members
                    const membersResponse = await fetch(
                        `https://graph.microsoft.com/v1.0/groups/${groupId}/members?$select=id,name,displayName,userPrincipalName`,
                        {
                            headers: {
                                Authorization: `Bearer ${tokenResponse.accessToken}`
                            }
                        }
                    );

                    if (!membersResponse.ok) {
                        throw new Error("Failed to fetch group members");
                    }

                    const membersData = await membersResponse.json();

                    console.log("=== MEMBER DATA DEBUG ===");
                    console.log("Raw members response:", membersData);
                    console.log("Number of members:", membersData.value?.length);
                    if (membersData.value && membersData.value.length > 0) {
                        console.log("First member raw data:", membersData.value[0]);
                        console.log("Fields available:", Object.keys(membersData.value[0]));

                        // Check each field we're trying to use
                        const firstUser = membersData.value[0];
                        console.log("user.name:", firstUser.name);  // This will likely be undefined
                        console.log("user.displayName:", firstUser.displayName);
                        console.log("user.userPrincipalName:", firstUser.userPrincipalName);

                        console.log("Member data check:");
                        membersData.value.forEach((user: any, index: number) => {
                            console.log(`User ${index}:`, {
                                id: user.id,
                                displayName: user.displayName,
                                userPrincipalName: user.userPrincipalName,
                                mail: user.mail,
                                mailNickname: user.mailNickname,
                                givenName: user.givenName,
                                surname: user.surname,
                                onPremisesSamAccountName: user.onPremisesSamAccountName,
                                preferredName: user.preferredName
                            });
                        });
                    }

                    setAssistantHealthVisitors(membersData.value.map((user: any) => {
                        // Add logging for each user
                        console.log(`Mapping user - name: ${user.name}, displayName: ${user.displayName}, UPN: ${user.userPrincipalName}`);

                        return {
                            id: user.id,
                            username: user.name || user.displayName || user.userPrincipalName,  // user.name will be undefined!
                            role: "Assistant Health Visitor"
                        };
                    }));
                }catch (error) {
                    console.error("Failed to fetch assistant health visitors:", error);
                    toast({
                        title: "Error",
                        description: `Failed to load Assistant Health Visitors: ${error}`,
                        variant: "destructive"
                    });
                }
            };

            fetchAssistants();
            setSelectedFamilies([]);
            setSelectedAssistant("");
        }
    }, [open]);



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