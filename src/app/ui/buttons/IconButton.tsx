import React from 'react';
import Spinner from '@/app/ui/Spinner';

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
  const baseStyles = 'p-2 rounded-full cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button
      className={`${baseStyles} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Spinner className="w-6 h-6" /> : children}
    </button>
  );
};

export default IconButton;