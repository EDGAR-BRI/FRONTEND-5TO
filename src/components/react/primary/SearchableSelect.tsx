
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Tooltip } from './Tooltip';
import { FaChevronDown } from 'react-icons/fa6';

export interface SearchableSelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

// ... imports

interface SearchableSelectProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    options: SearchableSelectOption[];
    placeholder?: string;
    variant?: "primary" | "secondary";
    onChange?: (value: string | number) => void;
    value?: string | number;
    searchPlaceholder?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    label?: string;
    tooltip?: string;
}

export const SearchableSelect = React.forwardRef<HTMLDivElement, SearchableSelectProps>(({
    options,
    placeholder = "Seleccionar opción",
    className = "",
    variant = "primary",
    name,
    onChange,
    defaultValue,
    value,
    required,
    searchPlaceholder = "Buscar...",
    onKeyDown,
    label,
    tooltip,
    ...props
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string | number>((value !== undefined ? value : defaultValue) as string | number || "");
    const [coords, setCoords] = useState<{ top?: number; left: number; width: number; bottom?: number }>({ left: 0, width: 0 });
    const [searchTerm, setSearchTerm] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null); // Used for click-outside check, can reuse internalRef if we merge logic
    const searchInputRef = useRef<HTMLInputElement>(null);
    const optionsListRef = useRef<HTMLUListElement>(null);

    // Combine refs
    const setRef = (element: HTMLDivElement | null) => {
        internalRef.current = element;
        if (typeof ref === 'function') {
            ref(element);
        } else if (ref) {
            ref.current = element;
        }
    };

    // Filter options
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sync state with controlled value
    useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value]);

    // Reset highlight when search or options change
    useEffect(() => {
        setHighlightedIndex(0);
    }, [searchTerm, isOpen]);

    // Scroll highlighted into view
    useEffect(() => {
        if (isOpen && optionsListRef.current) {
            const list = optionsListRef.current;
            const highlightedElement = list.children[highlightedIndex] as HTMLElement;
            if (highlightedElement) {
                const listRect = list.getBoundingClientRect();
                const itemRect = highlightedElement.getBoundingClientRect();

                if (itemRect.bottom > listRect.bottom) {
                    list.scrollTop += (itemRect.bottom - listRect.bottom);
                } else if (itemRect.top < listRect.top) {
                    list.scrollTop -= (listRect.top - itemRect.top);
                }
            }
        }
    }, [highlightedIndex, isOpen]);

    const selectedOption = options.find(opt => opt.value === selectedValue);

    const toggle = () => {
        if (!isOpen && internalRef.current) {
            const rect = internalRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const DROPDOWN_MAX_HEIGHT = 300; // Increased for search input

            const newCoords: { top?: number; left: number; width: number; bottom?: number } = {
                left: rect.left,
                width: rect.width
            };

            // Determine placement
            if (spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow) {
                // Render Upwards
                newCoords.bottom = window.innerHeight - rect.top + 4;
            } else {
                // Render Downwards
                newCoords.top = rect.bottom + 4;
            }

            setCoords(newCoords);
            setIsOpen(true);
            setSearchTerm(""); // Reset search on open

            // Focus search input after a tick
            setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 50);

        } else {
            setIsOpen(false);
            // Return focus to trigger when closing manually
            if (internalRef.current) internalRef.current.focus();
        }
    };

    const handleSelect = (newValue: string | number) => {
        if (value === undefined) {
            setSelectedValue(newValue);
        }
        setIsOpen(false);
        setSearchTerm("");
        if (onChange) onChange(newValue);
        // Return focus to trigger
        if (internalRef.current) {
            internalRef.current.focus();
        }
    };

    const findNextEnabled = (from: number, direction: 1 | -1): number => {
        let i = from;
        for (let c = 0; c < filteredOptions.length; c++) {
            i = (i + direction + filteredOptions.length) % filteredOptions.length;
            if (!filteredOptions[i]?.disabled) return i;
        }
        return from;
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => findNextEnabled(prev, 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => findNextEnabled(prev, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const opt = filteredOptions[highlightedIndex];
            if (opt && !opt.disabled) {
                handleSelect(opt.value);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            toggle(); // Close
        }
    };

    // Close on resize
    useEffect(() => {
        const handleResize = () => {
            if (isOpen) setIsOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen]);

    const bgClass = variant === "secondary" ? "bg-primary-100" : "bg-primary-100";

    return (
        <div className="flex flex-col gap-2 w-full">
            {(label || tooltip) && (
                <div className="flex items-center">
                    {label && (
                        <label className="font-medium text-sm text-cool-gray-40 w-fit px-1">
                            {label}
                        </label>
                    )}
                    {tooltip && <Tooltip text={tooltip} />}
                </div>
            )}
            <div className={`relative ${className}`} ref={containerRef}>
                {/* Hidden input for form submission */}
                <input
                    type="hidden"
                    name={name}
                    value={selectedValue}
                    required={required}
                    {...props}
                />

                {/* Trigger */}
                <div
                    ref={setRef}
                    tabIndex={0}
                    className={`w-full h-10 rounded-md px-4 py-2 text-body-s text-primary-800 flex items-center justify-between cursor-pointer transition-all border border-primary-300  outline-none relative select-none ${bgClass} ${isOpen ? 'border-primary-60 ring-2 ring-primary-60/50' : 'border-primary-300 hover:border-primary-60'} focus:border-primary-60 focus:ring-1 focus:ring-primary-60`}
                    onClick={toggle}
                    onKeyDown={(e) => {
                        if (onKeyDown) onKeyDown(e);
                        if (e.key === 'Enter' || e.key === ' ') {
                            if (!e.defaultPrevented) {
                                e.preventDefault();
                                toggle();
                            }
                        }
                    }}
                >
                    <span className={!selectedOption ? "text-primary-300" : "truncate pr-4"}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>

                    {/* Arrow Icon */}
                    <FaChevronDown
                        className={`w-4 h-4 text-primary-300 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>

                {/* Dropdown Menu - Portal */}
                {isOpen && createPortal(
                    <>
                        {/* Transparent Backdrop */}
                        <div className="fixed inset-0 z-50" onClick={() => setIsOpen(false)}></div>

                        <div
                            className="fixed z-50 bg-primary-100 border border-primary-300 rounded-md shadow-lg overflow-hidden animate-fade-in-down animate-duration-200 flex flex-col"
                            style={{
                                top: coords.top !== undefined ? coords.top : 'auto',
                                bottom: coords.bottom !== undefined ? coords.bottom : 'auto',
                                left: coords.left,
                                width: coords.width,
                                maxHeight: '300px'
                            }}
                        >
                            {/* Search Header */}
                            <div className="p-2 border-b border-primary-300 bg-primary-100 sticky top-0 z-10">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className="w-full bg-primary-100 text-primary-800 text-sm rounded border border-primary-300 px-3 py-1.5 focus:outline-none focus:border-primary-60 placeholder:text-primary-50"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleInputKeyDown}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>

                            {/* Options List */}
                            <ul ref={optionsListRef} className="overflow-auto py-1 flex-1 custom-scrollbar scroll-smooth">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option, index) => (
                                        <li
                                            key={option.value}
                                            className={`px-4 py-2 transition-colors text-sm ${option.disabled ? 'cursor-not-allowed opacity-50 text-primary-300' : 'cursor-pointer text-primary-700 hover:bg-primary-60/20 hover:text-primary-40'} ${(!option.disabled && highlightedIndex === index) ? 'bg-primary-60/20 text-primary-40' : (selectedValue === option.value ? 'bg-primary-60/10 text-primary-40' : '')}`}
                                            onMouseEnter={() => { if (!option.disabled) setHighlightedIndex(index); }}
                                            onClick={() => { if (!option.disabled) handleSelect(option.value); }}
                                        >
                                            {option.label}
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-3 text-primary-300 text-sm text-center italic">
                                        No se encontraron resultados
                                    </li>
                                )}
                            </ul>
                        </div>
                    </>,
                    document.body
                )}
            </div>
        </div>
    );
});
