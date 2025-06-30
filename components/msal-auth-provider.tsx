"use client"

import { ReactNode, useEffect } from 'react';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { PublicClientApplication, EventType, EventMessage, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig } from '@/lib/msal-config';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '@/lib/slices/userSlice';
import { UserRole } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Helper function to map Azure AD groups/roles to application roles
const mapAzureADToUserRole = (account: any): UserRole | null => {
    // Get roles from different possible claim locations
    const roles = account.idTokenClaims?.roles || [];
    const groups = account.idTokenClaims?.groups || [];
    
    // Log for debugging
    console.debug('Azure AD claims:', {
        roles: roles,
        groups: groups,
        allClaims: account.idTokenClaims
    });
    
    // Check roles first
    if (roles.includes('POW_EFRAIT_Admins')) {
        return UserRole.ADMIN;
    } else if (roles.includes('POW_EFRAIT_Managers')) {
        return UserRole.MANAGER;
    } else if (roles.includes('POW_EFRAIT_HealthVisitors')) {
        return UserRole.HEALTH_VISITOR;
    } else if (roles.includes('POW_EFRAIT_AssistantHealthVisitors')) {
        return UserRole.ASSISTANT_HEALTH_VISITOR;
    }
    
    // Check groups if roles didn't match
    if (groups.includes('POW_EFRAIT_Admins')) {
        return UserRole.ADMIN;
    } else if (groups.includes('POW_EFRAIT_Managers')) {
        return UserRole.MANAGER;
    } else if (groups.includes('POW_EFRAIT_HealthVisitors')) {
        return UserRole.HEALTH_VISITOR;
    } else if (groups.includes('POW_EFRAIT_AssistantHealthVisitors')) {
        return UserRole.ASSISTANT_HEALTH_VISITOR;
    }
    
    // No matching role found - user is unauthorised
    console.error('No matching role found for user. Roles:', roles, 'Groups:', groups);
    return null;
};

// AuthenticationWrapper component to handle auth state
const AuthenticationWrapper = ({ children }: { children: ReactNode }) => {
    const { instance } = useMsal();
    const dispatch = useDispatch();
    const router = useRouter();

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
                    // Get the mapped role
                    const userRole = mapAzureADToUserRole(account);

                    if (!userRole) {
                        // No valid role found - clear user and redirect to unauthorised
                        console.error('User authenticated but has no valid role assigned');
                        dispatch(clearUser());
                        
                        // Use setTimeout to ensure navigation happens after render
                        setTimeout(() => {
                            router.push('/unauthorised');
                        }, 0);
                        
                        return;
                    }

                    dispatch(setUser({
                        id: account.localAccountId,
                        username: account.name || '',
                        role: userRole,
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
    }, [instance, dispatch, router]);

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