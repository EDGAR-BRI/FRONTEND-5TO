import { useState, useEffect, type SyntheticEvent } from "react";
import { Button } from "@/components/react/primary/Button";
import { Field } from "@/components/react/primary/Field";
import { listRoles, loginWithCredentials, dashboardPathForUser, persistLogin } from "@/lib/services/auth/auth.service";
import { Alert } from "@/utils/alerts";

type Props = {
	className?: string;
	buttonLabel?: string;
};

export default function LoginForm({ className, buttonLabel = "Iniciar sesión" }: Props) {
	const [ci, setCi] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [sessionExpired, setSessionExpired] = useState(false);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		if (params.get("reason") === "session_expired") {
			setSessionExpired(true);
			Alert.info("Sesión expirada", "Tu sesión ha expirado. Inicia sesión nuevamente.");
			// Limpiar query param de la URL sin recargar
			const url = new URL(window.location.href);
			url.searchParams.delete("reason");
			window.history.replaceState({}, "", url.toString());
		}
	}, []);

	const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		try {
			const data = await loginWithCredentials({ ci: ci.trim(), password });
			persistLogin(data);

			let roleCode: string | undefined = data.user.role?.code;
			if (!roleCode && data.user.roleId) {
				try {
					const roles = await listRoles();
					roleCode = roles.find((r) => r.id === data.user.roleId)?.code;
				} catch {
					// ignore
				}
			}

			const nextFromQuery = new URLSearchParams(window.location.search).get("next");
			const nextPath = nextFromQuery || dashboardPathForUser(data.user, roleCode);

			await Alert.success("Inicio de sesión exitoso", `Bienvenido/a, ${data.user.name}`, 1800);
			window.location.href = nextPath;
		} catch (err) {
			await Alert.error(
				"No se pudo iniciar sesión",
				err instanceof Error ? err.message : "Verifica tus credenciales e inténtalo nuevamente."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form className={className} onSubmit={onSubmit}>
			{sessionExpired && (
				<div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm mb-2 flex items-center gap-2">
					<span className="font-semibold">Tu sesión ha expirado.</span> Inicia sesión para continuar.
				</div>
			)}
			<div className="flex flex-col gap-1">
				<Field
					name="ci"
					label="CI"
					type="text"
					placeholder="Ej: 12345678"
					autoComplete="username"
					inputMode="numeric"
					value={ci}
					onChange={(e) => setCi(e.target.value)}
					disabled={loading}
					required
				/>
			</div>

			<div className="flex flex-col gap-1">
				<Field
					name="password"
					label="Contraseña"
					type="password"
					placeholder="••••••"
					autoComplete="current-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					disabled={loading}
					required
					showTogglePassword
					className="mt-1"
				/>
			</div>

			<Button label={buttonLabel} type="submit" adaptive loading={loading} />
		</form>
	);
}
