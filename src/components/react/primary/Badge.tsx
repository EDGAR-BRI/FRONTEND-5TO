import React from "react";

export type BadgeStyles = {
	bg?: string;
	text?: string;
	border?: string;
	borderWidth?: string;
	textSize?: string;
	font?: string;
	padding?: string;
	rounded?: string;
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	children: React.ReactNode;
	styles?: BadgeStyles;
}

const cx = (...classes: Array<string | undefined | false | null>) =>
	classes.filter(Boolean).join(" ");

export function Badge({ children, styles, className, ...props }: BadgeProps) {
	return (
		<span
			{...props}
			className={cx(
				"inline-flex items-center whitespace-nowrap border-solid",
				styles?.padding ?? "px-3 py-1",
				styles?.rounded ?? "rounded-xl",
				styles?.textSize ?? "text-[11px]",
				styles?.font,
				styles?.borderWidth ?? "border",
				styles?.bg ?? "bg-primary-100",
				styles?.text ?? "text-cool-gray-30",
				styles?.border ?? "border-cool-gray-70",
				className
			)}
		>
			{children}
		</span>
	);
}
