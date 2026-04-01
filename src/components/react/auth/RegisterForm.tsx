import React, { useMemo, useState } from "react";
import { Button } from "@/components/react/primary/Button";
import { registerUser } from "@/lib/services/auth/auth.service";

type Props = {
	className?: string;
};

export default function RegisterForm({ className }: Props) {
	const [ci, setCi] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const patientRoleLabel = useMemo(() => "Paciente (PACIENTE)", []);

	const disabled = useMemo(() => {
		return loading || !ci.trim() || !name.trim() || !password;
	}, [loading, ci, name, password]);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);
		setLoading(true);

		try {
			await registerUser({
				ci: ci.trim(),
				name: name.trim(),
				password,
			});

			setSuccess("Usuario creado. Ya puedes iniciar sesión.");
			setPassword("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "No se pudo crear el usuario");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form className={className} onSubmit={onSubmit}>
			<div className="flex flex-col gap-1">
				<label className="text-sm font-semibold text-gray-500" htmlFor="ci">
					CI
				</label>
				<input
					className="p-2 border placeholder:text-gray-300 placeholder:font-semibold transition-all rounded-md border-gray-400 focus:border-primary-600 focus:border-2 focus:outline-none"
					type="text"
					name="ci"
					id="ci"
					placeholder="Ej: 12345678"
					inputMode="numeric"
					autoComplete="username"
					value={ci}
					onChange={(e) => setCi(e.target.value)}
					disabled={loading}
					required
				/>
			</div>

			<div className="flex flex-col gap-1">
				<label className="text-sm font-semibold text-gray-500" htmlFor="name">
					Nombre
				</label>
				<input
					className="p-2 border placeholder:text-gray-300 placeholder:font-semibold transition-all rounded-md border-gray-400 focus:border-primary-600 focus:border-2 focus:outline-none"
					type="text"
					name="name"
					id="name"
					placeholder="Ej: Juan Pérez"
					autoComplete="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					disabled={loading}
					required
				/>
			</div>

			<div className="flex flex-col gap-1">
				<label className="text-sm font-semibold text-gray-500" htmlFor="password">
					Contraseña
				</label>
				<input
					className="p-2 border placeholder:text-gray-300 placeholder:font-semibold transition-all rounded-md border-gray-400 focus:border-primary-600 focus:border-2 focus:outline-none"
					type="password"
					name="password"
					id="password"
					placeholder="Mínimo 6 caracteres"
					autoComplete="new-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					disabled={loading}
					required
				/>
			</div>

			<div className="flex flex-col gap-1">
				<label className="text-sm font-semibold text-gray-500">Rol</label>
				<div className="p-2 border rounded-md border-gray-400 bg-gray-50 text-gray-600 font-semibold">
					{patientRoleLabel}
				</div>
			</div>

			{error ? <p className="text-sm text-error font-semibold">{error}</p> : null}
			{success ? <p className="text-sm text-primary-700 font-semibold">{success}</p> : null}

			<div className="flex flex-col gap-3">
				<Button label="Crear cuenta" type="submit" adaptive loading={loading} disabled={disabled} />
				<a className="text-center text-sm font-bold text-gray-400" href="/login">
					Volver a login
				</a>
			</div>
		</form>
	);
}
