import { useState } from "react";
import { Button, ButtonTheme, type variant } from "@/components/react/primary/Button";
import { Alert } from "@/utils/alerts";

type AlertKind = "success" | "error" | "info" | "confirm";

type Props = {
	kind: AlertKind;
	buttonLabel: string;
	title: string;
	text?: string;
	timer?: number;
	confirmButtonText?: string;
	cancelButtonText?: string;
	variant?: variant;
	className?: string;
};

export default function AlertButtonDemo({
	kind,
	buttonLabel,
	title,
	text,
	timer,
	confirmButtonText,
	cancelButtonText,
	variant,
	className,
}: Props) {
	const [loading, setLoading] = useState(false);

	const onClick = async () => {
		if (loading) return;
		setLoading(true);

		try {
			switch (kind) {
				case "success":
					await Alert.success(title, text, timer);
					break;
				case "error":
					await Alert.error(title, text);
					break;
				case "info":
					await Alert.info(title, text);
					break;
				case "confirm":
					await Alert.confirm(
						title,
						text ?? "¿Estás seguro/a?",
						confirmButtonText,
						cancelButtonText
					);
					break;
				default:
					break;
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button
			type="button"
			label={buttonLabel}
			variant={variant ?? ButtonTheme.SECONDARY}
			size="sm"
			loading={loading}
			onClick={onClick}
			className={className}
		/>
	);
}
