import { BASE_URL } from '../config/api.config';

export function getImageUrl(path: string | undefined): string {
    if (!path) return '';
    
    // If it's already a full URL, return it (for backward compatibility or external links)
    if (path.startsWith('http')) {
        return path;
    }
    
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${BASE_URL}${normalizedPath}`;
}

