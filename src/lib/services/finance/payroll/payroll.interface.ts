export type PayrollStatus = string;

export type PayrollLineRecord = {
	id: number;
	payrollId: number;
	consultationId: number;
	base_amount: number | string;
	commission_percentage: number | string;
	consultation: {
		id: number;
		invoiceId: number;
		doctorId: number;
		date: string;
		started_at: string;
		finished_at: string | null;
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
				commission_percentage: number | string;
				consultation_price: number | string;
			};
		};
		invoice: {
			id: number;
			total_usd: number | string;
			date_at: string;
		};
	};
};

export type PayrollRecord = {
	id: number;
	period_start: string;
	period_end: string;
	status: PayrollStatus;
	created_at: string;
	payrollLines: PayrollLineRecord[];
};

export type UpdatePayrollDto = {
	period_start?: string | Date;
	period_end?: string | Date;
	status?: string;
};