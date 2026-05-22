import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaCalendarDays, FaUsers } from 'react-icons/fa6';
import { StatsCard } from '@/components/react/primary/StatsCard';
import { Button } from '@/components/react/primary/Button';
import { Modal } from '@/components/react/primary/Modal';
import { Alert } from '@/utils/alerts';
import { listPayrolls, updatePayroll } from '@/lib/services/finance/payroll/payroll.service';
import type { PayrollRecord } from '@/lib/services/finance/payroll/payroll.interface';
import { createSalaryPayment, getPendingSalarySummary } from '@/lib/services/finance/salaryPayment/salaryPayment.service';
import type { PendingSalarySummaryItem, PendingSalarySummaryResponse } from '@/lib/services/finance/salaryPayment/salaryPayment.interface';
import { getBcvRate, getExchangeRates } from '@/lib/services/finance/exchange-rate/exchange_rate.service';
import type { BcvRateResponse, ExchangeRate } from '@/lib/services/finance/exchange-rate/exchange_rate.interface';
import { dualAmount, money } from '@/utils/currency';

const sameCalendarDay = (left: Date, right: Date) =>
	left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();

const isLastDayOfMonth = (date: Date) => {
	const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	return sameCalendarDay(date, lastDay);
};

const payrollLineAmount = (line: PayrollRecord['payrollLines'][number]) =>
	Number(line.base_amount || 0) * (Number(line.commission_percentage || 0) / 100);

const breakdownLabel = (item: PendingSalarySummaryItem['breakdown'][number]) => {
	if (item.type === 'BASE_SALARY') return item.label;
	return `${item.label} · ${item.doctorName ?? 'Doctor'} · ${item.specialtyName ?? ''}`.trim();
};

