export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Base URL is the API_URL without the /api/v1 part
// Useful for serving static files like images
export const BASE_URL = API_URL.split('/api/')[0];
