import { useMemo, useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StatsCard } from "@/components/react/primary/StatsCard";
import { Button } from "@/components/react/primary/Button";
import { listPayrolls, updatePayroll } from "@/lib/services/finance/payroll/payroll.service";
import type { PayrollRecord } from "@/lib/services/finance/payroll/payroll.interface";
import { FaCircleCheck, FaClock, FaUsers, FaCalendarDays } from "react-icons/fa6";

const money = (value: number, currency = "USD") =>
    new Intl.NumberFormat("es-VE", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

const sameCalendarDay = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();

const isLastDayOfMonth = (date: Date) => {
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return (
        date.getFullYear() === lastDay.getFullYear() && date.getMonth() === lastDay.getMonth() && date.getDate() === lastDay.getDate()
    );
};

const payrollLineAmount = (line: PayrollRecord["payrollLines"][number]) =>
    Number(line.base_amount || 0) * (Number(line.commission_percentage || 0) / 100);

export const CurrentMonthPayroll = () => {
    const { data, error, isLoading, mutate } = useSWR<PayrollRecord[]>("payroll-current", listPayrolls, { refreshInterval: 5000 });
    const [paying, setPaying] = useState(false);

    const today = new Date();

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

        return { consultations, doctors, total };
    }, [payroll]);

    const canPay = () => {
        if (!payroll) return false;
        if ((payroll.status || "").trim().toUpperCase() !== "PENDING") return false;
        const periodEnd = new Date(payroll.period_end);
        return isLastDayOfMonth(new Date()) && sameCalendarDay(new Date(), periodEnd);
    };

    const handlePay = async () => {
        if (!payroll) return;
        if (!canPay()) return;
        setPaying(true);
        try {
            await updatePayroll(payroll.id, { status: "Paid" });
            await mutate();
        } finally {
            setPaying(false);
        }
    };

    if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Error cargando la nómina del mes actual.</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard title="Consultas acumuladas" value={stats.consultations} color="primary" icon={<FaUsers size={18} />} variant="compact" />
                <StatsCard title="Doctores" value={stats.doctors} color="success" icon={<FaUsers size={18} />} variant="compact" />
                <StatsCard title="Monto estimado" value={money(stats.total)} color="primary" icon={<FaCalendarDays size={18} />} variant="compact" />
            </div>

            <div className="rounded-2xl border border-primary-200 bg-white p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-primary-900">Payroll — {format(today, "MMMM yyyy", { locale: es })}</h2>
                        <p className="text-sm text-cool-gray-60">Nómina en tiempo real para el mes actual. Se actualizará automáticamente.</p>
                    </div>
                    <div>
                        {payroll ? (
                            canPay() ? (
                                <Button variant="primary" label="Pagar nómina" onClick={handlePay} loading={paying} />
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
                                <div className="flex items-center justify-between">
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
            </div>
        </div>
    );
};

export default CurrentMonthPayroll;
