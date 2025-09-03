import { fetchGraphQL } from "@/lib/api";

// Check if authentication is enabled
const isAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTHENTICATION === 'true';

// Check if system is initialized
export async function checkSystemStatus() {
    // If authentication is disabled, return mock system status
    if (!isAuthEnabled) {
        return Promise.resolve({
            initialized: true,
            message: "System is initialized (development mode)"
        });
    }

    // Original implementation for when authentication is enabled
    const response = await fetch('/api/auth/admin/system-status');
    if (!response.ok) throw new Error('Failed to check system status');
    return response.json();
}

// Initialize system with first admin user
export async function initializeSystem(adminUsername: string) {
    // If authentication is disabled, return mock initialization response
    if (!isAuthEnabled) {
        return Promise.resolve({
            success: true,
            message: "System initialized successfully (development mode)",
            admin_username: adminUsername
        });
    }

    // Original implementation for when authentication is enabled
    const response = await fetch('/api/auth/admin/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_username: adminUsername })
    });
    if (!response.ok) throw new Error('Failed to initialize system');
    return response.json();
}

// Search for users in Active Directory
export async function searchADUsers(filter?: string, limit: number = 20) {
    // If authentication is disabled, return mock AD users
    if (!isAuthEnabled) {
        const mockUsers = [
            { username: 'dev.admin', name: 'Development Admin', email: 'dev.admin@example.com' },
            { username: 'dev.manager', name: 'Development Manager', email: 'dev.manager@example.com' },
            { username: 'dev.healthvisitor', name: 'Development Health Visitor', email: 'dev.hv@example.com' },
            { username: 'dev.assistant', name: 'Development Assistant', email: 'dev.assistant@example.com' }
        ];

        // Apply filter if provided
        let filteredUsers = mockUsers;
        if (filter) {
            filteredUsers = mockUsers.filter(user => 
                user.name.toLowerCase().includes(filter.toLowerCase()) ||
                user.username.toLowerCase().includes(filter.toLowerCase()) ||
                user.email.toLowerCase().includes(filter.toLowerCase())
            );
        }

        // Apply limit
        filteredUsers = filteredUsers.slice(0, limit);

        return Promise.resolve({
            users: filteredUsers,
            total: filteredUsers.length
        });
    }

    // Original implementation for when authentication is enabled
    const params = new URLSearchParams();
    if (filter) params.append('filter', filter);
    params.append('limit', limit.toString());

    const response = await fetch(`/api/auth/admin/search-ad-users?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to search AD users');
    return response.json();
}

// Sync user from AD to system
export async function syncUserFromAD(username: string, role: string) {
    // If authentication is disabled, return mock sync response
    if (!isAuthEnabled) {
        return Promise.resolve({
            success: true,
            message: `User ${username} synced successfully with role ${role} (development mode)`,
            user: {
                username,
                role,
                synced_at: new Date().toISOString()
            }
        });
    }

    // Original implementation for when authentication is enabled
    const response = await fetch('/api/auth/admin/sync-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ username, role })
    });
    if (!response.ok) throw new Error('Failed to sync user');
    return response.json();
}

// Get users from system
export async function getSystemUsers() {
    // If authentication is disabled, return mock system users
    if (!isAuthEnabled) {
        return Promise.resolve({
            users: [
                {
                    id: '1',
                    name: 'Development User',
                    email: 'dev-user@example.com',
                    role: 'Admin'
                },
                {
                    id: '2',
                    name: 'Test Manager',
                    email: 'test.manager@example.com',
                    role: 'Manager'
                },
                {
                    id: '3',
                    name: 'Test Health Visitor',
                    email: 'test.hv@example.com',
                    role: 'Health Visitor'
                }
            ]
        });
    }

    // Original implementation for when authentication is enabled
    // This endpoint doesn't appear to exist yet but would be needed
    // You'll need to create a backend endpoint to list all users
    const query = `
    query GetUsers {
      users {
        id
        name
        email
        role
      }
    }
  `;
    return fetchGraphQL(query);
}