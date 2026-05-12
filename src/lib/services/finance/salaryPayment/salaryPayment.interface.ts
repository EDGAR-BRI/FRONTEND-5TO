export type SalaryPaymentRecord = {
	id: number;
	payrollId: number;
	userId: number;
	amount: number | string;
	concept: string | null;
	date_at: string;
	user: {
		id: number;
		ci: string;
		name: string;
		role: {
			id: number;
			name: string;
			code: string;
			base_salary: number | string | null;
		};
	};
	payroll: {
		id: number;
		period_start: string;
		period_end: string;
		status: string;
	};
	payrollPayments: Array<{
		id: number;
		amount: number | string;
		payrollLine: {
			id: number;
			consultationId: number;
			base_amount: number | string;
			commission_percentage: number | string;
			consultation: {
				id: number;
				invoiceId: number;
				doctor: {
					id: number;
					user: {
						id: number;
						ci: string;
						name: string;
					};
					specialty: {
						id: number;
						name: string;
					};
				};
			};
		};
	}>;
};

export type SalaryPaymentCreateDto = {
	payrollId: number | string;
	userId: number | string;
	amount?: number | string;
	concept?: string;
	date_at?: string | Date;
};

export type PendingSalaryBreakdownItem = {
	type: 'PAYROLL_LINE' | 'BASE_SALARY';
	label: string;
	amount: number;
	payrollLineId?: number;
	consultationId?: number;
	invoiceId?: number;
	doctorId?: number;
	doctorName?: string;
	specialtyName?: string;
	baseAmount?: number;
	commissionPercentage?: number;
};

export type PendingSalarySummaryItem = {
	userId: number;
	userName: string;
	ci: string;
	roleName: string;
	roleCode: string;
	payrollId: number;
	amount: number;
	type: 'DOCTOR' | 'SALARY';
	breakdown: PendingSalaryBreakdownItem[];
};

export type PendingSalarySummaryResponse = {
	payroll: {
		id: number;
		period_start: string;
		period_end: string;
		status: string;
	} | null;
	items: PendingSalarySummaryItem[];
	totalAmount: number;
	totalUsers: number;
};
