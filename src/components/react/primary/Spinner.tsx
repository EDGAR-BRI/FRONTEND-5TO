import React from 'react';
import { FaSpinner } from 'react-icons/fa6';

interface SpinnerProps {
  className?: string; // El signo ? lo hace opcional
}

export const Spinner: React.FC<SpinnerProps> = ({ className = "" }) => {
    return (
        <div className="flex items-center justify-center">
            <FaSpinner className={`animate-spin h-5 w-5 ${className}`} />
        </div>
    );
};
