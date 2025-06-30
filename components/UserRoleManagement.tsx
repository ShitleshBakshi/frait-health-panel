"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Edit, Trash, Search, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { UserRole } from "@/lib/auth-context"
import {
    checkSystemStatus,
    initializeSystem,
    searchADUsers,
    syncUserFromAD,
    getSystemUsers
} from "@/lib/api/adminApi"

// Types for users
type User = {
    id: string
    name: string
    email: string
    role: string
}

// Types for AD users
type ADUser = {
    username: string
    name: string
    email: string
    ad_role: string
    exists_in_system: boolean
}

export function UserRoleManagement() {
    // State for system status
    const [systemInitialized, setSystemInitialized] = useState<boolean | null>(null)
    const [isInitializing, setIsInitializing] = useState(false)
    const [adminUsername, setAdminUsername] = useState("")

    // State for users
    const [users, setUsers] = useState<User[]>([])
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // State for dialogs
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [isEditUserOpen, setIsEditUserOpen] = useState(false)
    const [isSearchADOpen, setIsSearchADOpen] = useState(false)

    // State for AD user search
    const [adSearchTerm, setADSearchTerm] = useState("")
    const [adUsers, setADUsers] = useState<ADUser[]>([])
    const [isSearchingAD, setIsSearchingAD] = useState(false)

    // State for edit user
    const [currentUser, setCurrentUser] = useState<User | null>(null)

    const { toast } = useToast()

    // Fetch system status and users on component mount
    useEffect(() => {
        const initialize = async () => {
            try {
                // Check system status
                const status = await checkSystemStatus();
                setSystemInitialized(status.initialized);

                // If system is initialized, fetch users
                if (status.initialized) {
                    await fetchUsers();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to initialize component.",
                    variant: "destructive",
                });
            }
        };

        initialize();
    }, []);

    // Fetch users from the backend
    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const response = await getSystemUsers();
            // Assuming the API returns users in the response
            setUsers(response.users || []);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch users.",
                variant: "destructive",
            });
        } finally {
            setIsLoadingUsers(false);
        }
    };

    // Initialize the system with the first admin user
    const handleInitializeSystem = async () => {
        if (!adminUsername) {
            toast({
                title: "Missing Information",
                description: "Please enter an admin username.",
                variant: "destructive",
            });
            return;
        }

        setIsInitializing(true);
        try {
            await initializeSystem(adminUsername);
            setSystemInitialized(true);
            toast({
                title: "System Initialized",
                description: `System initialized with admin user ${adminUsername}.`,
            });

            // Fetch users after initialization
            await fetchUsers();
        } catch (error) {
            toast({
                title: "Initialization Failed",
                description: error instanceof Error ? error.message : "Failed to initialize system.",
                variant: "destructive",
            });
        } finally {
            setIsInitializing(false);
        }

    };

    // Search Active Directory for users
    const handleSearchAD = async () => {
        setIsSearchingAD(true);
        try {
            const response = await searchADUsers(adSearchTerm);
            setADUsers(response.users || []);
        } catch (error) {
            toast({
                title: "Search Failed",
                description: error instanceof Error ? error.message : "Failed to search AD users.",
                variant: "destructive",
            });
        } finally {
            setIsSearchingAD(false);
        }
    };

    // Add a user from Active Directory
    const handleAddUserFromAD = async (adUser: ADUser, role: string) => {
        try {
            const result = await syncUserFromAD(adUser.username, role);

            // Update the local users list with the new user
            if (result.user) {
                setUsers([...users, result.user]);
            }

            // Update the AD user's status to prevent adding again
            setADUsers(adUsers.map(user =>
                user.username === adUser.username
                    ? { ...user, exists_in_system: true }
                    : user
            ));

            toast({
                title: "User Added",
                description: `${adUser.name} has been added as a ${role}.`,
            });
        } catch (error) {
            toast({
                title: "Failed to Add User",
                description: error instanceof Error ? error.message : "Failed to add user from AD.",
                variant: "destructive",
            });
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If system is not initialized, show initialization form
    if (systemInitialized === false) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>System Initialization</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            The system needs to be initialized with an admin user from Active Directory.
                            Please enter the username of the user who should be the system administrator.
                        </p>
                        <div className="space-y-4">
                            <Input
                                placeholder="Admin username (e.g., john.smith)"
                                value={adminUsername}
                                onChange={(e) => setAdminUsername(e.target.value)}
                            />
                            <Button
                                onClick={handleInitializeSystem}
                                disabled={isInitializing}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isInitializing ? "Initializing..." : "Initialize System"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // If still checking system status, show loading
    if (systemInitialized === null) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-center items-center h-24">
                        <p className="text-gray-500">Checking system status...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Main component content
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>User Management</CardTitle>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                onClick={fetchUsers}
                                disabled={isLoadingUsers}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingUsers ? "animate-spin" : ""}`} />
                                Refresh
                            </Button>
                            <Button
                                onClick={() => setIsSearchADOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add User from AD
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Input
                            placeholder="Search users by name, email or role..."
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
                                    {isLoadingUsers ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                                                Loading users...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredUsers.length === 0 ? (
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
                                                            user.role === "POW_EFRAIT_HealthVisitors"
                                                                ? "bg-purple-100 text-purple-800"
                                                                : user.role === "POW_EFRAIT_AssistantHealthVisitors"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : user.role === "POW_EFRAIT_Managers"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : user.role === "POW_EFRAIT_Admins"
                                                                            ? "bg-red-100 text-red-800"
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
                                                            onClick={() => {
                                                                setCurrentUser(user);
                                                                setIsEditUserOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                // Add delete functionality
                                                                toast({
                                                                    title: "Not implemented",
                                                                    description: "User deletion functionality is not implemented yet.",
                                                                    variant: "destructive",
                                                                });
                                                            }}
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

            {/* Search AD Users Dialog */}
            <Dialog open={isSearchADOpen} onOpenChange={setIsSearchADOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Add User from Active Directory</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Search AD by name or username..."
                                value={adSearchTerm}
                                onChange={(e) => setADSearchTerm(e.target.value)}
                                className="flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearchAD();
                                    }
                                }}
                            />
                            <Button
                                onClick={handleSearchAD}
                                disabled={isSearchingAD}
                            >
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                        </div>

                        {isSearchingAD ? (
                            <div className="py-8 text-center">
                                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                                Searching Active Directory...
                            </div>
                        ) : adUsers.length > 0 ? (
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>AD Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {adUsers.map((user, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.username}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.ad_role}</TableCell>
                                                <TableCell>
                                                    {user.exists_in_system ? (
                                                        <span className="text-amber-600 bg-amber-100 px-2 py-1 rounded text-xs">
                                                            Already added
                                                        </span>
                                                    ) : (
                                                        <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">
                                                            Available
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {!user.exists_in_system && (
                                                        <Select
                                                            onValueChange={(role) => handleAddUserFromAD(user, role)}
                                                        >
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue placeholder="Add as..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Admin">Admin</SelectItem>
                                                                <SelectItem value="Manager">Manager</SelectItem>
                                                                <SelectItem value="Health Visitor">Health Visitor</SelectItem>
                                                                <SelectItem value="Assistant Health Visitor">Assistant Health Visitor</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : adSearchTerm ? (
                            <div className="py-8 text-center text-gray-500">
                                No users found matching "{adSearchTerm}". Try a different search term.
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500">
                                Enter a search term to find users in Active Directory.
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSearchADOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog (placeholder for future implementation) */}
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
                                    disabled
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    value={currentUser.email}
                                    onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                                    disabled
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
                            <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                                Note: User details come from Active Directory and can only be modified there.
                                Only the role can be changed in this system.
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                // Add role update logic here
                                toast({
                                    title: "Not implemented",
                                    description: "Role update functionality is not implemented yet.",
                                });
                                setIsEditUserOpen(false);
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Update Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}