import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DataTable, type Column } from "@/components/react/primary/DataTable";
import { Badge } from "@/components/react/primary/Badge";
import { Button } from "@/components/react/primary/Button";
import { StatsCard } from "@/components/react/primary/StatsCard";
import { listPayrolls, updatePayroll } from "@/lib/services/finance/payroll/payroll.service";
import type { PayrollRecord, PayrollStatus } from "@/lib/services/finance/payroll/payroll.interface";
import {
	FaArrowRight,
	FaCalendarDays,
	FaCircleCheck,
	FaClock,
	FaMagnifyingGlass,
	FaMoneyBillTrendUp,
	FaRotateRight,
	FaUsers,
	FaUserDoctor,
	FaXmark,
} from "react-icons/fa6";

const money = (value: number, currency = "USD") =>
	new Intl.NumberFormat("es-VE", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(Number(value || 0));

const normalizeStatus = (status?: string | null): PayrollStatus => (status || "Pending").trim().toUpperCase();

const isLastDayOfMonth = (date: Date) => {
	const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	return (
		date.getFullYear() === lastDay.getFullYear() &&
		date.getMonth() === lastDay.getMonth() &&
		date.getDate() === lastDay.getDate()
	);
};

const sameCalendarDay = (left: Date, right: Date) =>
	left.getFullYear() === right.getFullYear() &&
	left.getMonth() === right.getMonth() &&
	left.getDate() === right.getDate();

const payrollLineAmount = (line: PayrollRecord["payrollLines"][number]) =>
	Number(line.base_amount || 0) * (Number(line.commission_percentage || 0) / 100);

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: ReactNode }> = {
	PAID: { label: "Pagada", bg: "bg-green-50", text: "text-green-700", icon: <FaCircleCheck size={12} /> },
	PENDING: { label: "Pendiente", bg: "bg-yellow-50", text: "text-yellow-700", icon: <FaClock size={12} /> },
	DRAFT: { label: "Borrador", bg: "bg-slate-100", text: "text-slate-700", icon: <FaClock size={12} /> },
	CANCELLED: { label: "Cancelada", bg: "bg-red-50", text: "text-red-700", icon: <FaXmark size={12} /> },
};

