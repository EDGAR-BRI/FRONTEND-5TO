import React, { forwardRef } from "react";
import { Spinner } from "@/components/react/primary/Spinner";

export type variant = "primary" | "secondary" | "ghost" | "danger-ghost";
export type size = "default" | "sm" | "lg" | "icon";

export const ButtonTheme = {
    PRIMARY: "primary" as variant,
    SECONDARY: "secondary" as variant,
    GHOST: "ghost" as variant,        
    DANGER_GHOST: "danger-ghost" as variant, 
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    variant?: variant;
    size?: size;
    loading?: boolean;
    adaptive?: boolean;
}

const cx = (...classes: Array<string | undefined | false | null>) =>
    classes.filter(Boolean).join(" ");

const baseClasses =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-[3px] focus-visible:ring-primary-300 focus-visible:border-primary-300";

const variantClasses: Record<variant, string> = {
    primary: "bg-primary text-white hover:bg-primary-600",
    secondary:
        "border border-primary-600 bg-primary-100 text-primary-700 hover:bg-primary-200",
    ghost: "bg-transparent text-primary-700 hover:bg-primary-200",
    "danger-ghost": "bg-transparent text-error hover:bg-error/10",
};

const sizeClasses: Record<size, string> = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md gap-1.5 px-3",
    lg: "h-10 rounded-md px-6",
    icon: "h-9 w-9 p-0",
};

// 1. Envolvemos el componente con forwardRef<HTMLButtonElement, ButtonProps>
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    label,
    variant = ButtonTheme.PRIMARY,
    size = "default",
    loading,
    adaptive = false,
    className = "",
    disabled,
    type = "button",
    children,
    ...props
}, ref) => { // 2. Recibimos 'ref' como segundo argumento

    const isDisabled = disabled || loading;

	const content = children ?? label;

	return (
		<button
			ref={ref}
            type={type}
			disabled={isDisabled}
			{...props}
			className={cx(
				baseClasses,
				variantClasses[variant],
				sizeClasses[size],
				adaptive ? "w-full" : "w-auto",
				loading ? "cursor-wait" : undefined,
				className
			)}
		>
			{loading ? <Spinner className="w-4 h-4 text-current" /> : null}
			{content}
		</button>
	);
});

// Es útil para debugging en React DevTools
Button.displayName = "Button";