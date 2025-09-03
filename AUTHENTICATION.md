# Authentication Configuration

This document explains how to enable or disable authentication in the FRAIT application.

## Current Status

Authentication is currently **DISABLED** for development purposes.

## How to Toggle Authentication

### Disable Authentication (Development Mode)

1. Set the environment variable in `.env.local`:
   ```
   NEXT_PUBLIC_ENABLE_AUTHENTICATION=false
   ```

2. Restart the development server:
   ```bash
   npm run dev
   ```

**What happens when authentication is disabled:**
- Mock user is created automatically with Admin role
- All protected routes become accessible
- No MSAL authentication required
- API calls don't include authorization headers
- Login/logout buttons still work but redirect to mock states

### Enable Authentication (Production Mode)

1. Set the environment variable in `.env.local`:
   ```
   NEXT_PUBLIC_ENABLE_AUTHENTICATION=true
   ```

2. Restart the development server:
   ```bash
   npm run dev
   ```

**What happens when authentication is enabled:**
- Full Microsoft Azure Active Directory (MSAL) authentication
- Role-based access control enforced
- Protected routes require authentication
- API calls include JWT tokens
- Users must sign in with Microsoft accounts

## Development User

When authentication is disabled, a mock user is created with the following properties:

```typescript
{
  id: "dev-user-1",
  username: "Development User", 
  role: UserRole.HEALTH_VISITOR, // Health Visitor role for testing core functionality
  healthBoard: "Development Health Board"
}
```

**Health Visitor Role Access:**
- Landing page: `/families` (not dashboard)
- Navigation: Dashboard, Families, FRAIT Training
- Can view and manage all families
- Can create new assessments
- Can assign families to Assistant Health Visitors

## Files Modified for Authentication Toggle

The following files have been modified to support authentication toggling:

- `.env.local` - Environment configuration
- `lib/auth-context.tsx` - Authentication context with bypass logic
- `lib/api.ts` - API calls with conditional authorization headers
- `components/auth-wrapper.tsx` - Authentication wrapper with conditional MSAL
- `components/with-auth.tsx` - HOC with bypass logic for protected routes

## Re-enabling Authentication

To fully re-enable authentication for production:

1. Change environment variable to `true`
2. Ensure MSAL configuration is correct in `lib/msal-config.ts`
3. Verify backend authentication endpoints are working
4. Test all protected routes and role-based access
5. Restart the application

## Important Notes

- Authentication state is controlled by environment variables
- Changes require server restart to take effect
- The authentication structure remains intact when disabled
- Easy to switch between development and production modes
- All role-based features continue to work with mock user data