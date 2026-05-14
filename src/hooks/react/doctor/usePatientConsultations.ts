import { useEffect, useState, useMemo } from "react";
import { listConsultationsByDoctor } from "@/lib/services/medical/consultation/consultation.service";
import type { ConsultationSummary } from "@/lib/services/medical/consultation/consultation.interface";

export interface PatientWithConsultations {
	id: number;
	name: string;
	lastVisit: string | null;
	consultationCount: number;
	consultations: ConsultationSummary[];
}

interface UsePatientConsultationsReturn {
	patients: PatientWithConsultations[];
	isLoading: boolean;
	error: string | null;
}

export function usePatientConsultations(
	doctorId: string | number
): UsePatientConsultationsReturn {
	const [consultations, setConsultations] = useState<ConsultationSummary[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const doctorIdNum = Number(doctorId);
		if (!Number.isFinite(doctorIdNum) || doctorIdNum <= 0) {
			setError("doctorId inválido");
			setIsLoading(false);
			return;
		}

		let cancelled = false;
		setIsLoading(true);
		setError(null);

		listConsultationsByDoctor(doctorIdNum)
			.then((data) => {
				if (cancelled) return;
				setConsultations(data);
			})
			.catch((e) => {
				if (cancelled) return;
				setError(e instanceof Error ? e.message : "Error cargando consultas");
			})
			.finally(() => {
				if (cancelled) return;
				setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [doctorId]);

	const patients = useMemo(() => {
		const grouped = new Map<number, PatientWithConsultations>();

		for (const c of consultations) {
			const patient = c.invoice?.patient;
			if (!patient) continue;

			const patientId = patient.id;
			const patientName =
				patient.user?.name ?? patient.name ?? "Paciente";

			if (!grouped.has(patientId)) {
				const dateSource = c.started_at ?? c.date;
				const lastVisit = dateSource
					? new Date(dateSource).toLocaleDateString("es-VE", {
							day: "2-digit",
							month: "short",
							year: "numeric",
						})
					: null;

				grouped.set(patientId, {
					id: patientId,
					name: patientName,
					lastVisit,
					consultationCount: 0,
					consultations: [],
				});
			}

			const p = grouped.get(patientId)!;
			p.consultations.push(c);
			p.consultationCount = p.consultations.length;
		}

		return Array.from(grouped.values()).sort((a, b) => {
			if (!a.lastVisit && !b.lastVisit) return 0;
			if (!a.lastVisit) return 1;
			if (!b.lastVisit) return -1;
			return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
		});
	}, [consultations]);

	return { patients, isLoading, error };
}
