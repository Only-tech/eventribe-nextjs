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
  const baseClasses = "peer block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ff952aff] hover:border-[#ff952aff] focus:border-[#ff952aff]";
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
        className={`absolute pointer-events-none transition-all duration-200 ease-in-out px-3 ${
          isLabelActive
            ? 'top-0 -translate-y-1/2 text-sm font-medium text-gray-400 peer-focus:text-[#ff952aff] group-hover:text-[#ff952aff] px-1 py-0 ml-4 bg-[rgb(248,248,236)]'
            : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
        }`}
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingLabelInput;