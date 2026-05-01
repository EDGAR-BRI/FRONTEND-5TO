import { useState, type SyntheticEvent } from "react";
import { Button } from "@/components/react/primary/Button";
import { Field } from "@/components/react/primary/Field";
import { listRoles, loginWithCredentials, dashboardPathForUser, persistLogin } from "@/lib/services/auth/auth.service";
import { Alert } from "@/utils/alerts";
import { api } from "@/lib/api";

type Props = {
	className?: string;
	buttonLabel?: string;
};

export default function LoginForm({ className, buttonLabel = "Iniciar sesión" }: Props) {
	const [ci, setCi] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

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
            
            let nextPath = nextFromQuery || dashboardPathForUser(data.user, roleCode);

			// ─── MAGIA DE ONBOARDING: Interceptor de Pacientes ───
			if (roleCode?.toLowerCase() === 'paciente' || data.user.roleId === 4) {
				try {
					// Verificamos si este usuario ya está registrado en la tabla Patient
					const res = await api(`/medical/patient?userId=${data.user.id}`);
					if (res.ok) {
						const json = await res.json();
						// El backend puede devolver un array o un objeto según el endpoint
						const patientsList = Array.isArray(json.data) ? json.data : (json.data ? [json.data] : []);
						const currentPatient = patientsList.find((p: any) => String(p.userId) === String(data.user.id));

						if (currentPatient) {
							// ¡Ya tiene ficha! Lo mandamos a su panel
							nextPath = `/modules/pacient/${currentPatient.id}/overview`;
						} else {
							// ¡Es nuevo! Lo mandamos a llenar su ficha
							nextPath = `/modules/pacient/onboarding?userId=${data.user.id}`;
						}
					} else {
						// Si el endpoint falla, por seguridad lo mandamos al onboarding
						nextPath = `/modules/pacient/onboarding?userId=${data.user.id}`;
					}
				} catch (e) {
					console.error("Error al verificar perfil de paciente", e);
					nextPath = `/modules/pacient/onboarding?userId=${data.user.id}`;
				}
			}
			// ────────────────────────────────────────────────────────

			await Alert.success("Inicio de sesión exitoso", `Bienvenido/a, ${data.user.name}`, 900);
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
