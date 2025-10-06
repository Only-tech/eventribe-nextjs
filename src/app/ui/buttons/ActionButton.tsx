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
    const baseStyles = 'inline-flex items-center justify-center py-2.5 px-5 rounded-full text-base font-medium transition-all border-[0.5px] shadow-2xl drop-shadow-[0px_5px_5px_rgba(0,0,0,_0.2)] shadow-[hsl(var(--always-black)/5.1%)] duration-500 ease-in-out group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

    const variantStyles = {
        primary: 'bg-gray-800 text-white hover:bg-amber-50 hover:text-gray-800 border-transparent hover:border-gray-800',
        secondary: 'bg-[#FCFFF7] text-gray-800 hover:bg-[#E8E5D8] border-gray-800 hover:border-transparent',
        destructive: 'bg-red-600 text-white hover:bg-red-50 hover:text-red-800 border-transparent hover:border-red-800',
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