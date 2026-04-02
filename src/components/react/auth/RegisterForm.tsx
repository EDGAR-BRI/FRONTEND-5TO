import { useMemo, useState, type SyntheticEvent } from "react";
import { Button } from "@/components/react/primary/Button";
import { Field } from "@/components/react/primary/Field";
import { Badge } from "@/components/react/primary/Badge";
import { registerUser } from "@/lib/services/auth/auth.service";

type Props = {
	className?: string;
};

export default function RegisterForm({ className }: Props) {
	const [ci, setCi] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const passwordMismatch = useMemo(() => {
		if (!password || !confirmPassword) return false;
		return password !== confirmPassword;
	}, [password, confirmPassword]);

	const disabled = useMemo(() => {
		return loading || !ci.trim() || !name.trim() || !password || !confirmPassword;
	}, [loading, ci, name, password, confirmPassword]);

	const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);

		if (password !== confirmPassword) {
			setError("Las contraseñas no coinciden");
			return;
		}

		setLoading(true);

		try {
			await registerUser({
				ci: ci.trim(),
				name: name.trim(),
				password,
			});

			setSuccess("Usuario creado. Ya puedes iniciar sesión.");
			setPassword("");
			setConfirmPassword("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "No se pudo crear el usuario");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form className={className} onSubmit={onSubmit}>
			<Field
				name="ci"
				label="CI"
				placeholder="Ej: 12345678"
				value={ci}
				onChange={(e) => setCi(e.target.value)}
				disabled={loading}
				required
				inputMode="numeric"
				pattern="^[0-9]{6,10}$"
				minLength={6}
				maxLength={10}
				title="La cédula debe contener solo números (entre 6 y 10 dígitos)"
				autoComplete="username"
			/>

			<Field
				name="name"
				label="Nombre"
				placeholder="Ej: Juan Pérez"
				value={name}
				onChange={(e) => setName(e.target.value)}
				disabled={loading}
				required
				minLength={2}
				maxLength={100}
				autoComplete="name"
			/>

			<Field
				name="password"
				label="Contraseña"
				type="password"
				placeholder="Mínimo 6 caracteres"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				disabled={loading}
				required
				minLength={6}
				autoComplete="new-password"
				showTogglePassword
			/>

			<Field
				name="confirmPassword"
				label="Confirmar contraseña"
				type="password"
				placeholder="Repite la contraseña"
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.target.value)}
				disabled={loading}
				required
				minLength={6}
				autoComplete="new-password"
				showTogglePassword
			/>

			{passwordMismatch ? (
				<Badge className="w-fit" styles={{ bg: "bg-error/10", text: "text-error", border: "border-error/30" }}>
					Las contraseñas no coinciden
				</Badge>
			) : null}
			{error ? (
				<Badge className="w-fit" styles={{ bg: "bg-error/10", text: "text-error", border: "border-error/30" }}>
					{error}
				</Badge>
			) : null}
			{success ? <Badge className="w-fit">{success}</Badge> : null}

			<div className="flex flex-col gap-3">
				<Button label="Crear cuenta" type="submit" adaptive loading={loading} disabled={disabled} />
			</div>
		</form>
	);
}
