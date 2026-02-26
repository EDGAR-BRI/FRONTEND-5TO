import React, { forwardRef } from 'react';
import { Spinner } from "@/components/react/primary/Spinner";

export type variant = 'primary' | 'secondary' | 'ghost' | 'danger-ghost';

export const ButtonTheme = {
    PRIMARY: "primary" as variant,
    SECONDARY: "secondary" as variant,
    GHOST: "ghost" as variant,        
    DANGER_GHOST: "danger-ghost" as variant, 
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    variant?: variant;
    loading?: boolean;
    adaptive?: boolean;
}

// 1. Envolvemos el componente con forwardRef<HTMLButtonElement, ButtonProps>
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    label,
    variant = ButtonTheme.PRIMARY,
    loading,
    adaptive = false,
    className = "",
    disabled,
    ...props
}, ref) => { // 2. Recibimos 'ref' como segundo argumento

    const isDisabled = disabled || loading;

    // --- LÓGICA PARA BOTONES TIPO TEXTO (GHOST / DANGER) ---
    if (variant === ButtonTheme.GHOST || variant === ButtonTheme.DANGER_GHOST) {

        const colorClasses = variant === ButtonTheme.GHOST
            ? "text-cool-gray-50 hover:text-primary-60 text-x" 
            : "text-rose-500 hover:text-rose-700 text-x font-medium"; 

        return (
            <button
                ref={ref} // 3. Conectamos la ref aquí
                disabled={isDisabled}
                {...props}
                className={`
                    transition-colors duration-200 font-medium text-x
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${colorClasses} 
                    ${className}
                `}
            >
                <span className="flex items-center justify-center gap-2">
                    {loading ? <Spinner className="w-4 h-4 text-current" /> : label}
                </span>
            </button>
        );
    }

    // Lógica Primaria
    if (variant === ButtonTheme.PRIMARY) {
        return (
            <button
                ref={ref} // 3. Conectamos la ref aquí también
                disabled={isDisabled}
                {...props}
                className={`group ${adaptive ? "w-full" : "w-auto"} relative rounded-md px-6 py-3 bg-primary-60 text-white font-bold uppercase tracking-wider overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(15,98,254,0.5)] active:scale-95 active:brightness-90 active:duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:shadow-none disabled:bg-cool-gray-60 disabled:text-cool-gray-30 ${className}`}
            >
                {!isDisabled && (
                    <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                )}
                <span className="flex items-center justify-center text-sm font-medium gap-2">
                    {loading ? <Spinner /> : label}
                </span>
            </button>
        );
    }

    // Lógica Secundaria
    return (
        <button
            ref={ref} // 3. Y aquí también
            disabled={isDisabled}
            {...props}
            className={`px-6 rounded-md ${adaptive ? "w-full" : "w-auto"} text-sm py-3 border border-cool-gray-60 disabled:bg-cool-gray-60 text-cool-gray-30 hover:text-white hover:border-white uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:border-cool-gray-60 active:scale-95 active:brightness-90 active:duration-100 ${className}`}
        >
            <span className="flex items-center justify-center gap-2">
                {loading ? <Spinner /> : label}
            </span>
        </button>
    );
});

// Es útil para debugging en React DevTools
Button.displayName = "Button";