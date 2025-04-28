# FRAIT Health Visitor Control Panel

This application supports both Microsoft Authentication Library (MSAL) and OpenID Connect (OIDC) authentication methods.

## Authentication Configuration

The application can be configured to use either MSAL or OIDC authentication by setting the appropriate environment variables.

### Setting Up Authentication

1. Copy the `.env.local.example` file to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit the `.env.local` file to configure your authentication settings:

   ```
   # Authentication Type: 'msal' 
   NEXT_PUBLIC_AUTH_TYPE=msal 
   
   # Microsoft Authentication (MSAL) Settings
   NEXT_PUBLIC_AZURE_CLIENT_ID=your-azure-client-id
   NEXT_PUBLIC_AZURE_TENANT_ID=your-azure-tenant-id
   NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
   NEXT_PUBLIC_POST_LOGOUT_REDIRECT_URI=http://localhost:3000
   
   
   ```

### Microsoft Authentication (MSAL)

To use Microsoft Authentication:

1. Set `NEXT_PUBLIC_AUTH_TYPE=msal` in your `.env.local` file
2. Configure your Azure AD application in the Azure portal
3. Update the MSAL settings in `.env.local` with your Azure AD application details



## Running the Application

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication Flow

The application uses a unified authentication approach that supports both MSAL and OIDC:

1. The `AuthWrapper` component in `components/auth-wrapper.tsx` determines which authentication provider to use based on the `NEXT_PUBLIC_AUTH_TYPE` environment variable.
2. Authentication state is managed in the Redux store through the user slice.
3. Protected routes use the `withAuth` HOC or the `useRoleAuth`/`useMultiRoleAuth` hooks to enforce authentication and authorization.

## User Roles

The application supports the following user roles:

- Admin
- Manager
- Health Visitor
- Assistant Health Visitor

Access to different parts of the application is controlled based on these roles.
