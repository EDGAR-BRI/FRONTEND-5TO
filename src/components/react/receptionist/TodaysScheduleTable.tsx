import { useEffect, useMemo, useState } from "react";
import { getScheduleOverview } from "@/lib/services/scheduling/appointment/appointment.service";
import type { AppointmentsOverview } from "@/lib/services/scheduling/appointment/appointment.interface";
import { ToggleAgendaRows } from "@/components/react/receptionist/ToggleAgendaRows";

function formatTime(isoString: string): string {
    return isoString.slice(11, 16);
}

function getStatusClass(status: string) {
    switch (status.toUpperCase()) {
        case "REALIZADA":
            return "bg-green-100 text-success border-green-200";
        case "CONFIRMADA":
            return "bg-yellow-100 text-warning border-yellow-200";
        case "SIN CONFIRMAR":
        case "CANCELADA":
            return "bg-cool-gray-10 text-cool-gray-60 border-cool-gray-30";
        default:
            return "bg-cool-gray-10 text-cool-gray-60 border-cool-gray-30";
    }
}

export default function TodaysScheduleTable() {
    const [agenda, setAgenda] = useState<AppointmentsOverview[] | null>(null);

    useEffect(() => {
        let active = true;

        (async () => {
            try {
                const data = await getScheduleOverview({ range: "hoy" });
                if (active) setAgenda(data);
            } catch {
                if (active) setAgenda([]);
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    const sortedAgenda = useMemo(() => {
        if (!agenda) return [];
        return [...agenda].sort(
            (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
        );
    }, [agenda]);

    const isLoading = agenda === null;

    return (
        <div className="overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-heading-6 text-primary-800">Agenda de hoy</h2>
                <a
                    href="schedules"
                    className="text-body-xs font-medium text-primary-600 hover:underline"
                >
                    Ver todo
                </a>
            </div>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-body-xs text-cool-gray-50 border-b border-primary-100">
                        <th className="py-2 px-2 text-left font-medium">Hora</th>
                        <th className="py-2 px-2 text-left font-medium">Paciente</th>
                        <th className="py-2 px-2 text-left font-medium">Especialidad</th>
                        <th className="py-2 px-2 text-right font-medium">Estado</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                    {!isLoading && sortedAgenda.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center py-4">
                                <p className="text-body-s text-cool-gray-50">
                                    No se han registrado citas hoy.
                                </p>
                            </td>
                        </tr>
                    ) : (
                        sortedAgenda.map((item, index) => (
                            <tr
                                key={`${item.date_time}-${index}`}
                                className={`text-body-s hover:bg-primary-50/50 transition-colors agenda-row${index >= 7 ? " hidden" : ""}`}
                                data-index={index}
                            >
                                <td className="py-3 px-2 font-medium text-primary-700">
                                    {formatTime(item.date_time)}
                                </td>
                                <td className="py-3 px-2 text-primary-800">
                                    {item.patient.name ?? item.patient.user?.name ?? "No registrado"}
                                </td>
                                <td className="py-3 px-2 text-cool-gray-60">
                                    {item.doctor.specialty.name}
                                </td>
                                <td className="py-3 px-2 text-right">
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusClass(item.status.name)}`}
                                    >
                                        {item.status.name.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <ToggleAgendaRows total={sortedAgenda.length} />
        </div>
    );
}
