'use client';

import React, { useState, InputHTMLAttributes } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

interface FloatingLabelInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({ 
    id, 
    label,
    type,
    value, 
    onFocus, 
    onBlur, 
    className, // for other className proprieties fusion
    ...props 
}) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    
    const [showPassword, setShowPassword] = useState<boolean>(false);
    
    const isActive = isFocused || (value && value.toString().length > 0);

    // Check if input is a password enter
    const isPasswordInput = type === 'password';
    
    // Check the type to display text or password
    const inputType = isPasswordInput ? (showPassword ? 'text' : 'password') : type;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    // Padding-right if password to avoid the text under icon
    const baseClasses = `peer w-full py-3 px-5 ${isPasswordInput ? 'pr-12' : ''}  border resize-none border-gray-300 dark:border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0088aa] hover:border-[#0088aa] focus:border-[#0088aa] dark:focus:ring-[#ff952aff] dark:hover:border-[#ff952aff] dark:focus:border-[#ff952aff] transition-all ease-in-out duration-400`;
    const finalClassName = `${baseClasses} ${className || ''}`.trim();

    return (
        <div className={`relative group w-full transition-all duration-500 ease-out ${isActive ? "translate-y-0" : "translate-y-1"}`}>
            <input
                id={id}
                type={inputType}
                value={value}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={finalClassName} 
                {...props}
            />
            <label
                htmlFor={id}
                className={`absolute pointer-events-none transition-all duration-300 ease-out px-3 ${
                isActive
                    ? "top-0 left-6 -translate-y-1/2 text-sm rounded-full font-medium text-gray-500 peer-focus:text-[#0088aa] group-hover:text-[#0088aa] dark:peer-focus:text-[#ff952aff] dark:group-hover:text-[#ff952aff] px-1 py-0 ml-4 bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white/45" 
                    : "top-1/2 left-3 -translate-y-1/2 text-base text-gray-500 dark:text-white/40"
                }`}
            >
                {label}
            </label>

            {/* Display the button if it is a password */}
            {isPasswordInput && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 dark:text-white/30 dark:hover:text-white/60 cursor-pointer z-10"
                    aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                    title={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                    tabIndex={-1} // To avoid tabulation on password show or hide icon
                >
                    {showPassword ? ( <EyeSlashIcon className="size-5" /> ) : ( <EyeIcon className="size-5" />)}
                </button>
            )}
        </div>
    );
};

export default FloatingLabelInput;