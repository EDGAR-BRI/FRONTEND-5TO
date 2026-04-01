import React, { useMemo, useState } from "react";
import { Button } from "@/components/react/primary/Button";
import { listRoles, loginWithCredentials, dashboardPathForUser, persistLogin } from "@/lib/services/auth/auth.service";

type Props = {
	className?: string;
	buttonLabel?: string;
};

export default function LoginForm({ className, buttonLabel = "Iniciar sesión" }: Props) {
	const [ci, setCi] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const disabled = useMemo(() => loading || !ci.trim() || !password, [loading, ci, password]);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
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
			window.location.href = nextPath;
		} catch (err) {
			setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
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
					autoComplete="username"
					inputMode="numeric"
					value={ci}
					onChange={(e) => setCi(e.target.value)}
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
					placeholder="••••••"
					autoComplete="current-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					disabled={loading}
					required
				/>
			</div>

			{error ? <p className="text-sm text-error font-semibold">{error}</p> : null}

			<Button label={buttonLabel} type="submit" adaptive loading={loading} disabled={disabled} />
		</form>
	);
}
