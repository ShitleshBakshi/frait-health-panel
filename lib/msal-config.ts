import { Configuration, LogLevel } from "@azure/msal-browser";

const isWindowDefined = typeof window !== "undefined";
console.log("MSAL ENV:", process.env.NEXT_PUBLIC_AZURE_CLIENT_ID, process.env.NEXT_PUBLIC_AZURE_TENANT_ID, process.env.NEXT_PUBLIC_REDIRECT_URI);
// MSAL configuration
export const msalConfig: Configuration = {
    auth: {
        clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || "",
        authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}`,
        redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || (isWindowDefined ? window.location.origin : ""),
        postLogoutRedirectUri: process.env.NEXT_PUBLIC_POST_LOGOUT_REDIRECT_URI || (isWindowDefined ? window.location.origin : ""),
        navigateToLoginRequestUrl: true,
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        break;
                    case LogLevel.Info:
                        console.info(message);
                        break;
                    case LogLevel.Verbose:
                        console.debug(message);
                        break;
                    case LogLevel.Warning:
                        console.warn(message);
                        break;
                    default:
                        console.log(message);
                }
            },
            logLevel: LogLevel.Info
        }
    }
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
    scopes: [
        "openid",
        "profile",
        "email",
        "User.Read",
        "GroupMember.Read.All"
    ],
    forceRefresh: false
};

export const tokenRequest = {
    scopes: [
        "profile",
        "User.Read",
        "GroupMember.Read.All",
        "User.ReadBasic.All"
    ],
    account: null,
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
    graphGroupsEndpoint: "https://graph.microsoft.com/v1.0/me/memberOf"
};