import React from "react";
import { Button, type variant, type size } from "@/components/react/primary/Button";

type LoginRedirectButtonProps = {
	label?: string;
	variant?: variant;
	size?: size;
	adaptive?: boolean;
	className?: string;
};

const normalizeRole = (value: string) => {
	return value
		.toString()
		.trim()
		.toLowerCase()
		.replaceAll("á", "a")
		.replaceAll("é", "e")
		.replaceAll("í", "i")
		.replaceAll("ó", "o")
		.replaceAll("ú", "u");
};

export const LoginRedirectButton: React.FC<LoginRedirectButtonProps> = ({
	label = "Login",
	variant,
	size,
	adaptive,
	className,
}) => {
	const handleClick = () => {
		const params = new URLSearchParams(window.location.search);
		const roleRaw = params.get("rol") ?? params.get("role") ?? "";
		const role = normalizeRole(roleRaw);

		const roleToPath: Record<string, string> = {
			admin: "/modules/admin/overview",
			doctor: "/modules/doctor/1/overview",
			medico: "/modules/doctor/1/overview",
			pacient: "/modules/pacient/1/overview",
			paciente: "/modules/pacient/1/overview",
			receptionist: "/modules/receptionist/1/overview",
			recepcionista: "/modules/receptionist/1/overview",
		};

		const nextPath = roleToPath[role] ?? roleToPath.admin;
		window.location.href = nextPath;
	};

	return (
		<Button
			label=""
			type="button"
			variant={variant}
			size={size}
			adaptive={adaptive}
			className={className}
			onClick={handleClick}
		>
			{label}
		</Button>
	);
};
