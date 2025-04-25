import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { UserRole } from "./auth-context"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Determines the appropriate landing page based on user role
 * @param role The user's role
 * @returns The path to redirect the user to
 */
export function getLandingPageByRole(role: UserRole | string | undefined): string {
  if (!role) return "/dashboard"
  
  switch (role) {
    case UserRole.ADMIN:
      return "/dashboard" // Admin dashboard with user management
    case UserRole.MANAGER:
      return "/dashboard" // Manager dashboard with statistics
    case UserRole.HEALTH_VISITOR:
      return "/families" // Health visitors primarily work with families
    case UserRole.ASSISTANT_HEALTH_VISITOR:
      return "/families" // Assistant health visitors work with assigned families
    default:
      return "/dashboard" // Default fallback
  }
}


