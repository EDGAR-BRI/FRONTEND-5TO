import { api } from "@/lib/api";
import { readEnvelopeData, readEnvelopeErrorMessage } from "@/lib/services/_shared/envelope";
import { createUser, deleteUser, listUsers, updateUser } from "@/lib/services/User/user.service";

export type * from "./admin.interface";

import type {
	AdminUserRoleCode,
	AdminUserView,
	FinanceSummary,
	FinanceTransaction,
	InventoryItemView,
	InvoiceDto,
	InvoiceExpenseDto,
	RoleDto,
	SupplyCategory,
	SupplyDto,
	SupplyUnit,
	UserDto,
	ReportSnapshot,
	ReportSnapshotScope,
} from "./admin.interface";

// Utilidades internas para mapeo y transformación de datos a numeros y formatos adecuados para el frontend. No se exportan fuera de este módulo.
const toNumber = (value: unknown): number => {
	const parsed = Number(value ?? 0);
	return Number.isFinite(parsed) ? parsed : 0;
};



const normalizeRoleCode = (value?: string | null): AdminUserRoleCode => {
	const normalized = (value ?? "")
		.toUpperCase()
		.trim()
		.replaceAll("Á", "A")
		.replaceAll("É", "E")
		.replaceAll("Í", "I")
		.replaceAll("Ó", "O")
		.replaceAll("Ú", "U");

	if (normalized === "ADMIN") return "ADMIN";
	if (normalized === "DOCTOR") return "DOCTOR";
	if (normalized === "RECEPCIONISTA" || normalized === "RECEPTIONIST" || normalized === "RECEPTION") return "RECEPCIONISTA";
	return "PACIENTE";
};

const mapUser = (user: UserDto): AdminUserView => ({
	id: user.id,
	ci: user.ci,
	name: user.name,
	roleId: user.roleId,
	role: normalizeRoleCode(user.role?.code),
	status: user.active ? "ACTIVO" : "INACTIVO",
	doctor: user.doctor,
});

export const listAdminUsers = async (): Promise<AdminUserView[]> => {
	const users = await listUsers();
	return users.map(mapUser);
};

