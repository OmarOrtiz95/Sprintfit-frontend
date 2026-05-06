export function getImageUrl(path: string | undefined): string {
    if (!path) return '';
    
    // If it's already a full URL, return it (for backward compatibility or external links)
    if (path.startsWith('http')) {
        return path;
    }
    
    // Construct base URL from VITE_API_URL
    // Example: http://localhost:3000/api/v1 -> http://localhost:3000
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const baseUrl = apiUrl.split('/api/')[0];
    
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${baseUrl}${normalizedPath}`;
}
