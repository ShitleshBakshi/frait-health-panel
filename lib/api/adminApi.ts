import { fetchGraphQL } from "@/lib/api";

// Check if system is initialized
export async function checkSystemStatus() {
    const response = await fetch('/api/auth/admin/system-status');
    if (!response.ok) throw new Error('Failed to check system status');
    return response.json();
}

// Initialize system with first admin user
export async function initializeSystem(adminUsername: string) {
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