export const CurrentMonthPayroll = () => {
	const { data, error, mutate } = useSWR<PayrollRecord[]>('payroll-current', listPayrolls, { refreshInterval: 5000 });
	const { data: pendingData, error: pendingError, isLoading: pendingLoading, mutate: mutatePending } = useSWR<PendingSalarySummaryResponse>('salary-payment-pending-summary', getPendingSalarySummary, { refreshInterval: 5000 });
	const { data: exchangeRates = [] } = useSWR<ExchangeRate[]>('current-payroll-exchange-rates', getExchangeRates);
	const { data: bcvRate } = useSWR<BcvRateResponse>('current-payroll-bcv-rate', getBcvRate);
	const [paying, setPaying] = useState<number | null>(null);
	const [selected, setSelected] = useState<PendingSalarySummaryItem | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [payAllOpen, setPayAllOpen] = useState(false);
	const [payingAll, setPayingAll] = useState(false);
	const [payAllProgress, setPayAllProgress] = useState<{
		current: string | null;
		paid: string[];
		failed: Array<{ name: string; error: string }>;
	}>({ current: null, paid: [], failed: [] });

	const today = new Date();
	const activeExchangeRate = useMemo(() => exchangeRates.find((rate) => rate.is_active) ?? exchangeRates[0] ?? null, [exchangeRates]);
	const usdToBsRate = useMemo(
		() => activeExchangeRate?.rate ?? bcvRate?.valor.valor_num ?? 0,
		[activeExchangeRate, bcvRate]
	);

	const payroll = useMemo(() => {
		const all = data ?? [];
		return all.find((p) => {
			const start = new Date(p.period_start);
			const end = new Date(p.period_end);
			return start <= today && today <= end;
		});
	}, [data]);

	const stats = useMemo(() => {
		if (!payroll) return { consultations: 0, doctors: 0, total: 0 };
		const consultations = payroll.payrollLines.length;
		const doctors = new Set(payroll.payrollLines.map((l) => l.consultation.doctorId)).size;
		const total = payroll.payrollLines.reduce((s, l) => s + payrollLineAmount(l), 0);
		const totalBs = usdToBsRate ? total * usdToBsRate : 0;
		return { consultations, doctors, total, totalBs };
	}, [payroll, usdToBsRate]);

	const canPayPayroll = () => {
		if (!payroll) return false;
		if ((payroll.status || '').trim().toUpperCase() !== 'PENDING') return false;
		const periodEnd = new Date(payroll.period_end);
		return isLastDayOfMonth(new Date()) && sameCalendarDay(new Date(), periodEnd);
	};

	const canClosePayroll = canPayPayroll() && (pendingData?.totalUsers ?? 0) === 0;

	const openPayment = (item: PendingSalarySummaryItem) => {
		if (!canPayPayroll()) return;
		setSelected(item);
		setConfirmOpen(true);
	};

	const openPayAll = () => {
		if (!canPayPayroll() || (pendingData?.items.length ?? 0) === 0) return;
		setPayAllProgress({ current: null, paid: [], failed: [] });
		setPayAllOpen(true);
	};

	const closePayment = () => {
		setConfirmOpen(false);
		setSelected(null);
	};

	const closePayAll = () => {
		if (payingAll) return;
		setPayAllOpen(false);
		setPayAllProgress({ current: null, paid: [], failed: [] });
	};

	const handlePay = async () => {
		if (!selected) return;
		setPaying(selected.userId);
		try {
			await createSalaryPayment({ payrollId: selected.payrollId, userId: selected.userId, amount: selected.amount });
			await Promise.all([mutate(), mutatePending()]);
			closePayment();
			await Alert.success('Pago registrado', `Se pagó a ${selected.userName} correctamente.`);
		} catch (err) {
			await Alert.error('No se pudo registrar el pago', err instanceof Error ? err.message : 'Error desconocido');
		} finally {
			setPaying(null);
		}
	};

	const handlePayAll = async () => {
		const items = pendingData?.items ?? [];
		if (!canPayPayroll() || items.length === 0) return;

		setPayingAll(true);
		setPayAllProgress({ current: null, paid: [], failed: [] });
		const paid: string[] = [];
		const failed: Array<{ name: string; error: string }> = [];

		for (const item of items) {
			setPayAllProgress((prev) => ({ ...prev, current: item.userName }));
			try {
				await createSalaryPayment({ payrollId: item.payrollId, userId: item.userId, amount: item.amount });
				paid.push(item.userName);
				setPayAllProgress((prev) => ({
					current: item.userName,
					paid: [...paid],
					failed: [...failed],
				}));
				await Promise.all([mutate(), mutatePending()]);
			} catch (err) {
				failed.push({ name: item.userName, error: err instanceof Error ? err.message : 'Error desconocido' });
				setPayAllProgress((prev) => ({
					current: item.userName,
					paid: [...paid],
					failed: [...failed],
				}));
			}
		}

		setPayingAll(false);
		await Promise.all([mutate(), mutatePending()]);
		await Alert.success('Proceso finalizado', `Pagos completados: ${paid.length} exitosos, ${failed.length} fallidos.`);
		setPayAllOpen(false);
		setPayAllProgress({ current: null, paid: [], failed: [] });
	};

	if (error || pendingError) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Error cargando la nómina del mes actual.</div>;

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
				<StatsCard title="Consultas acumuladas" value={stats.consultations} color="primary" icon={<FaUsers size={18} />} variant="compact" />
				<StatsCard title="Doctores" value={stats.doctors} color="success" icon={<FaUsers size={18} />} variant="compact" />
				<StatsCard title="Monto USD" value={money(stats.total)} color="primary" icon={<FaCalendarDays size={18} />} variant="compact" />
				<StatsCard title="Monto Bs" value={money(stats.totalBs, 'VES')} valueClassName="text-lg xl:text-xl leading-tight break-words whitespace-normal" color="primary" icon={<FaCalendarDays size={18} />} variant="compact" />
			</div>

			{/* <div className="rounded-2xl border border-primary-200 bg-white p-4">
				<div className="flex items-center justify-between gap-3 flex-wrap">
					<div>
						<h2 className="text-lg font-semibold text-primary-900">Payroll - {format(today, 'MMMM yyyy', { locale: es })}</h2>
						<p className="text-sm text-cool-gray-60">Nómina en tiempo real para el mes actual.</p>
					</div>
					<div>
						{payroll ? (
							canPayPayroll() ? (
								<Button variant="primary" label="Marcar nómina como pagada" onClick={async () => {
									if (!canClosePayroll) {
										await Alert.info('Nómina pendiente', 'Primero paga todos los usuarios pendientes antes de cerrar la nómina.');
										return;
									}
									await updatePayroll(payroll.id, { status: 'Paid' });
									await mutate();
									await Alert.success('Nómina cerrada', 'La nómina del mes actual quedó marcada como pagada.');
								}} />
							) : (
								<div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">Solo habilitado el último día del mes.</div>
							)
						) : (
							<div className="text-sm text-cool-gray-60">No hay nómina para el periodo actual.</div>
						)}
					</div>
				</div>

				<div className="mt-4 space-y-3">
					{payroll ? (
						payroll.payrollLines.map((line) => (
							<div key={line.id} className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm">
								<div className="flex items-center justify-between gap-3">
									<div className="min-w-0">
										<p className="font-semibold text-primary-900">{line.consultation.doctor.user.name}</p>
										<p className="text-sm text-cool-gray-60">{line.consultation.doctor.specialty.name} · CI {line.consultation.doctor.user.ci}</p>
										<p className="text-xs text-cool-gray-50">Consulta #{line.consultation.id} · Factura #{line.consultation.invoiceId}</p>
									</div>
									<div className="text-right">
										<p className="text-lg font-semibold text-primary-900">{money(payrollLineAmount(line))}</p>
										<p className="text-xs text-cool-gray-50">Base {money(Number(line.base_amount))} · Comisión {Number(line.commission_percentage)}%</p>
									</div>
								</div>
							</div>
						))
					) : (
						<div className="text-sm text-cool-gray-60">No hay enlaces de nómina por el momento.</div>
					)}
				</div>
			</div> */}

			<div className="rounded-2xl border border-primary-200 bg-white p-4">
				<div className="flex items-center justify-between gap-3 flex-wrap">
					<div>
						<h2 className="text-lg font-semibold text-primary-900">Pagos pendientes</h2>
						<p className="text-sm text-cool-gray-60">Se muestran médicos y usuarios con salario fijo, con su desglose antes de confirmar.</p>
					</div>
					<div className="text-sm text-cool-gray-60">
						{pendingLoading ? 'Cargando...' : `${pendingData?.totalUsers ?? 0} usuarios · ${money(pendingData?.totalAmount ?? 0)} / Bs. ${money(dualAmount(pendingData?.totalAmount ?? 0, 'USD', usdToBsRate).ves, 'VES')}`}
					</div>
				</div>

				<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
					{canPayPayroll() ?
						<p className="text-sm text-cool-gray-60">Revisa el detalle antes de pagar de forma secuencial.</p>
					: (
						<div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
							Solo se puede pagar el último día del mes.
						</div>
					)}
					<Button
						variant="primary"
						label="Pagar todas"
						disabled={!canPayPayroll() || (pendingData?.items.length ?? 0) === 0 || payingAll}
						onClick={openPayAll}
					/>
				</div>

				<div className="mt-4 space-y-3">
					{(pendingData?.items ?? []).length === 0 ? (
						<div className="rounded-xl border border-dashed border-primary-200 p-4 text-sm text-cool-gray-60">No hay pagos pendientes.</div>
					) : (
						pendingData!.items.map((item) => (
							<div key={item.userId} className="rounded-2xl border border-primary-100 bg-primary-50 p-4">
								<div className="flex items-start justify-between gap-3 flex-wrap">
									<div>
										<p className="font-semibold text-primary-900">{item.userName}</p>
										<p className="text-sm text-cool-gray-60">{item.roleName} · CI {item.ci}</p>
										<p className="text-xs text-cool-gray-50">{item.type === 'DOCTOR' ? `${item.breakdown.length} líneas pendientes` : 'Pago fijo de salario'}</p>
									</div>
							<div className="text-right">
								<p className="text-lg font-semibold text-primary-900">{money(item.amount)}</p>
							<p className="text-xs text-cool-gray-50 break-words whitespace-normal">Bs. {money(dualAmount(item.amount, 'USD', usdToBsRate).ves, 'VES')}</p>
								<Button
											variant="primary"
											size="sm"
											label="Pagar"
											disabled={!canPayPayroll()}
											onClick={() => openPayment(item)}
										/>
									</div>
								</div>

								<div className="mt-4 space-y-2">
									{item.breakdown.map((line) => (
										<div key={`${item.userId}-${line.type}-${line.payrollLineId ?? line.label}`} className="rounded-xl border border-white bg-white px-4 py-3 text-sm text-cool-gray-70">
											<div className="flex items-start justify-between gap-3">
								<div>
									<p className="font-medium text-primary-900">{breakdownLabel(line)}</p>
									{line.type === 'PAYROLL_LINE' ? (
										<p className="text-xs text-cool-gray-50">Base {money(line.baseAmount ?? 0)} · Comisión {line.commissionPercentage ?? 0}%</p>
									) : null}
								</div>
								<div className="text-right">
									<p className="font-semibold text-primary-900">{money(line.amount)}</p>
								<p className="text-[11px] text-cool-gray-50 break-words whitespace-normal">Bs. {money(dualAmount(line.amount, 'USD', usdToBsRate).ves, 'VES')}</p>
								</div>
							</div>
										</div>
									))}
								</div>
							</div>
						))
					)}
				</div>
			</div>

			<Modal isOpen={confirmOpen} onClose={closePayment} title="Confirmar pago">
				{selected ? (
					<div className="space-y-4">
						<div>
							<p className="text-sm text-cool-gray-60">Usuario</p>
							<p className="text-base font-semibold text-primary-900">{selected.userName}</p>
						</div>

						<div className="rounded-xl border border-primary-100 bg-primary-50 p-4 space-y-2">
							{selected.breakdown.map((line) => (
								<div key={`${selected.userId}-${line.type}-${line.payrollLineId ?? line.label}`} className="flex items-start justify-between gap-3 text-sm">
									<div>
										<p className="font-medium text-primary-900">{breakdownLabel(line)}</p>
										{line.type === 'PAYROLL_LINE' ? (
											<p className="text-xs text-cool-gray-50">Base {money(line.baseAmount ?? 0)} · Comisión {line.commissionPercentage ?? 0}%</p>
										) : null}
									</div>
									<p className="font-semibold text-primary-900">{money(line.amount)}</p>
								</div>
							))}
						<div className="border-t border-primary-200 pt-2 flex items-center justify-between">
							<p className="text-sm font-semibold text-primary-900">Total</p>
							<div className="text-right">
								<p className="text-lg font-semibold text-primary-900">{money(selected.amount)}</p>
								<p className="text-xs text-cool-gray-50 break-words whitespace-normal">Bs. {money(dualAmount(selected.amount, 'USD', usdToBsRate).ves, 'VES')}</p>
							</div>
						</div>
						</div>

					<div className="flex justify-end gap-2 pt-2">
						<Button variant="ghost" label="Cancelar" onClick={closePayment} />
						<Button variant="primary" label="Confirmar pago" loading={paying === selected.userId} disabled={!canPayPayroll()} onClick={handlePay} />
					</div>
					</div>
				) : null}
			</Modal>

			<Modal isOpen={payAllOpen} onClose={closePayAll} title="Confirmar pago masivo">
				<div className="space-y-4">
						<div className="rounded-xl border border-primary-100 bg-primary-50 p-4">
							<p className="text-sm text-cool-gray-60">Usuarios a pagar</p>
							<p className="text-lg font-semibold text-primary-900">{pendingData?.items.length ?? 0} pendientes · {money(pendingData?.totalAmount ?? 0)} / Bs. {money(dualAmount(pendingData?.totalAmount ?? 0, 'USD', usdToBsRate).ves, 'VES')}</p>
						</div>

					<div className="max-h-85 space-y-2 overflow-y-auto rounded-xl border border-primary-100 p-3">
						{(pendingData?.items ?? []).map((item) => (
							<div key={`pay-all-${item.userId}`} className="rounded-lg border border-primary-100 bg-white p-3 text-sm">
								<div className="flex items-center justify-between gap-3">
									<div>
										<p className="font-semibold text-primary-900">{item.userName}</p>
										<p className="text-cool-gray-60">{item.roleName} · CI {item.ci}</p>
									</div>
									<div className="text-right">
										<p className="font-semibold text-primary-900">{money(item.amount)}</p>
										<p className="text-xs text-cool-gray-50">{item.breakdown.length} conceptos</p>
									</div>
								</div>
								<div className="mt-2 space-y-1">
									{item.breakdown.map((line) => (
										<div key={`pay-all-${item.userId}-${line.type}-${line.payrollLineId ?? line.label}`} className="flex items-center justify-between gap-3 text-xs text-cool-gray-70">
											<p>{breakdownLabel(line)}</p>
											<p className="font-medium text-primary-900">{money(line.amount)}</p>
										</div>
									))}
								</div>
							</div>
						))}
					</div>

					{payingAll ? (
						<div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
							<p className="font-semibold">Procesando: {payAllProgress.current ?? '...'} </p>
							<p>Pagados: {payAllProgress.paid.length} · Fallidos: {payAllProgress.failed.length}</p>
						</div>
					) : null}

					{payAllProgress.paid.length > 0 || payAllProgress.failed.length > 0 ? (
						<div className="space-y-3 rounded-xl border border-primary-100 bg-white p-4">
							<div>
								<p className="text-sm font-semibold text-primary-900">Resultado parcial</p>
								<p className="text-xs text-cool-gray-60">Se ejecuta de forma secuencial y continúa aunque falle un usuario.</p>
							</div>
							{payAllProgress.paid.length > 0 ? <p className="text-sm text-emerald-700">Pagados: {payAllProgress.paid.join(', ')}</p> : null}
							{payAllProgress.failed.length > 0 ? (
								<div className="space-y-1 text-sm text-red-700">
									<p className="font-semibold">Fallidos</p>
									{payAllProgress.failed.map((item) => (
										<p key={`failed-${item.name}`}>{item.name}: {item.error}</p>
									))}
								</div>
							) : null}
						</div>
					) : null}

					<div className="flex justify-end gap-2 pt-2">
						<Button variant="ghost" label="Cancelar" onClick={closePayAll} disabled={payingAll} />
						<Button variant="primary" label={payingAll ? 'Procesando...' : 'Confirmar pagos'} loading={payingAll} disabled={!canPayPayroll() || (pendingData?.items.length ?? 0) === 0 || payingAll} onClick={handlePayAll} />
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default CurrentMonthPayroll;
