'use client';

import React, { useState, InputHTMLAttributes } from 'react';

interface FloatingLabelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({ 
  id, 
  label, 
  value, 
  onFocus, 
  onBlur, 
  className, // for other className proprieties fusion
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  
  const isLabelActive = isFocused || (value && value.toString().length > 0);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  // Class fusion
  const baseClasses = "peer block w-full px-3 pb-2 pt-3 border border-gray-300 dark:border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0088aa] hover:border-[#0088aa] focus:border-[#0088aa] dark:focus:ring-[#ff952aff] dark:hover:border-[#ff952aff] dark:focus:border-[#ff952aff] transition-all ease-in-out duration-400";
  const finalClassName = `${baseClasses} ${className || ''}`.trim();

  return (
    <div className="relative group">
      <input
        id={id}
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={finalClassName} 
        {...props}
      />
      <label
        htmlFor={id}
        className={`absolute pointer-events-none transition-all ease-in-out duration-400 px-3 ${
          isLabelActive
            ? 'top-0 -translate-y-1/2 text-sm font-medium text-gray-400 peer-focus:text-[#0088aa] group-hover:text-[#0088aa] dark:peer-focus:text-[#ff952aff] dark:group-hover:text-[#ff952aff] px-1 py-0 ml-4 bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white/45 rounded-full'
            : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
        }`}
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingLabelInput;