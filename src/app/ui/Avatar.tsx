import React from 'react';
import Image from 'next/image';
import { UserIcon } from '@heroicons/react/24/solid';

interface AvatarProps {
    src?: string | null;
    alt: string;
    className?: string;
}

// Get initials frpm the name
const getInitials = (name?: string): string => {
    if (!name) return "";
    
    // Cleans space and splits
    const parts = name.trim().split(" ");
    
    // If firstName
    if (parts.length === 1) {
        return parts[0][0].toUpperCase();
    }
    
    // If firstname + lastName, takes each first letter
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    
    return "";
};


export const Avatar: React.FC<AvatarProps> = ({ src, alt, className = 'size-8' }) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-full bg-blue-500 text-white shrink-0 select-none';

    if (src) {
        // Display image if available
        return (
            <div className={`${baseClasses} ${className} relative overflow-hidden`}>
                <Image
                    className="object-cover"
                    src={src}
                    alt={alt}
                    fill
                    unoptimized={true}
                    // sizes={className.includes('size-20 md:size-28') ? '130px, (min-width: 768px) 180px' : '55px'}
                />
            </div>
        );
    }

    // Display avatar with initials (Fallback) if no image
    // ALT used as name/firstName.
    const initials = getInitials(alt);

    if (initials) {
        return (
            <div className={`${baseClasses} ${className} font-medium`}>
                {initials}
            </div>
        );
    }
    
    // Generic avatar if empties image and name
    return (
        <div className={`${baseClasses} ${className} bg-gray-400`}>
            <UserIcon className="size-3/5 text-gray-100" />
        </div>
    );
};