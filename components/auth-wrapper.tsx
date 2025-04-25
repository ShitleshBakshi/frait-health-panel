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

    // Only use MSAL authentication
    return (
      <MSALAuthProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </MSALAuthProvider>
    );
};

export default AuthWrapper;


