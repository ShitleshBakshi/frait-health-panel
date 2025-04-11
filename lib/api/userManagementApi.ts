// lib/api/userManagementApi.ts

/**
 * GraphQL queries and mutations for user management
 */

import { fetchGraphQL } from "@/lib/api";

// GraphQL query for fetching all users
export const GET_ALL_USERS_QUERY = `
  query GetAllUsers {
    users {
      id
      name
      email
      role
      createdAt
      identityProvider
    }
  }
`;

// GraphQL mutation for updating a user's role
export const UPDATE_USER_ROLE_MUTATION = `
  mutation UpdateUserRole($userId: ID!, $role: String!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      name
      role
    }
  }
`;

// GraphQL mutation for deleting a user
export const DELETE_USER_MUTATION = `
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`;

// Function to fetch all users
export async function getAllUsers() {
    try {
        const data = await fetchGraphQL(GET_ALL_USERS_QUERY);
        return data.users || [];
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
}

// Function to update a user's role
export async function updateUserRole(userId: string, role: string) {
    try {
        const data = await fetchGraphQL(UPDATE_USER_ROLE_MUTATION, {
            userId,
            role
        });
        return data.updateUserRole;
    } catch (error) {
        console.error("Error updating user role:", error);
        throw error;
    }
}

// Function to delete a user
export async function deleteUser(userId: string) {
    try {
        const data = await fetchGraphQL(DELETE_USER_MUTATION, {
            userId
        });
        return data.deleteUser;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}