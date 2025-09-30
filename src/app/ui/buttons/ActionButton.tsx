import React from 'react';
import Spinner from '@/app/ui/Spinner';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'destructive';
    children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({
    isLoading = false,
    variant = 'primary',
    children,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center py-2.5 px-5 rounded-full text-base font-medium transition-colors border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] duration-300 ease-in-out group disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-gray-800 text-white hover:bg-amber-50 hover:text-gray-800 hover:border-gray-800',
        secondary: 'bg-[#F0EEE5] text-gray-800 hover:bg-[#E8E5D8] hover:border-transparent',
        destructive: 'bg-red-600 text-white hover:bg-red-50 hover:text-red-800 hover:border-red-800',
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
        {/* {isLoading ? <Spinner /> : children} */}
            {isLoading && <Spinner className="w-5 h-5" />}
            {children}
        </button>
    );
};

export default ActionButton;