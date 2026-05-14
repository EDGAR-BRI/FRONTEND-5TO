import { usePatientConsultations } from "@/hooks/react/doctor/usePatientConsultations";
import { PatientList } from "./PatientList";

export default function PatientAgenda({ doctorId }: { doctorId: string | number }) {
	const { patients, isLoading, error } = usePatientConsultations(doctorId);

	if (isLoading) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
					<div className="relative w-full sm:w-96">
						<div className="w-full h-10 bg-slate-100 rounded-lg animate-pulse" />
					</div>
				</div>
				<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
					<div className="text-sm text-slate-500 text-center py-8">Cargando pacientes...</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col gap-6">
				<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
					<div className="text-sm text-rose-600 text-center py-8">{error}</div>
				</div>
			</div>
		);
	}

	return (
		<PatientList
			patients={patients}
			doctorId={doctorId}
			title="Pacientes"
			emptyMessage="No hay pacientes con consultas registradas."
		/>
	);
}
