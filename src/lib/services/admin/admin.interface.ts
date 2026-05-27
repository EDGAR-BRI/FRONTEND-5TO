export type AdminUserRoleCode = "ADMIN" | "DOCTOR" | "RECEPCIONISTA" | "PACIENTE";

export type { CreateUserRequest, UpdateUserRequest, UserDto, UserRoleDto } from "../User/user.interface";

export type RoleDto = {
	id: number;
	name: string;
	code: string;
	base_salary?: number | string | null;
};

export type SupplyDto = {
	id: number;
	name: string;
	sku?: string | null;
	description?: string | null;
	cost_price: number | string;
	min_stock?: number | null;
	active?: boolean;
	type?: string | null;
	stock?: number;
	categoryId?: number;
	unitId?: number;
	category?: { id?: number; name: string };
	unit?: { id?: number; name: string; symbol?: string | null };
};

export type InvoiceDto = {
	id: number;
	total_usd: number | string;
	status?: { name?: string | null };
	patient?: { user?: { name?: string | null } };
	receptionist?: { name?: string | null };
	payments?: Array<{
		amount_paid: number | string;
		exchangeRate?: { createdAt?: string | null };
	}>;
};

export type InvoiceExpenseDto = {
	id: number;
	total_amount: number | string;
	date_at?: string | null;
	category?: { name?: string | null };
	supplier?: { name?: string | null };
	payments?: Array<{ amount: number | string }>;
};

export type AdminUserView = {
	id: number;
	ci: string;
	name: string;
	roleId: number;
	role: AdminUserRoleCode;
	status: "ACTIVO" | "INACTIVO";
	doctor?: {
		id: number;
		specialtyId: number;
		specialty?: {
			id: number;
			name: string;
			consultation_price: number;
			commission_percentage: number;
		};
	};
};

export type SupplyCategory = {
	id: number;
	name: string;
};

export type SupplyUnit = {
	id: number;
	name: string;
	symbol: string;
};

export type InventoryItemView = {
	id: number;
	type: "INSUMO" | "SERVICIO";
	name: string;
	category: string;
	categoryId?: number;
	unit: string;
	unitId?: number;
	price: number;
	stock: number;
	minStock: number;
	available: boolean;
	status: "ACTIVO" | "INACTIVO";
	sku?: string;
	description?: string;
};

export type FinanceSummary = {
	totalIncome: number;
	totalExpenses: number;
	netBalance: number;
	pendingPayments: number;
};

export type FinanceTransaction = {
	id: number;
	patientName: string;
	code: string;
	date: string;
	detail: string;
	provider: string;
	category: string;
	amount: number;
	status: "completed" | "pending" | "cancelled";
};

export type ReportSnapshotScope = "gastos" | "operativos" | "resultados";

export type ReportSnapshot = {
	total: number;
	secondary: number;
	tertiary: number;
	labelTotal: string;
	labelSecondary: string;
	labelTertiary: string;
};
