import React, { useState, useEffect } from "react";
import { FaCircleInfo, FaSpinner } from "react-icons/fa6";
import { api } from "@/lib/api"; // Asumiendo que tienes este helper configurado

interface AppointmentFormProps {
    patientId: string;
}

export default function AppointmentForm({ patientId }: AppointmentFormProps) {
    // Estados para los selects
    const [specialties, setSpecialties] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);

    // Estado del formulario
    const [selectedSpecialty, setSelectedSpecialty] = useState("");
    const [formData, setFormData] = useState({
        doctorId: "",
        date: "",
        time: "",
        reason: "",
    });

    // Estados de la UI
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // 1. Cargar especialidades al montar el componente
    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                // Asumiendo que crearás este endpoint en tu backend
                // const res = await api('/medical/specialties');
                // const json = await res.json();
                // setSpecialties(json.data);

                // MOCK TEMPORAL mientras haces el endpoint:
                setSpecialties([
                    { id: 1, name: "Cardiología" },
                    { id: 2, name: "Medicina General" },
                    { id: 3, name: "Odontología" }
                ]);
            } catch (error) {
                console.error("Error cargando especialidades:", error);
            }
        };
        fetchSpecialties();
    }, []);

    // 2. Cargar doctores cuando cambia la especialidad
    useEffect(() => {
        if (!selectedSpecialty) {
            setDoctors([]);
            setFormData(prev => ({ ...prev, doctorId: "" }));
            return;
        }

        const fetchDoctors = async () => {
            try {
                // Endpoint real: await api(`/medical/doctors?specialtyId=${selectedSpecialty}`);

                // MOCK TEMPORAL:
                if (selectedSpecialty === "1") {
                    setDoctors([{ id: 1, user: { name: "Dr. Juan Sun" } }]);
                } else if (selectedSpecialty === "2") {
                    setDoctors([{ id: 2, user: { name: "Dra. Samuel Rosales" } }]);
                } else {
                    setDoctors([]);
                }
            } catch (error) {
                console.error("Error cargando doctores:", error);
            }
        };
        fetchDoctors();
    }, [selectedSpecialty]);

    // 3. Manejar cambios en los inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 4. Enviar datos al Backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: "", text: "" });

        // Fusión de fecha y hora para el DateTime de Prisma
        const dateTimeString = `${formData.date}T${formData.time}:00`;

        // Armamos el Payload EXACTO que espera tu schema.prisma
        const payload = {
            patientId: Number(patientId),
            doctorId: Number(formData.doctorId),
            date_time: new Date(dateTimeString).toISOString(),
            reson_visit: formData.reason, // ¡Manteniendo tu typo del schema!
            statusId: 1, // Asumiendo que 1 es 'Pendiente' en StatusAppointment
            typeId: 1,   // Asumiendo que 1 es consulta regular en AppointmentType
            // Nota: El 'price' debería calcularlo el backend basado en la especialidad,
            // pero si el backend te lo exige aquí, agrégalo: price: 0
        };

        try {
            // Llamada real a tu AppointmentController (create)
            /*
            const response = await api('/appointment', {
              method: 'POST',
              body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            */

            // Simulamos la respuesta exitosa por 1 segundo
            await new Promise(resolve => setTimeout(resolve, 1000));

            setMessage({ type: "success", text: "¡Cita agendada con éxito!" });
            setFormData({ doctorId: "", date: "", time: "", reason: "" });
            setSelectedSpecialty("");

        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Error al agendar la cita." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {message.text && (
                <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">Seleccione...</option>
                    {specialties.map(spec => (
                        <option key={spec.id} value={spec.id}>{spec.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    required
                    disabled={!selectedSpecialty || doctors.length === 0}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                >
                    <option value="">{selectedSpecialty ? "Seleccione un doctor..." : "Primero elija especialidad"}</option>
                    {doctors.map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.user.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                    <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (Opcional)</label>
                <textarea
                    rows={2}
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
                    placeholder="Ej: Chequeo de rutina..."
                ></textarea>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 flex justify-center items-center gap-2 disabled:opacity-70"
            >
                {isLoading ? <FaSpinner className="animate-spin" /> : "Verificar y Agendar"}
            </button>

            <p className="text-xs text-gray-400 text-center mt-2">
                <FaCircleInfo className="inline-block" /> El sistema validará la disponibilidad del doctor.
            </p>
        </form>
    );
}