/**
 * Application configuration settings
 */

// API configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql';

// Authentication settings
export const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true' || false;
export const AUTH_TOKEN_KEY = 'frait_auth_token';

// Feature flags
export const FEATURES = {
    EXCEL_IMPORT: true,
    ASSESSMENT_FILTERING: true,
};

// Backend paths
export const API_PATHS = {
    FAMILIES: `${API_URL}/api/families`,
    ASSESSMENTS: `${API_URL}/api/assessments`,
};

// Timeouts
export const FETCH_TIMEOUT = 30000; // 30 seconds
export const TOASTS_DURATION = 5000; // 5 seconds

// Development helpers
export const IS_DEV = process.env.NODE_ENV === 'development';
export const MOCK_DATA = IS_DEV && (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || false);