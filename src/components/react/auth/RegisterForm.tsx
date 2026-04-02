import { useState, type SyntheticEvent } from "react";
import { Button } from "@/components/react/primary/Button";
import { Field } from "@/components/react/primary/Field";
import { registerUser } from "@/lib/services/auth/auth.service";
import { Alert } from "@/utils/alerts";

type Props = {
	className?: string;
};

export default function RegisterForm({ className }: Props) {
	const [ci, setCi] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [loading, setLoading] = useState(false);

	const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			await Alert.error("Las contraseñas no coinciden", "Por favor verifica e inténtalo de nuevo.");
			return;
		}

		setLoading(true);

		try {
			await registerUser({
				ci: ci.trim(),
				name: name.trim(),
				password,
			});

			await Alert.success("Cuenta creada", "Ya puedes iniciar sesión.", 1400);
			window.location.href = "/login";
		} catch (err) {
			await Alert.error(
				"No se pudo crear el usuario",
				err instanceof Error ? err.message : "Inténtalo nuevamente más tarde."
			);
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

			<div className="flex flex-col gap-3">
				<Button label="Crear cuenta" type="submit" adaptive loading={loading} />
			</div>
		</form>
	);
}
