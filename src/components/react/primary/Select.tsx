import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Tooltip } from './Tooltip';

export interface SelectOption {
    value: string | number;
    label: string;
}

// ... imports

interface SelectProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    options: SelectOption[];
    placeholder?: string;
    variant?: "primary" | "secondary";
    onChange?: (value: string | number) => void;
    value?: string | number;
    label?: string;
    tooltip?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(({
    options,
    placeholder = "Seleccionar opción",
    className = "",
    variant = "primary",
    name,
    onChange,
    defaultValue,
    value,
    label,
    tooltip,
    required,
    onKeyDown,
    ...props
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string | number>((value !== undefined ? value : defaultValue) as string | number || "");
    const [coords, setCoords] = useState<{ top?: number; left: number; width: number; bottom?: number }>({ left: 0, width: 0 });
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
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

    // Sync state with controlled value
    useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value]);

    // Reset highlight when opened
    useEffect(() => {
        if (isOpen) {
            const index = options.findIndex(opt => opt.value === selectedValue);
            setHighlightedIndex(index >= 0 ? index : 0);
        }
    }, [isOpen]);

    // Scroll highlighted into view
    useEffect(() => {
        if (isOpen && optionsListRef.current) {
            const list = optionsListRef.current;
            const highlightedElement = list.children[highlightedIndex + 1] as HTMLElement; // +1 because first li is placeholder
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
            const DROPDOWN_MAX_HEIGHT = 260; // Approximate max height (max-h-60 + padding)

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
        } else {
            setIsOpen(false);
            if (internalRef.current) internalRef.current.focus();
        }
    };

    const handleSelect = (newValue: string | number) => {
        if (value === undefined) {
            setSelectedValue(newValue);
        }
        setIsOpen(false);
        if (onChange) onChange(newValue);
        if (internalRef.current) internalRef.current.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (onKeyDown) onKeyDown(e);

        if (e.defaultPrevented) return;

        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                toggle();
            }
        } else {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIndex(prev => (prev + 1) % options.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (options[highlightedIndex]) {
                    handleSelect(options[highlightedIndex].value);
                }
            } else if (e.key === 'Escape' || e.key === 'Tab') {
                if (e.key === 'Escape') e.preventDefault();
                setIsOpen(false);
                if (internalRef.current) internalRef.current.focus();
            }
        }
    };

    // Close on click outside & Update position on scroll/resize
    useEffect(() => {
        const handleResize = () => {
            if (isOpen) setIsOpen(false);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen]);

    const bgClass = variant === "secondary" ? "bg-primary-50" : "bg-primary-100";

    return (
        <div className="flex flex-col gap-2 w-full">
            {(label || tooltip) && (
                <div className="flex items-center">
                    {label && (
                        <label className="font-medium text-sm text-primary-700 w-fit px-1">
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
                    className={`w-full h-10 rounded-md px-4 py-2 text-body-s text-primary-700 flex items-center justify-between cursor-pointer transition-all border border-primary-300  outline-none relative select-none ${bgClass} ${isOpen ? 'border-primary-60 ring-2 ring-primary-60/50' : 'border-primary-300 hover:border-primary-60'} focus:border-primary-60 focus:ring-1 focus:ring-primary-60`}
                    onClick={toggle}
                    onKeyDown={handleKeyDown}
                >
                    <span className={!selectedOption ? "text-primary-400" : ""}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>

                    {/* Arrow Icon */}
                    <svg
                        className={`w-4 h-4 text-primary-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Dropdown Menu - Portal */}
                {isOpen && createPortal(
                    <>
                        {/* Transparent Backdrop to handle "click outside" easily */}
                        <div className="fixed inset-0 z-50" onClick={() => setIsOpen(false)}></div>

                        <div
                            className="fixed z-50 bg-primary-100 border border-primary-300 rounded-md shadow-lg overflow-hidden animate-fade-in-down animate-duration-200"
                            style={{
                                top: coords.top !== undefined ? coords.top : 'auto',
                                bottom: coords.bottom !== undefined ? coords.bottom : 'auto',
                                left: coords.left,
                                width: coords.width
                            }}
                        >
                            <ul ref={optionsListRef} className="max-h-60 overflow-auto py-1 scroll-smooth custom-scrollbar">
                                <li
                                    className="px-4 py-2 text-primary-300 cursor-default text-sm border-b border-primary-300"
                                >
                                    {placeholder}
                                </li>
                                {options.map((option, index) => (
                                    <li
                                        key={option.value}
                                        className={`px-4 py-2 cursor-pointer transition-colors text-primary-700 hover:bg-primary-60/20 hover:text-primary-40 ${highlightedIndex === index ? 'bg-primary-60/20 text-primary-40' : (selectedValue === option.value ? 'bg-primary-60/10 text-primary-40' : '')}`}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                        onClick={() => handleSelect(option.value)}
                                    >
                                        {option.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>,
                    document.body
                )}
            </div>
        </div>
    );
});
