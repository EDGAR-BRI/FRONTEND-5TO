import React from 'react';

interface TooltipProps {
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, position = 'top' }) => {
    return (
        <div className="relative group ml-1 flex items-center">
            <i className="fa-regular fa-circle-question text-cool-gray-40 hover:text-primary-60 cursor-help transition-colors text-xs"></i>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-cool-gray-90 text-white text-xs rounded shadow-lg border border-cool-gray-70 z-50 pointer-events-none text-center">
                {text}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-cool-gray-90"></div>
            </div>
        </div>
    );
};
