"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Edit, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { UserRole } from "@/lib/auth-context"

// Mock data for users
const initialUsers = [
    { id: "user1", name: "John Smith", email: "john.smith@example.com", role: "Health Visitor" },
    { id: "user2", name: "Sarah Johnson", email: "sarah.johnson@example.com", role: "Assistant Health Visitor" },
    { id: "user3", name: "Michael Brown", email: "michael.brown@example.com", role: "Manager" },
    { id: "user4", name: "Lisa Davis", email: "lisa.davis@example.com", role: "Admin" },
]

type User = {
    id: string
    name: string
    email: string
    role: string
}

export function UserRoleManagement() {
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [isEditUserOpen, setIsEditUserOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        role: ""
    })
    const { toast } = useToast()

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleAddUser = () => {
        if (!newUser.name || !newUser.email || !newUser.role) {
            toast({
                title: "Missing Information",
                description: "Please fill in all fields to add a new user.",
                variant: "destructive",
            })
            return
        }

        const id = `user${users.length + 1}`
        setUsers([...users, { id, ...newUser }])
        setNewUser({ name: "", email: "", role: "" })
        setIsAddUserOpen(false)

        toast({
            title: "User Added",
            description: `${newUser.name} has been added as a ${newUser.role}.`,
        })
    }

    const handleEditUser = () => {
        if (!currentUser || !currentUser.name || !currentUser.email || !currentUser.role) {
            toast({
                title: "Missing Information",
                description: "Please fill in all fields.",
                variant: "destructive",
            })
            return
        }

        setUsers(users.map(user =>
            user.id === currentUser.id ? currentUser : user
        ))
        setCurrentUser(null)
        setIsEditUserOpen(false)

        toast({
            title: "User Updated",
            description: `${currentUser.name}'s information has been updated.`,
        })
    }

    const handleDeleteUser = (userId: string) => {
        setUsers(users.filter(user => user.id !== userId))

        toast({
            title: "User Removed",
            description: "The user has been removed from the system.",
        })
    }

    const openEditDialog = (user: User) => {
        setCurrentUser(user)
        setIsEditUserOpen(true)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>User Management</CardTitle>
                        </div>
                        <Button
                            onClick={() => setIsAddUserOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-md"
                        />

                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                                                No users found matching your search criteria.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map(user => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            user.role === "Health Visitor"
                                                                ? "bg-purple-100 text-purple-800"
                                                                : user.role === "Assistant Health Visitor"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : user.role === "Manager"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditDialog(user)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add User Dialog */}
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                placeholder="Full name"
                                value={newUser.name}
                                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                placeholder="Email address"
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Role</label>
                            <Select
                                value={newUser.role}
                                onValueChange={(value) => setNewUser({...newUser, role: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Health Visitor">Health Visitor</SelectItem>
                                    <SelectItem value="Assistant Health Visitor">Assistant Health Visitor</SelectItem>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
                            Add User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    {currentUser && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    value={currentUser.name}
                                    onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    value={currentUser.email}
                                    onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Role</label>
                                <Select
                                    value={currentUser.role}
                                    onValueChange={(value) => setCurrentUser({...currentUser, role: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Health Visitor">Health Visitor</SelectItem>
                                        <SelectItem value="Assistant Health Visitor">Assistant Health Visitor</SelectItem>
                                        <SelectItem value="Manager">Manager</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditUser} className="bg-blue-600 hover:bg-blue-700">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}