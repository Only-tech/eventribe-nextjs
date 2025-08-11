/**
 * Cleans and normalizes an image path to be compatible with Next.js <Image />
 * @param path from db or upload
 * @returns  "/" or URL absolute
 */
export const normalizeImagePath = (path: string | null): string => {
    if (!path || path.trim() === '') {
        return 'https://placehold.co/600x400/E0E0E0/333333?text=Image+non+disponible';
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    if (path.startsWith('../public/')) {
        return '/' + path.replace('../public/', '');
    }

    if (path.startsWith('public/')) {
        return '/' + path.replace('public/', '');
    }

    if (path.startsWith('/')) {
        return path;
    }

    return '/' + path;
};



