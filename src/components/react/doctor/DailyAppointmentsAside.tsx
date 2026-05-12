import React, { useState, useMemo } from 'react';
import { FaUserInjured, FaChevronRight } from "react-icons/fa6";
import { StartConsultationModal } from './StartConsultationModal';
import StaticCard from "@/components/react/primary/StaticCard";
import { startConsultation } from "@/lib/services/medical/consultation/consultation.service";
import { Alert } from "@/utils/alerts";

interface Appointment {
    id: number;
    patientName: string;
    id_paciente: string;
    hora: string;
    motivo: string;
    estado: 'programada' | 'completada' | 'cancelada';
}

export const DailyAppointmentsAside: React.FC<{ citas: Appointment[]; doctorId?: string }> = ({ citas, doctorId = "default" }) => {
    // Estados para las pestañas y el modal
    const [activeTab, setActiveTab] = useState<'pendientes' | 'completadas'>('pendientes');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Memorizamos el filtrado para no recalcular en cada renderizado
    const citasFiltradas = useMemo(() => {
        if (activeTab === 'pendientes') {
            return citas.filter(c => c.estado === 'programada');
        }
        return citas.filter(c => c.estado === 'completada');
    }, [citas, activeTab]);

    // Función principal para la redirección después de capturar la factura
    const handleStartConsultation = async () => {
        if (!selectedAppointment) return;

        try {
            await startConsultation(selectedAppointment.id);
            const consultationUrl = `/modules/doctor/${doctorId}/consultation/${selectedAppointment.id}`;
            window.location.href = consultationUrl;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            Alert.error("No se pudo iniciar la consulta", message);
        }
    };

    return (
        <StaticCard className="h-full">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary-50 rounded-full blur-2xl -z-10 transform -translate-x-1/2 -translate-y-1/2"></div>
            
            <h3 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2">
                <div className="bg-primary-100 p-2 rounded-lg text-primary-600">
                    <FaUserInjured />
                </div>
                Pacientes del Día
            </h3>

            {/* Sistema de Pestañas */}
            <div className="flex bg-slate-100/80 p-1 rounded-xl mb-5 shadow-inner">
                <button 
                    onClick={() => setActiveTab('pendientes')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === 'pendientes' ? 'bg-white shadow-sm text-primary-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    Pendientes
                </button>
                <button 
                    onClick={() => setActiveTab('completadas')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === 'completadas' ? 'bg-white shadow-sm text-primary-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    Completadas
                </button>
            </div>

            {/* Lista de Citas */}
            <div className="space-y-3 overflow-y-auto max-h-[28rem] pr-2 custom-scrollbar">
                {citasFiltradas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                            <FaUserInjured className="text-2xl text-slate-300" />
                        </div>
                        <p className="text-sm font-medium">No hay consultas {activeTab}.</p>
                    </div>
                ) : (
                    citasFiltradas.map((cita) => (
                        <button 
                            key={cita.id}
                            onClick={() => setSelectedAppointment(cita)}
                            className="w-full text-left bg-white border border-slate-100 hover:border-primary-200 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-0.5 p-4 rounded-xl flex items-center justify-between group transition-all duration-300"
                        >
                            <div className="flex flex-col gap-1.5">
                                <span className="text-sm font-bold text-slate-800 group-hover:text-primary-700 transition-colors">{cita.patientName}</span>
                                <div className="flex items-center gap-2 text-xs font-medium">
                                    <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded-md border border-primary-100/50">
                                        {cita.hora}
                                    </span>
                                    <span className="text-slate-500 truncate max-w-[140px]">{cita.motivo}</span>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                                <FaChevronRight className="text-slate-400 w-3 h-3 group-hover:text-primary-600 transition-colors" />
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* Renderizado del Modal */}
            <StartConsultationModal 
                isOpen={!!selectedAppointment}
                appointment={selectedAppointment}
                onClose={() => setSelectedAppointment(null)}
                onStart={handleStartConsultation}
            />
        </StaticCard>
    );
};