export const PayrollDashboard = () => {
	const { data, error, isLoading, mutate } = useSWR<PayrollRecord[]>("payroll-history", listPayrolls);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PAID" | "DRAFT" | "CANCELLED">("ALL");
	const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(null);
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [payingPayrollId, setPayingPayrollId] = useState<number | null>(null);

	const payrolls = data ?? [];

	const filteredPayrolls = useMemo(() => {
		const term = search.trim().toLowerCase();

		return payrolls.filter((payroll) => {
			const payrollStatus = normalizeStatus(payroll.status);
			if (statusFilter !== "ALL" && payrollStatus !== statusFilter) return false;

			if (!term) return true;

			const doctorNames = payroll.payrollLines.map((line) => line.consultation.doctor.user.name).join(" ");
			const invoiceIds = payroll.payrollLines.map((line) => line.consultation.invoiceId).join(" ");
			const haystack = [
				payroll.id,
				payroll.status,
				payroll.period_start,
				payroll.period_end,
				doctorNames,
				invoiceIds,
			].join(" ").toLowerCase();

			return haystack.includes(term);
		});
	}, [payrolls, search, statusFilter]);

	useEffect(() => {
		if (filteredPayrolls.length === 0) {
			setSelectedPayrollId(null);
			setIsPanelOpen(false);
			return;
		}

		const stillVisible = filteredPayrolls.some((payroll) => payroll.id === selectedPayrollId);
		if (!selectedPayrollId || !stillVisible) {
			setSelectedPayrollId(filteredPayrolls[0].id);
		}
	}, [filteredPayrolls, selectedPayrollId]);

	useEffect(() => {
		if (!isPanelOpen) return;

		const previousBodyOverflow = document.body.style.overflow;
		const previousHtmlOverflow = document.documentElement.style.overflow;

		document.body.style.overflow = "hidden";
		document.documentElement.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previousBodyOverflow;
			document.documentElement.style.overflow = previousHtmlOverflow;
		};
	}, [isPanelOpen]);

	const selectedPayroll = useMemo(
		() => filteredPayrolls.find((payroll) => payroll.id === selectedPayrollId) ?? filteredPayrolls[0] ?? null,
		[filteredPayrolls, selectedPayrollId]
	);

	const stats = useMemo(() => {
		const totalConsultations = payrolls.reduce((sum, payroll) => sum + payroll.payrollLines.length, 0);
		const totalPayable = payrolls.reduce(
			(sum, payroll) => sum + payroll.payrollLines.reduce((lineSum, line) => lineSum + payrollLineAmount(line), 0),
			0
		);
		const uniqueDoctors = new Set(
			payrolls.flatMap((payroll) => payroll.payrollLines.map((line) => line.consultation.doctorId))
		).size;
		const pendingPayrolls = payrolls.filter((payroll) => normalizeStatus(payroll.status) === "PENDING").length;

		return {
			totalPayrolls: payrolls.length,
			totalConsultations,
			totalPayable,
			uniqueDoctors,
			pendingPayrolls,
		};
	}, [payrolls]);

	const columns: Column<PayrollRecord>[] = useMemo(
		() => [
			{
				header: "PERIODO",
				accessorKey: "period_start",
				cell: (payroll) => (
					<div className="flex flex-col gap-1">
						<span className="font-semibold text-primary-900">#{payroll.id}</span>
						<span className="text-xs text-cool-gray-50">
							{format(new Date(payroll.period_start), "dd MMM yyyy", { locale: es })} - {format(new Date(payroll.period_end), "dd MMM yyyy", { locale: es })}
						</span>
						<span className="text-xs text-cool-gray-40">
							Creada el {format(new Date(payroll.created_at), "dd MMM yyyy · HH:mm", { locale: es })}
						</span>
					</div>
				),
			},
			{
				header: "DOCTORES / CONSULTAS",
				accessorKey: "payrollLines",
				cell: (payroll) => {
					const doctorNames = Array.from(new Set(payroll.payrollLines.map((line) => line.consultation.doctor.user.name)));
					const previewNames = doctorNames.slice(0, 2).join(", ");
					const extraDoctors = Math.max(doctorNames.length - 2, 0);

					return (
						<div className="flex flex-col gap-1 min-w-0">
							<span className="font-medium text-cool-gray-90 truncate">
								{previewNames || "Sin doctores"}
								{extraDoctors > 0 ? ` +${extraDoctors}` : ""}
							</span>
							<span className="text-xs text-cool-gray-50">{doctorNames.length} doctores · {payroll.payrollLines.length} consultas</span>
						</div>
					);
				},
			},
			{
				header: "MONTO ESTIMADO",
				accessorKey: "id",
				cell: (payroll) => {
					const amount = payroll.payrollLines.reduce((sum, line) => sum + payrollLineAmount(line), 0);
					return (
						<div className="flex flex-col gap-1">
							<span className="font-semibold text-cool-gray-90">{money(amount)}</span>
							<span className="text-xs text-cool-gray-50">Base x comisión</span>
						</div>
					);
				},
			},
			{
				header: "ESTADO",
				accessorKey: "status",
				cell: (payroll) => {
					const config = statusConfig[normalizeStatus(payroll.status)] ?? statusConfig.PENDING;
					return (
						<Badge
							styles={{
								bg: config.bg,
								text: config.text,
								border: "border-transparent",
								rounded: "rounded-full",
								padding: "px-2.5 py-1",
							}}
						>
							<span className="flex items-center gap-1.5">
								{config.icon}
								{config.label}
							</span>
						</Badge>
					);
				},
			},
			{
				header: "ACCIONES",
				accessorKey: "id",
				align: "right",
				cell: (payroll) => (
					<button
						type="button"
						onClick={() => {
							setSelectedPayrollId(payroll.id);
							setIsPanelOpen(true);
						}}
						className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-white px-3 py-2 text-xs font-semibold text-primary-700 hover:border-primary-400 hover:bg-primary-50 transition-colors"
					>
						Ver detalle
						<FaArrowRight size={11} />
					</button>
				),
			},
		],
		[]
	);

	const canMarkAsPaid = (payroll: PayrollRecord) => {
		const status = normalizeStatus(payroll.status);
		if (status !== "PENDING") return false;

		const today = new Date();
		const periodEnd = new Date(payroll.period_end);
		return isLastDayOfMonth(today) && sameCalendarDay(today, periodEnd);
	};

	const handleMarkAsPaid = async () => {
		if (!selectedPayroll) return;
		setPayingPayrollId(selectedPayroll.id);
		try {
			await updatePayroll(selectedPayroll.id, { status: "Paid" });
			await mutate();
		} finally {
			setPayingPayrollId(null);
		}
	};

	if (error) {
		return (
			<div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
				No se pudo cargar el historial de nóminas.
				<button
					type="button"
					onClick={() => mutate()}
					className="ml-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 transition-colors"
				>
					Reintentar
					<FaRotateRight size={12} />
				</button>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
					<StatsCard title="Nóminas" value={stats.totalPayrolls} color="primary" icon={<FaMoneyBillTrendUp size={18} />} variant="compact" />
					<StatsCard title="Consultas acumuladas" value={stats.totalConsultations} color="success" icon={<FaUsers size={18} />} variant="compact" />
					<StatsCard title="Monto estimado" value={money(stats.totalPayable)} color="primary" icon={<FaCalendarDays size={18} />} variant="compact" />
					<StatsCard title="Pendientes" value={stats.pendingPayrolls} color="warning" icon={<FaClock size={18} />} variant="compact" />
				</div>

				<section className="space-y-4">
					<div className="rounded-2xl border border-primary-200 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
						<div className="flex flex-col gap-4 border-b border-primary-200 bg-primary-50/70 px-5 py-4 md:flex-row md:items-center md:justify-between">
							<div className="space-y-1">
								<h2 className="text-lg font-semibold text-primary-900">Historial de nóminas</h2>
								<p className="text-sm text-cool-gray-60">
									Cada nómina agrupa las consultas finalizadas del mes para cada doctor.
								</p>
							</div>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => mutate()}
									className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors"
								>
									<FaRotateRight size={13} />
									Actualizar
								</button>
							</div>
						</div>

						<div className="flex flex-col gap-4 border-b border-primary-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
							<label className="relative block w-full lg:max-w-md">
								<span className="sr-only">Buscar nóminas</span>
								<FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cool-gray-40" size={14} />
								<input
									type="search"
									value={search}
									onChange={(event) => setSearch(event.target.value)}
									placeholder="Buscar por doctor, consulta, periodo o estado"
									className="w-full rounded-xl border border-primary-200 bg-white py-2.5 pl-9 pr-4 text-sm text-cool-gray-90 outline-none transition-colors placeholder:text-cool-gray-40 focus:border-primary-400"
								/>
							</label>

							<div className="flex flex-wrap gap-2">
								{(["ALL", "PENDING", "PAID", "DRAFT", "CANCELLED"] as const).map((value) => {
									const labelMap: Record<typeof value, string> = {
										ALL: "Todas",
										PENDING: "Pendientes",
										PAID: "Pagadas",
										DRAFT: "Borradores",
										CANCELLED: "Canceladas",
									};

									const isActive = statusFilter === value;

									return (
										<button
											key={value}
											type="button"
											onClick={() => setStatusFilter(value)}
											className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
												isActive
													? "border-primary-500 bg-primary-500 text-white"
													: "border-primary-200 bg-white text-primary-700 hover:bg-primary-50"
											}`}
										>
											{labelMap[value]}
										</button>
									);
								})}
							</div>
						</div>

						<DataTable<PayrollRecord>
							className="rounded-none! border-none!"
							endpoint=""
							data={filteredPayrolls}
							columns={columns}
							isLoading={isLoading}
						/>
					</div>
				</section>
			</div>

			{isPanelOpen && selectedPayroll ? (
				<div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-sm">
					<div className="h-full w-full max-w-3xl overflow-y-auto border-l border-primary-200 bg-white shadow-2xl">
						<div className="sticky top-0 z-10 border-b border-primary-200 bg-white/95 px-6 py-5 backdrop-blur">
							<div className="flex items-start justify-between gap-4">
								<div className="space-y-1">
									<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">Nómina #{selectedPayroll.id}</p>
									<h3 className="text-xl font-semibold text-primary-900">
										{format(new Date(selectedPayroll.period_start), "MMMM yyyy", { locale: es })}
									</h3>
									<p className="text-sm text-cool-gray-60">
										{format(new Date(selectedPayroll.period_start), "dd MMM yyyy", { locale: es })} - {format(new Date(selectedPayroll.period_end), "dd MMM yyyy", { locale: es })}
									</p>
								</div>
								<button
									type="button"
									onClick={() => setIsPanelOpen(false)}
									className="rounded-lg border border-primary-200 p-2 text-primary-700 hover:bg-primary-50"
								>
									<FaXmark size={14} />
								</button>
							</div>
						</div>

						<div className="px-6 py-6 space-y-6">
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<StatsCard title="Consultas" value={selectedPayroll.payrollLines.length} color="primary" icon={<FaUsers size={18} />} variant="compact" />
								<StatsCard title="Doctores" value={new Set(selectedPayroll.payrollLines.map((line) => line.consultation.doctorId)).size} color="success" icon={<FaUserDoctor size={18} />} variant="compact" />
								<StatsCard title="Monto" value={money(selectedPayroll.payrollLines.reduce((sum, line) => sum + payrollLineAmount(line), 0))} color="primary" icon={<FaCalendarDays size={18} />} variant="compact" />
							</div>

							<div className="rounded-2xl border border-primary-200 bg-primary-50/50 p-4 flex flex-wrap items-center justify-between gap-3">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">Estado actual</p>
									<p className="mt-1 text-sm text-primary-900">
										{normalizeStatus(selectedPayroll.status) === "PENDING"
											? "Lista para pagar al cierre del mes"
											: `Marcada como ${normalizeStatus(selectedPayroll.status)}`}
									</p>
								</div>

								<div className="flex items-center gap-2">
									{canMarkAsPaid(selectedPayroll) ? (
										<Button
											label="Marcar como pagada"
											variant="primary"
											onClick={handleMarkAsPaid}
											loading={payingPayrollId === selectedPayroll.id}
											className="bg-primary-600! text-white!"
										/>
									) : (
										<div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
											Solo se puede pagar el último día del mes.
										</div>
									)}
								</div>
							</div>

							<div className="space-y-3">
								<h4 className="text-sm font-semibold text-primary-900">Líneas de nómina</h4>
								<div className="space-y-3">
									{selectedPayroll.payrollLines.map((line) => {
										const amount = payrollLineAmount(line);
										return (
											<div key={line.id} className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm">
												<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
													<div className="space-y-2 min-w-0">
														<p className="font-semibold text-primary-900">{line.consultation.doctor.user.name}</p>
														<p className="text-sm text-cool-gray-60">{line.consultation.doctor.specialty.name} · CI {line.consultation.doctor.user.ci}</p>
														<p className="text-xs text-cool-gray-50">
															Consulta #{line.consultation.id} · Factura #{line.consultation.invoiceId} · {format(new Date(line.consultation.date), "dd MMM yyyy", { locale: es })}
														</p>
													</div>
													<div className="text-right space-y-1">
														<p className="text-lg font-semibold text-primary-900">{money(amount)}</p>
														<p className="text-xs text-cool-gray-50">
															Base {money(Number(line.base_amount))} · Comisión {Number(line.commission_percentage)}%
														</p>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
};