export const listAdminRoles = async (): Promise<RoleDto[]> => {
	const response = await api("/auth/role", { method: "GET" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<RoleDto[]>(response);
};

export const createAdminRole = async (payload: {
	name: string;
	code: string;
	base_salary?: number;
}) => {
	const response = await api("/auth/role", {
		method: "POST",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<RoleDto>(response);
};

export const updateAdminRole = async (id: number, payload: {
	name?: string;
	code?: string;
	base_salary?: number | null;
}) => {
	const response = await api(`/auth/role/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<RoleDto>(response);
};

export const deleteAdminRole = async (id: number) => {
	const response = await api(`/auth/role/${id}`, { method: "DELETE" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<RoleDto>(response);
};

export const createAdminUser = async (payload: {
	ci: string;
	name: string;
	password: string;
	roleId: number;
	specialtyId?: number;
}) => {
	const created = await createUser(payload);
	return mapUser(created);
};

export const updateAdminUser = async (
	id: number,
	payload: {
		ci?: string;
		name?: string;
		password?: string;
		roleId?: number;
		specialtyId?: number;
	}
) => {
	const updated = await updateUser(id, payload);
	return mapUser(updated);
};

export const deactivateAdminUser = async (id: number) => {
	const deleted = await deleteUser(id);
	return mapUser(deleted);
};

export const listSupplyCategories = async (): Promise<SupplyCategory[]> => {
	const response = await api("/inventory/category", { method: "GET" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<SupplyCategory[]>(response);
};

export const listSupplyUnits = async (): Promise<SupplyUnit[]> => {
	const response = await api("/inventory/measurement-unit", { method: "GET" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<SupplyUnit[]>(response);
};

const mapSupply = (item: SupplyDto): InventoryItemView => {
	const rawType = (item.type ?? "INSUMO").toString().trim().toUpperCase();
	const type = rawType === "SERVICIO" ? "SERVICIO" : "INSUMO";
	const isActive = item.active ?? true;
	const stock = type === "INSUMO" ? toNumber(item.stock ?? 0) : 0;
	const minStock = type === "INSUMO" ? toNumber(item.min_stock ?? 0) : 0;
	const available = type === "SERVICIO" ? isActive : stock > 0;

	return {
		id: item.id,
		type,
		name: item.name,
		category: item.category?.name ?? "Sin categoría",
		categoryId: item.category?.id ?? item.categoryId,
		unit: item.unit?.symbol ? `${item.unit.name} (${item.unit.symbol})` : item.unit?.name ?? "N/A",
		unitId: item.unit?.id ?? item.unitId,
		price: toNumber(item.cost_price),
		stock,
		minStock,
		available,
		status: isActive ? "ACTIVO" : "INACTIVO",
		sku: item.sku ?? undefined,
		description: item.description ?? undefined,
	};
};

const listAdminInventoryItems = async (): Promise<InventoryItemView[]> => {
	const response = await api("/inventory/supply", { method: "GET" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	const supplies = await readEnvelopeData<SupplyDto[]>(response);
	return supplies.map(mapSupply);
};

export const listAdminSupplies = async (): Promise<InventoryItemView[]> => {
	const items = await listAdminInventoryItems();
	return items.filter((item) => item.type === "INSUMO");
};

export const listAdminServices = async (): Promise<InventoryItemView[]> => {
	const items = await listAdminInventoryItems();
	return items.filter((item) => item.type === "SERVICIO");
};

export const createAdminSupply = async (payload: {
	type?: "INSUMO" | "SERVICIO";
	name: string;
	sku?: string;
	description?: string;
	cost_price: number;
	min_stock?: number;
	categoryId: number;
	unitId: number;
	active?: boolean;
}) => {
	const response = await api("/inventory/supply", {
		method: "POST",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	const created = await readEnvelopeData<SupplyDto>(response);
	return mapSupply(created);
};

export const updateAdminSupply = async (
	id: number,
	payload: {
		type?: "INSUMO" | "SERVICIO";
		name?: string;
		sku?: string;
		description?: string;
		cost_price?: number;
		min_stock?: number;
		categoryId?: number;
		unitId?: number;
		active?: boolean;
	}
) => {
	const response = await api(`/inventory/supply/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	const updated = await readEnvelopeData<SupplyDto>(response);
	return mapSupply(updated);
};

export const deleteAdminSupply = async (id: number) => {
	const response = await api(`/inventory/supply/${id}`, { method: "DELETE" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	const deleted = await readEnvelopeData<SupplyDto>(response);
	return mapSupply(deleted);
};

export const getAdminOverviewStats = async () => {
	const [patientsRes, suppliesRes, invoicesRes, consultationsRes] = await Promise.all([
		api("/medical/patient", { method: "GET" }),
		api("/inventory/supply", { method: "GET" }),
		api("/finance/invoice", { method: "GET" }),
		api("/medical/consultation", { method: "GET" }),
	]);

	const patients = patientsRes.ok ? await readEnvelopeData<Array<{ id: number }>>(patientsRes) : [];
	const supplies = suppliesRes.ok ? await readEnvelopeData<Array<{ stock?: number; min_stock?: number }>>(suppliesRes) : [];
	const invoices = invoicesRes.ok ? await readEnvelopeData<InvoiceDto[]>(invoicesRes) : [];
	const consultations = consultationsRes.ok ? await readEnvelopeData<Array<{ id: number }>>(consultationsRes) : [];

	const criticalSupplies = supplies.filter((item) => toNumber(item.stock) <= toNumber(item.min_stock ?? 0)).length;
	const monthIncome = invoices.reduce((sum, inv) => sum + toNumber(inv.total_usd), 0);

	return {
		patients: patients.length,
		criticalSupplies,
		monthIncome,
		reportsCount: consultations.length,
	};
};

export const getRecentUsers = async (limit = 6): Promise<AdminUserView[]> => {
	const users = await listAdminUsers();
	return [...users].sort((a, b) => b.id - a.id).slice(0, limit);
};

const mapStatusToTransaction = (statusName?: string | null): "completed" | "pending" | "cancelled" => {
	const status = (statusName ?? "").toLowerCase();
	if (status.includes("anulad") || status.includes("cancel")) return "cancelled";
	if (status.includes("pend") || status.includes("proforma")) return "pending";
	return "completed";
};

export const getFinanceDashboardData = async (): Promise<{
	summary: FinanceSummary;
	transactions: FinanceTransaction[];
}> => {
	const [invoicesRes, expenseInvoicesRes] = await Promise.all([
		api("/finance/invoice", { method: "GET" }),
		api("/expenses/invoice-expense", { method: "GET" }),
	]);

	if (!invoicesRes.ok) {
		throw new Error(await readEnvelopeErrorMessage(invoicesRes));
	}
	if (!expenseInvoicesRes.ok) {
		throw new Error(await readEnvelopeErrorMessage(expenseInvoicesRes));
	}

	const invoices = await readEnvelopeData<InvoiceDto[]>(invoicesRes);
	const expenseInvoices = await readEnvelopeData<InvoiceExpenseDto[]>(expenseInvoicesRes);

	const totalIncome = invoices.reduce((sum, invoice) => sum + toNumber(invoice.total_usd), 0);
	const totalExpenses = expenseInvoices.reduce((sum, expense) => sum + toNumber(expense.total_amount), 0);
	const pendingPayments = invoices.filter((invoice) => mapStatusToTransaction(invoice.status?.name) === "pending").length;

	const incomeTransactions: FinanceTransaction[] = invoices.map((invoice) => ({
		id: invoice.id,
		patientName: invoice.patient?.user?.name ?? "Paciente",
		code: `FAC-${invoice.id}`,
		date: invoice.payments?.[0]?.exchangeRate?.createdAt ?? "",
		detail: "Factura clínica",
		provider: invoice.receptionist?.name ?? "Caja",
		category: "Consulta",
		amount: toNumber(invoice.total_usd),
		status: mapStatusToTransaction(invoice.status?.name),
	}));

	const expenseTransactions: FinanceTransaction[] = expenseInvoices.map((expense) => ({
		id: 100000 + expense.id,
		patientName: expense.supplier?.name ?? "Proveedor",
		code: `GAS-${expense.id}`,
		date: expense.date_at ?? "",
		detail: expense.category?.name ?? "Gasto operativo",
		provider: expense.supplier?.name ?? "Proveedor",
		category: "Gasto",
		amount: toNumber(expense.total_amount),
		status: "completed",
	}));

	const transactions = [...incomeTransactions, ...expenseTransactions]
		.sort((a, b) => {
			const aTime = a.date ? new Date(a.date).getTime() : 0;
			const bTime = b.date ? new Date(b.date).getTime() : 0;
			return bTime - aTime;
		})
		.slice(0, 40);

	return {
		summary: {
			totalIncome,
			totalExpenses,
			netBalance: totalIncome - totalExpenses,
			pendingPayments,
		},
		transactions,
	};
};

export const getReportSnapshot = async (scope: ReportSnapshotScope): Promise<ReportSnapshot> => {
	if (scope === "gastos") {
		const [expenseRes, purchaseRes] = await Promise.all([
			api("/expenses/invoice-expense", { method: "GET" }),
			api("/procurement/purchase", { method: "GET" }),
		]);

		const expenses = expenseRes.ok ? await readEnvelopeData<InvoiceExpenseDto[]>(expenseRes) : [];
		const purchases = purchaseRes.ok ? await readEnvelopeData<Array<{ id: number; supplierId: number }>>(purchaseRes) : [];

		const total = expenses.reduce((sum, item) => sum + toNumber(item.total_amount), 0);
		const suppliers = new Set(expenses.map((item) => item.supplier?.name ?? ""));

		return {
			total,
			secondary: purchases.length,
			tertiary: suppliers.size,
			labelTotal: "Total de egresos",
			labelSecondary: "Compras registradas",
			labelTertiary: "Proveedores activos",
		};
	}

	if (scope === "operativos") {
		const [appointmentsRes, consultationsRes, doctorsRes] = await Promise.all([
			api("/scheduling/appointment", { method: "GET" }),
			api("/medical/consultation", { method: "GET" }),
			api("/medical/doctor", { method: "GET" }),
		]);

		const appointments = appointmentsRes.ok ? await readEnvelopeData<Array<{ id: number }>>(appointmentsRes) : [];
		const consultations = consultationsRes.ok ? await readEnvelopeData<Array<{ id: number }>>(consultationsRes) : [];
		const doctors = doctorsRes.ok ? await readEnvelopeData<Array<{ id: number }>>(doctorsRes) : [];

		return {
			total: appointments.length,
			secondary: consultations.length,
			tertiary: doctors.length,
			labelTotal: "Citas registradas",
			labelSecondary: "Consultas completadas",
			labelTertiary: "Médicos disponibles",
		};
	}

	const [consultationsRes, invoicesRes, patientsRes] = await Promise.all([
		api("/medical/consultation", { method: "GET" }),
		api("/finance/invoice", { method: "GET" }),
		api("/medical/patient", { method: "GET" }),
	]);

	const consultations = consultationsRes.ok
		? await readEnvelopeData<Array<{ id: number; finished_at?: string | null }>>(consultationsRes)
		: [];
	const invoices = invoicesRes.ok
		? await readEnvelopeData<Array<{ id: number; total_usd: number | string }>>(invoicesRes)
		: [];
	const patients = patientsRes.ok ? await readEnvelopeData<Array<{ id: number }>>(patientsRes) : [];

	const completed = consultations.filter((item) => Boolean(item.finished_at)).length;
	const income = invoices.reduce((sum, item) => sum + toNumber(item.total_usd), 0);

	return {
		total: completed,
		secondary: patients.length,
		tertiary: income,
		labelTotal: "Consultas finalizadas",
		labelSecondary: "Pacientes atendidos",
		labelTertiary: "Ingreso asociado",
	};
};

export const getExpenseLedger = async (params: { from: string, to: string }) => {
	const searchParams = new URLSearchParams({
		from: params.from,
		to: params.to,
		pageSize: '100', // Fetch more items
	});
	const response = await api(`/report/expense-ledger?${searchParams.toString()}`, { method: "GET" });
	if (!response.ok) {
		throw new Error(await readEnvelopeErrorMessage(response));
	}
	return readEnvelopeData<any>(response); // Returning the entire data object
};
