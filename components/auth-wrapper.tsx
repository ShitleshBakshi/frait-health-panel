"use client"

import { ReactNode } from 'react';
import MSALAuthProvider from './msal-auth-provider';
import { AuthProvider } from '@/lib/auth-context';

interface AuthWrapperProps {
  children: ReactNode;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
    if (typeof window === 'undefined') {
        return <>{children}</>;
    }

    // Check if authentication is enabled
    const isAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTHENTICATION === 'true';

    // If authentication is disabled, only wrap with AuthProvider (no MSAL)
    if (!isAuthEnabled) {
        return (
            <AuthProvider>
                {children}
            </AuthProvider>
        );
    }

    // Use full MSAL authentication
    return (
      <MSALAuthProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </MSALAuthProvider>
    );
};

export default AuthWrapper;


