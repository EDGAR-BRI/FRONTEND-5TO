import { useState, useEffect, useMemo } from "react";
import { FaStethoscope, FaMoneyBillWave, FaPercent, FaUserDoctor } from "react-icons/fa6";
import { StatsCard } from "@/components/react/primary/StatsCard";
import { Field } from "@/components/react/primary/Field";
import SpecialtyTable, { type SpecialtyWithDoctorCount } from "./SpecialtyTable";
import CreateSpecialtyModalTrigger from "./CreateSpecialtyModalTrigger";
import { listMedicalSpecialties, deleteMedicalSpecialty, type MedicalSpecialtyDto } from "@/lib/services/medical/specialty/medicalSpecialty.service";
import { getDrsSelect } from "@/lib/services/medical/doctor/doctor.service";
import { Alert } from "@/utils/alerts";

const money = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
};

export default function SpecialtyDashboard() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [items, setItems] = useState<SpecialtyWithDoctorCount[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const reloadSpecialties = async () => {
        setIsLoading(true);
        try {
            const [specialties, doctors] = await Promise.all([
                listMedicalSpecialties(),
                getDrsSelect(),
            ]);

            const doctorCountBySpecialty: Record<number, number> = {};
            for (const doctor of doctors) {
                const specId = (doctor as any).specialtyId;
                if (specId) {
                    doctorCountBySpecialty[specId] = (doctorCountBySpecialty[specId] || 0) + 1;
                }
            }

            const enriched: SpecialtyWithDoctorCount[] = specialties.map((s: MedicalSpecialtyDto) => ({
                ...s,
                doctorCount: doctorCountBySpecialty[s.id] || 0,
            }));

            setItems(enriched);
        } catch {
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void reloadSpecialties();
    }, []);

    const filtered = items.filter((item) => {
        return debouncedSearch.trim().length === 0
            ? true
            : item.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    });

    const handleDelete = async (id: number) => {
        try {
            await deleteMedicalSpecialty(id);
            await Alert.success("Desactivado", "Especialidad desactivada correctamente");
            await reloadSpecialties();
        } catch (err) {
            await Alert.error("Error", err instanceof Error ? err.message : "No se pudo desactivar la especialidad");
        }
    };

    const stats = useMemo(() => {
        const activeSpecialties = items.filter((i) => i.active);
        const totalDoctors = items.reduce((sum, i) => sum + (i.doctorCount || 0), 0);

        const avgPrice = activeSpecialties.length > 0
            ? activeSpecialties.reduce((sum, i) => sum + parseFloat(i.consultation_price), 0) / activeSpecialties.length
            : 0;

        const avgCommission = activeSpecialties.length > 0
            ? activeSpecialties.reduce((sum, i) => sum + parseFloat(i.commission_percentage), 0) / activeSpecialties.length
            : 0;

        return {
            totalCount: items.length,
            activeCount: activeSpecialties.length,
            avgPrice,
            avgCommission,
            totalDoctors,
        };
    }, [items]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Especialidades"
                    value={stats.totalCount}
                    color="primary"
                    icon={<FaStethoscope size={18} />}
                    variant="compact"
                />
                <StatsCard
                    title="Precio promedio"
                    value={money(stats.avgPrice)}
                    color="success"
                    icon={<FaMoneyBillWave size={18} />}
                    variant="compact"
                />
                <StatsCard
                    title="Comisión promedio"
                    value={`${stats.avgCommission.toFixed(1)}%`}
                    color="warning"
                    icon={<FaPercent size={18} />}
                    variant="compact"
                />
                <StatsCard
                    title="Doctores asignados"
                    value={stats.totalDoctors}
                    color="primary"
                    icon={<FaUserDoctor size={18} />}
                    variant="compact"
                />
            </div>

            <section className="bg-primary-700 rounded-lg border border-primary-400 overflow-hidden shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                            <FaStethoscope size={18} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-white leading-tight">
                                Gestión de Honorarios Médicos
                            </h2>
                            <p className="text-xs text-primary-200 mt-0.5">
                                Especialidades médicas, precios de consulta y porcentajes de comisión.
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <CreateSpecialtyModalTrigger onCreated={reloadSpecialties} />
                    </div>
                </div>

                <div className="px-6 py-3 flex flex-wrap gap-3 items-center bg-white/5 border-b border-primary-400/30">
                    <div className="relative flex-1 min-w-50 max-w-sm">
                        <Field
                            name="search"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="outline-none! ring-0! border-transparent! focus:outline-none! focus:ring-0! focus:border-transparent!"
                        />
                    </div>
                </div>

                <SpecialtyTable
                    items={filtered}
                    isLoading={isLoading}
                    onDeleted={handleDelete}
                    onUpdated={reloadSpecialties}
                />
            </section>
        </div>
    );
}