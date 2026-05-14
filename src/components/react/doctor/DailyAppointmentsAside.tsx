import React, { useState, useMemo } from 'react';
import { FaUserInjured, FaChevronRight, FaCalendarDays, FaStethoscope, FaFileLines } from "react-icons/fa6";
import StaticCard from "@/components/react/primary/StaticCard";
import { Modal } from "../primary/Modal";
import { Button } from "../primary/Button";
import { StatsCard } from "../primary/StatsCard";
import { startConsultation } from "@/lib/services/medical/consultation/consultation.service";
import { Alert } from "@/utils/alerts";

interface Appointment {
    id: number;
    patientName: string;
    id_paciente: string;
    hora: string;
    timestamp: number;
    motivo: string;
    estado: 'programada' | 'en_progreso' | 'completada' | 'cancelada';
    fecha: string;
    doctor: string;
    notes: string;
    rawStatus: string;
}

export const DailyAppointmentsAside: React.FC<{ citas: Appointment[]; doctorId?: string }> = ({ citas, doctorId = "default" }) => {
    const doctorIdNum = Number(doctorId);
    const [activeTab, setActiveTab] = useState<'pendientes' | 'completadas'>('pendientes');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    const citasFiltradas = useMemo(() => {
        if (activeTab === 'pendientes') {
            return citas.filter(c => c.estado === 'programada' || c.estado === 'en_progreso');
        }
        return citas.filter(c => c.estado === 'completada');
    }, [citas, activeTab]);

    const handleStartConsultation = async () => {
        if (!selectedAppointment || isStarting) return;
        setIsStarting(true);
        try {
            if (selectedAppointment.estado !== 'en_progreso') {
                await startConsultation(selectedAppointment.id);
            }
            window.location.replace(`/modules/doctor/${doctorIdNum}/consultation/${selectedAppointment.id}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            Alert.error("No se pudo iniciar la consulta", message);
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <StaticCard className="h-full">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary-50 rounded-full blur-2xl -z-10 transform -translate-x-1/2 -translate-y-1/2"></div>
            
            <h3 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2">
                <div className="bg-primary-100 p-2 rounded-lg text-primary-600">
                    <FaUserInjured />
                </div>
                Consultas del Día
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
                            {cita.estado === 'en_progreso' ? (
                                <span className="text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-100/60 px-3 py-1.5 rounded-full">Continuar consulta</span>
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                                    <FaChevronRight className="text-slate-400 w-3 h-3 group-hover:text-primary-600 transition-colors" />
                                </div>
                            )}
                        </button>
                    ))
                )}
            </div>

            {/* Renderizado del Modal */}
            <Modal
                isOpen={!!selectedAppointment}
                onClose={() => setSelectedAppointment(null)}
                title="Detalle de la Consulta"
            >
                {selectedAppointment && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center text-primary-700 shrink-0 flex items-center justify-center">
                                <FaUserInjured size={24} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Paciente</p>
                                <h4 className="text-xl font-black text-slate-800 leading-tight mb-1 truncate">{selectedAppointment.patientName}</h4>
                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                    selectedAppointment.estado === 'en_progreso' ? 'text-blue-600 bg-blue-50' : 'text-amber-500 bg-amber-50'
                                }`}>
                                    {selectedAppointment.estado === 'en_progreso' ? 'En progreso' : 'Pendiente'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <StatsCard
                                variant="compact"
                                title="FECHA Y HORA"
                                value={selectedAppointment.fecha}
                                subText={selectedAppointment.hora}
                                subTextClass="text-slate-500 font-medium"
                                icon={<FaCalendarDays size={20} />}
                                color="primary"
                            />
                            <StatsCard
                                variant="compact"
                                title="MÉDICO"
                                value={selectedAppointment.doctor}
                                icon={<FaStethoscope size={20} />}
                                color="primary"
                            />
                        </div>

                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <FaFileLines size={12}/> Motivo de Consulta
                            </p>
                            <p className="text-sm font-bold text-slate-800 mb-4">{selectedAppointment.motivo}</p>

                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notas Previas</p>
                            <p className="text-xs text-slate-600 leading-relaxed italic">
                                "{selectedAppointment.notes}"
                            </p>
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                            <Button
                                label={selectedAppointment.estado === 'completada' ? 'Consulta finalizada' : selectedAppointment.estado === 'en_progreso' ? 'Continuar consulta' : 'Iniciar consulta'}
                                variant="primary"
                                loading={isStarting}
                                disabled={selectedAppointment.estado === 'completada'}
                                onClick={handleStartConsultation}
                            />
                            <Button
                                label="Cerrar"
                                variant="secondary"
                                onClick={() => setSelectedAppointment(null)}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </StaticCard>
    );
};
