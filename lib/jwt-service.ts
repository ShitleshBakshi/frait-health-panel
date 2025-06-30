// jwt-service.ts - Updated version without default role assignment
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Azure AD specific claims interface
interface AzureADClaims {
    oid: string;        // Object ID (unique user identifier)
    sub: string;        // Subject
    tid: string;        // Tenant ID
    preferred_username?: string;
    name?: string;
    roles?: string[];   // User roles
    scp?: string;       // Scopes (space-separated string)
    groups?: string[];  // Group memberships
    exp: number;        // Expiration time
    nbf: number;        // Not valid before time
    iat: number;        // Issued at time
    iss: string;        // Issuer
    aud: string | string[]; // Audience
}

// Custom error for unauthorized users
export class UnauthorizedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

// Create a JWKS client for retrieving signing keys
const client = jwksClient({
    jwksUri: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}/discovery/v2.0/keys`,
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
});

// Function to get the signing key
const getSigningKey = (header: any): Promise<string> => {
    return new Promise((resolve, reject) => {
        client.getSigningKey(header.kid, (err, key) => {
            if (err) {
                reject(err);
            } else {
                const signingKey = key?.getPublicKey();
                resolve(signingKey as string);
            }
        });
    });
};

// Verify Azure AD token with proper validation
export const verifyAzureADToken = async (token: string): Promise<AzureADClaims> => {
    try {
        // Decode the token without verification to get the header
        const decoded: any = jwt.decode(token, { complete: true });
        if (!decoded) throw new Error('Invalid token');

        // Get the signing key
        const signingKey = await getSigningKey(decoded.header);

        // Expected values for validation
        const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID;
        const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;

        // Verify the token with the correct signing key and validation options
        const verifiedToken = jwt.verify(token, signingKey, {
            audience: clientId,
            issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
        }) as AzureADClaims;

        // Additional Azure AD specific validations
        if (!verifiedToken.oid) {
            throw new Error('Token missing required claim: oid');
        }

        if (verifiedToken.tid !== tenantId) {
            throw new Error('Token is from different tenant');
        }

        // Ensure token is not expired (additional check beyond jwt.verify)
        const currentTime = Math.floor(Date.now() / 1000);
        if (verifiedToken.exp < currentTime) {
            throw new Error('Token has expired');
        }

        return verifiedToken;
    } catch (error) {
        console.error('Azure AD token verification failed:', error);
        throw error;
    }
};

// Map Azure AD roles to application roles
export const mapAzureADRolesToAppRoles = (claims: AzureADClaims): string | null => {
    // Map Azure AD group names to application role names
    const groupToRoleMapping: Record<string, string> = {
        "POW_EFRAIT_Admins": "Admin",
        "POW_EFRAIT_Managers": "Manager",
        "POW_EFRAIT_HealthVisitors": "Health Visitor",
        "POW_EFRAIT_AssistantHealthVisitors": "Assistant Health Visitor"
    };

    // First check the 'roles' claim
    if (claims.roles && claims.roles.length > 0) {
        for (const role of claims.roles) {
            if (groupToRoleMapping[role]) {
                return groupToRoleMapping[role];
            }
        }
    }

    // Then check the 'groups' claim
    if (claims.groups && claims.groups.length > 0) {
        for (const group of claims.groups) {
            if (groupToRoleMapping[group]) {
                return groupToRoleMapping[group];
            }
        }
    }

    // No matching role found - user is unauthorized
    console.error('No matching role found in token claims');
    console.error('Available roles:', claims.roles);
    console.error('Available groups:', claims.groups);

    return null;
};

// Helper function to extract group name from group ID or reference
const extractGroupName = (groupIdentifier: string): string => {
    // Implementation depends on your Azure AD group format
    // If using group IDs, you might need to maintain a mapping
    // If using group names directly, you might just need to clean up the format
    return groupIdentifier;
};

// Extract user info from Azure AD token for application use
export const extractUserInfoFromToken = (claims: AzureADClaims): any => {
    const role = mapAzureADRolesToAppRoles(claims);

    if (!role) {
        throw new UnauthorizedError(
            `User ${claims.preferred_username || claims.sub} is not authorized. No valid role assignment found.`
        );
    }

    return {
        id: claims.oid,  // Use object ID as unique identifier
        username: claims.preferred_username || claims.name || claims.sub,
        email: claims.preferred_username,
        role: role,
        externalId: claims.oid,
        identityProvider: 'azure_ad',
        // Additional metadata if needed
        ssoMetadata: {
            tenantId: claims.tid,
            roles: claims.roles || [],
            groups: claims.groups || []
        }
    };
};

// Extract token payload without verification (for display purposes)
export const extractTokenPayload = (token: string): any => {
    if (!token) return null;
    try {
        return jwt.decode(token);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};