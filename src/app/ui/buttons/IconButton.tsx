import React from 'react';
import Spinner from '@/app/ui/animation/Spinner';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

const IconButton: React.FC<IconButtonProps> = ({
  isLoading = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'p-2 rounded-full relative cursor-pointer bg-gray-100 hover:bg-gray-200 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const withIndicator = "group overflow-hidden place-content-center before:content-[''] before:absolute before:w-1.5 before:h-1.5 before:rounded-full before:bg-[currentColor] before:left-[calc(50%-3px)] before:-bottom-4 before:transition-all before:duration-300 before:ease-in-out hover:before:bottom-2 [&>svg]:transition-transform [&>svg]:duration-300 [&>svg]:ease-in-out hover:[&>svg]:-translate-y-1.5";

  return (
    <button
      className={`${baseStyles} ${withIndicator} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Spinner className="w-6 h-6" /> : children}
    </button>
  );
};

export default IconButton;