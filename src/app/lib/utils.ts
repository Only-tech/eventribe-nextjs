/**
 * Cleans and normalizes an image path to be compatible with Next.js <Image />
 * @param path from db or upload
 * @returns  "/" or URL absolute
 */
export const normalizeImagePath = (path: string | null): string => {
    if (!path) {
        return `https://placehold.co/200x150.png?text=Image`;
    }

    if (path.startsWith('http') || path.startsWith('/')) {
        return path;
    }

    return path;
};


