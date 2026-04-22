import { useEffect, useState } from "react";
import { getRecentUsers } from "@/lib/services/admin/admin.service";

const colors: Record<string, string> = {
	ACTIVO: "bg-green-100 text-green-700",
	INACTIVO: "bg-red-100 text-red-700",
};

export default function RecentUsersTable() {
	const [users, setUsers] = useState<Array<{ id: number; name: string; role: string; status: string }>>([]);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const data = await getRecentUsers(6);
				if (!mounted) return;
				setUsers(
					data.map((user) => ({
						id: user.id,
						name: user.name,
						role: user.role,
						status: user.status,
					}))
				);
			} catch {
				if (mounted) setUsers([]);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-left border-collapse">
				<thead>
					<tr className="border-b border-gray-100 text-sm text-gray-500">
						<th className="pb-3 font-medium">Nombre</th>
						<th className="pb-3 font-medium">Rol</th>
						<th className="pb-3 font-medium">Estado</th>
					</tr>
				</thead>
				<tbody className="text-sm">
					{users.map((user) => (
						<tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
							<td className="py-4 text-gray-800 font-medium">{user.name}</td>
							<td className="py-4 text-gray-500">{user.role}</td>
							<td className="py-4">
								<span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[user.status] ?? "bg-gray-100 text-gray-700"}`}>
									{user.status}
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
