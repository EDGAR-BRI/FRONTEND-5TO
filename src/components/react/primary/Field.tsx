import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Tooltip } from './Tooltip';
import { DayPicker } from 'react-day-picker';
import { format, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type' | 'onKeyDown'> {
    label?: string;
    autoFocus?: boolean;
    name: string;
    type?: "text" | "email" | "password" | "number" | "date" | "radio";
    placeholder?: string;
    showTogglePassword?: boolean;
    pattern?: string;
    title?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    variant?: "primary" | "secondary" | "tertiary";
    disabled?: boolean;
    step?: string | number;
    allowNegative?: boolean;
    options?: { label: string; value: string | number }[]; // Para inputs tipo radio o select si se expande futuro
    tooltip?: string;
    className?: string;
    onEnter?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;

    /**
     * Para type="date": si es true (default), usa el selector nativo del navegador.
     * Si es false, usa un calendario custom (personalizable) con popover.
     */
    useNativeDatePicker?: boolean;
}

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(({
    autoFocus = false,
    label,
    name,
    type = "text",
    placeholder,
    showTogglePassword = false,
    pattern,
    title,
    value,
    onChange,
    required,
    variant = "primary",
    disabled,
    step,
    allowNegative = false,
    options,
    tooltip,
    className,
    useNativeDatePicker = true,
    onEnter,
    onKeyDown,
    ...props
}, ref) => {
    const [inputType, setInputType] = useState(type);
    const internalInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDateOpen, setIsDateOpen] = useState(false);

    // keep inputType in sync if parent changes the `type` prop
    useEffect(() => {
        setInputType(type);
    }, [type]);

    // Combine refs
    const setRef = (element: HTMLInputElement | null) => {
        internalInputRef.current = element;
        if (typeof ref === 'function') {
            ref(element);
        } else if (ref) {
            ref.current = element;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onEnter) {
            e.preventDefault();
            onEnter();
        }

        if (onKeyDown) {
            onKeyDown(e);
        }
    };


    // LÓGICA ESPECIAL PARA RADIO BUTTONS
    if (type === "radio" && options) {
        return (
            <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center">
                    <label className="font-medium text-xs text-primary-700 w-fit px-1">
                        {label}
                    </label>
                    {tooltip && <Tooltip text={tooltip} />}
                </div>
                <div
                    className="grid gap-4 p-4 bg-primary-100 rounded-lg border border-primary-300"
                    style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
                >
                    {options.map((opt) => (

                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                                ref={setRef}
                                type="radio"
                                name={name}
                                value={opt.value}
                                checked={value === opt.value}
                                onChange={onChange}
                                className="w-4 h-4 text-primary-60 accent-primary-60 cursor-pointer border-primary-300 focus:ring-primary-60"
                                disabled={disabled}
                                {...props}
                            />
                            <span className={`text-sm font-medium ${value === opt.value ? 'text-primary-700' : 'text-primary-600'}`}>{opt.label} </span>
                        </label>
                    ))}
                </div>
            </div>
        );
    }

    const togglePassword = () => {
        setInputType(prev => prev === "password" ? "text" : "password");
    };

    const bgClass = variant === "primary" ? "bg-primary-100" : variant === "secondary" ? "bg-primary-50" : "bg-primary-200/40";
    const isDate = inputType === 'date';
    const useCustomDatePicker = isDate && !useNativeDatePicker;
    // NOTE: Some browsers don't allow intermediate values like '-' in <input type="number">.
    // When allowNegative is enabled, we render a text input with numeric validation to support typing '-'.
    const effectiveInputType = type === 'number' && allowNegative ? 'text' : inputType;

    const selectedDate = useMemo(() => {
        if (!useCustomDatePicker) return undefined;
        if (typeof value !== 'string' || !value) return undefined;
        const parsed = parseISO(value);
        return isValid(parsed) ? parsed : undefined;
    }, [useCustomDatePicker, value]);

    const displayValue = useMemo(() => {
        // 1. Lógica para DatePicker Custom
        if (useCustomDatePicker) {
            if (!selectedDate) return '';
            return format(selectedDate, 'dd/MM/yyyy', { locale: es });
        }

        // 2. NUEVA LÓGICA: Si es número y es 0, devolver vacío para ver el placeholder
        if (type === 'number' && value === 0) {
            return '';
        }

        // 3. Comportamiento por defecto
        return value;
    }, [useCustomDatePicker, selectedDate, value, type]); // Agregamos 'type' a las dependencias

    const emitDateValue = (nextIsoValue: string) => {
        if (onChange) {
            onChange({
                target: { name, value: nextIsoValue }
            } as unknown as React.ChangeEvent<HTMLInputElement>);
        }
    };

    useEffect(() => {
        if (!useCustomDatePicker) return;

        const onKeyDown = (ev: KeyboardEvent) => {
            if (ev.key === 'Escape') setIsDateOpen(false);
        };

        const onMouseDown = (ev: MouseEvent) => {
            const el = containerRef.current;
            if (!el) return;
            if (ev.target instanceof Node && !el.contains(ev.target)) {
                setIsDateOpen(false);
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('mousedown', onMouseDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('mousedown', onMouseDown);
        };
    }, [useCustomDatePicker]);

    const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (type === "number") {
            const val = e.target.value;
            // Allow empty string, and constrain input to a numeric-like format (up to 2 decimals).
            // Optionally allow a leading minus sign (e.g. for inventory adjustments).
            const re = allowNegative ? /^-?\d*\.?\d{0,2}$/ : /^\d*\.?\d{0,2}$/;
            if (val !== "" && !re.test(val)) return;
        }
        if (onChange) onChange(e);
    };

    return (
        <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center">
                <label htmlFor={name} className="font-medium text-sm text-primary-700 w-fit px-1">
                    {label}
                </label>
                {tooltip && <Tooltip text={tooltip} />}
            </div>
            <div ref={containerRef} className={`relative ${className}`}>
                {useCustomDatePicker ? (
                    <>
                        {/* Input visual (solo display) */}
                        <input
                            autoFocus={autoFocus}
                            ref={setRef}
                            type="text"
                            name={name}
                            id={name}
                            placeholder={placeholder}
                            title={title}
                            value={displayValue as any}
                            readOnly
                            required={required}
                            disabled={disabled}
                            className={`w-full h-10 text-primary-900 ${bgClass} border border-primary-300 rounded-md px-4 py-2 pr-10 text-body-s placeholder-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-60/10 focus:border-primary-60/40 hover:border-primary-60/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                            onClick={() => {
                                if (!disabled) setIsDateOpen(v => !v);
                            }}
                            {...props}
                        />

                        {/* Input real (valor ISO) para no romper forms/controlado */}
                        <input type="hidden" name={name} value={(typeof value === 'string' ? value : '')} />

                        {/* Icono */}
                        {!showTogglePassword && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!disabled) setIsDateOpen(v => !v);
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-700 cursor-pointer"
                                aria-label="Abrir calendario"
                                tabIndex={-1}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </button>
                        )}

                        {isDateOpen && !disabled && (
                            <div className="absolute z-50 mt-2 w-fit min-w-72 rounded-lg border border-primary-300 bg-primary-100 p-3 shadow-xl">
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(d) => {
                                        if (!d) return;
                                        emitDateValue(format(d, 'yyyy-MM-dd'));
                                        setIsDateOpen(false);
                                    }}
                                    weekStartsOn={1}
                                    locale={es}
                                    captionLayout="dropdown"
                                    fromYear={1990}
                                    toYear={new Date().getFullYear() + 10}
                                    classNames={{
                                        months: 'flex flex-col',
                                        month: 'space-y-3',
                                        caption: 'flex justify-between items-center gap-2 text-primary-900',
                                        caption_label: 'text-sm font-semibold',
                                        nav: 'flex items-center gap-2',
                                        nav_button: 'h-8 w-8 inline-flex items-center justify-center rounded-md border border-primary-300 text-primary-900 hover:bg-primary-200/50',
                                        table: 'w-full border-collapse space-y-1',
                                        head_row: 'flex',
                                        head_cell: 'w-9 text-center text-[11px] font-semibold text-primary-700',
                                        row: 'flex w-full mt-1',
                                        cell: 'w-9 h-9 text-center text-sm',
                                        day: 'w-9 h-9 rounded-md hover:bg-primary-200/60 text-primary-900',
                                        day_selected: 'bg-primary-600 text-white hover:bg-primary-600',
                                        day_today: 'border border-primary-300',
                                        day_outside: 'text-primary-400 opacity-60',
                                    }}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <input
                        autoFocus={autoFocus ? true : undefined}
                        ref={setRef}
                        type={effectiveInputType}
                        name={name}
                        id={name}
                        placeholder={placeholder}
                        pattern={pattern}
                        title={title}
                        value={displayValue as string | number | readonly string[] | undefined}
                        onChange={handleInternalChange}
                        required={required}
                        disabled={disabled}
                        step={step}
                        inputMode={type === 'number' ? 'decimal' : undefined}
                        onKeyDown={handleKeyDown}
                        className={`w-full h-10 text-primary-900 ${bgClass} border border-primary-300 rounded-md px-4 py-2 text-body-s placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-60/10 focus:border-primary-60/40 hover:border-primary-60/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isDate ? 'pr-10 gt-date-input' : ''}`}
                        {...props}
                    />
                )}

                {isDate && useNativeDatePicker && !showTogglePassword && (
                    <button
                        type="button"
                        onClick={() => {
                            internalInputRef.current?.focus();
                            // Chromium: abre el selector nativo al hacer click en el icono
                            // (no está en todos los navegadores)
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (internalInputRef.current as any)?.showPicker?.();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-700 cursor-pointer"
                        aria-label="Abrir calendario"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </button>
                )}

                {showTogglePassword && (
                    <button
                        type="button"
                        onClick={togglePassword}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-700 cursor-pointer"
                    >
                        {inputType === "password" ? (
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M22 12s-4.667-8-10-8-10 8-10 8 4.667 8 10 8 10-8 10-8Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        ) : (
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.44 0 .87-.03 1.28-.08" />
                                <line x1="2" x2="22" y1="2" y2="22" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
});
