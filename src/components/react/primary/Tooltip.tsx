interface TooltipProps {
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip = ({ text, position: _position = 'top' }: TooltipProps) => {
    return (
        <div className="relative group ml-1 flex items-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-cool-gray-40 hover:text-primary-60 cursor-help transition-colors"
            >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-cool-gray-90 text-white text-xs rounded shadow-lg border border-cool-gray-70 z-50 pointer-events-none text-center">
                {text}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-cool-gray-90"></div>
            </div>
        </div>
    );
};
