import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

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

// Verify token
export const verifyToken = async (token: string): Promise<any> => {
    try {
        // Decode the token without verification to get the header
        const decoded: any = jwt.decode(token, { complete: true });
        if (!decoded) throw new Error('Invalid token');

        // Get the signing key
        const signingKey = await getSigningKey(decoded.header);

        // Verify the token with the correct signing key
        const verifiedToken = jwt.verify(token, signingKey, {
            audience: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID,
            issuer: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}/v2.0`,
        });

        return verifiedToken;
    } catch (error) {
        console.error('Token verification failed:', error);
        throw error;
    }
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
