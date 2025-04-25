"use client"

import { ReactNode, useEffect } from 'react';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { PublicClientApplication, EventType, EventMessage, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig } from '@/lib/msal-config';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '@/lib/slices/userSlice';
import { UserRole } from '@/lib/auth-context';


// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);



// AuthenticationWrapper component to handle auth state
const AuthenticationWrapper = ({ children }: { children: ReactNode }) => {
    const { instance } = useMsal();
    const dispatch = useDispatch();

    useEffect(() => {
        // Handle redirect after login
        msalInstance.handleRedirectPromise().catch(error => {
            console.error(error);
        });

        // Event callback for successful login
        const callbackId = instance.addEventCallback((event: EventMessage) => {
            if (event.eventType === EventType.LOGIN_SUCCESS) {
                const result = event.payload as AuthenticationResult;
                const account = result.account;

                // Map claims to user object
                if (account) {
                    // Note: You'll need to map the roles from Azure AD claims to your application roles
                    const userRole = account.idTokenClaims?.roles?.[0] || UserRole.HEALTH_VISITOR;

                    dispatch(setUser({
                        id: account.localAccountId,
                        username: account.name || '',
                        // email: account.username,
                        role: userRole as UserRole,
                        healthBoard: "Powys Health Board" // This should come from claims or be configured
                    }));
                }
            }

            if (event.eventType === EventType.LOGOUT_SUCCESS) {
                dispatch(clearUser());
            }
        });

        return () => {
            if (callbackId) {
                instance.removeEventCallback(callbackId);
            }
        };
    }, [instance, dispatch]);

    return <>{children}</>;
};

// Main MSAL Provider component
export const MSALAuthProvider = ({ children }: { children: ReactNode }) => {
    return (
        <MsalProvider instance={msalInstance}>
            <AuthenticationWrapper>
                {children}
            </AuthenticationWrapper>
        </MsalProvider>
    );
};



export default MSALAuthProvider;
