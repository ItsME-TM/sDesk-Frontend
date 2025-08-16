/**
 * Shared utilities for API services
 */

// Get the API base URL from environment variables
export const getApiBaseUrl = (): string => {
    // Check for production environment first
    if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        
        // Production URL detection
        if (hostname.includes('sdesk-backend') || hostname.includes('heroku')) {
            return 'https://sdesk-backend-t2-host-4d60b916e39b.herokuapp.com';
        }
        
        // Vercel frontend connecting to production backend
        if (hostname.includes('vercel.app')) {
            return 'https://sdesk-backend-t2-host-4d60b916e39b.herokuapp.com';
        }
    }
    
    // Local development - use port 8000 for backend
    return (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";
};

/**
 * Helper function to construct proper URLs without double slashes
 * @param base - Base URL (e.g., 'https://api.example.com' or 'https://api.example.com/')
 * @param endpoint - API endpoint (e.g., '/auth/login' or 'auth/login')
 * @returns Properly formatted URL
 */
export const buildUrl = (base: string, endpoint: string): string => {
    const baseUrl = base.endsWith('/') ? base.slice(0, -1) : base;
    const endpointUrl = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${endpointUrl}`;
};

// Pre-configured API base URL
export const API_BASE = getApiBaseUrl();
