import React, { useState, useEffect, useRef } from "react";
import {
	FaHeartPulse,
	FaLungs,
	FaThermometer,
	FaWeightScale,
	FaRulerVertical,
	FaPlus,
	FaTrash,
	FaCheck,
	FaPills,
	FaBoxOpen,
	FaStethoscope,
	FaNotesMedical,
} from "react-icons/fa6";
import { finishConsultation } from "@/lib/services/medical/consultation/consultation.service";
import type { FinishConsultationDto } from "@/lib/services/medical/consultation/consultation.interface";
import { getSymptoms } from "@/lib/services/medical/symptoms/symptoms.service";
import type { Symptom } from "@/lib/services/medical/symptoms/symptoms.interface";
import { getDiagnoses } from "@/lib/services/medical/diagnosis/diagnosis.service";
import type { Diagnosis } from "@/lib/services/medical/diagnosis/diagnosis.interface";
import { getSupplies } from "@/lib/services/inventory/supply/supply.service";
import type { Supply } from "@/lib/services/inventory/supply/supply.interface";
import { Alert } from "@/utils/alerts";
import StaticCard from "@/components/react/primary/StaticCard";
import { SearchableSelect } from "@/components/react/primary/SearchableSelect";

interface ConsultationFormProps {
	doctorId: string;
	consultationId: string;
}

export default function ConsultationForm({
	doctorId,
	consultationId,
}: ConsultationFormProps) {
	// Keys para forzar reset de SearchableSelect después de selección
	const [symptomKey, setSymptomKey] = useState(0);
	const [diagnosisKey, setDiagnosisKey] = useState(0);
	const [supplyKey, setSupplyKey] = useState(0);
	const [medicationKey, setMedicationKey] = useState(0);

	// Examen Clínico
	const [vitals, setVitals] = useState({
		weight: "",
		height: "",
		temperature: "",
		systolic_bp: "",
		diastolic_bp: "",
		heart_rate: "",
		respiratory_rate: "",
		oxygen_saturation: "",
	});

	const vitalsRanges: Record<
		string,
		{ min: number; max: number; unit: string }
	> = {
		weight: { min: 0.1, max: 500, unit: "kg" },
		height: { min: 1, max: 270, unit: "cm" },
		temperature: { min: 30, max: 43, unit: "°C" },
		systolic_bp: { min: 40, max: 300, unit: "mmHg" },
		diastolic_bp: { min: 20, max: 200, unit: "mmHg" },
		heart_rate: { min: 20, max: 300, unit: "lpm" },
		respiratory_rate: { min: 5, max: 60, unit: "rpm" },
		oxygen_saturation: { min: 0, max: 100, unit: "%" },
	};

	const validateVital = (field: string, value: string): string | null => {
		if (value === "") return "Requerido";
		const num = parseFloat(value);
		if (isNaN(num)) return "Valor inválido";
		const range = vitalsRanges[field];
		if (num < range.min || num > range.max)
			return `Rango: ${range.min} - ${range.max} ${range.unit}`;
		return null;
	};

	const [vitalsErrors, setVitalsErrors] = useState<Record<string, string>>({});

	const weightRef = useRef<HTMLInputElement>(null);
	const heightRef = useRef<HTMLInputElement>(null);
	const tempRef = useRef<HTMLInputElement>(null);
	const satO2Ref = useRef<HTMLInputElement>(null);
	const systolicRef = useRef<HTMLInputElement>(null);
	const diastolicRef = useRef<HTMLInputElement>(null);
	const heartRateRef = useRef<HTMLInputElement>(null);
	const respRateRef = useRef<HTMLInputElement>(null);
	const vitalRefs = [
		weightRef,
		heightRef,
		tempRef,
		satO2Ref,
		systolicRef,
		diastolicRef,
		heartRateRef,
		respRateRef,
	];

	const handleVitalChange = (field: string, value: string) => {
		setVitals((prev) => ({ ...prev, [field]: value }));
		const error = validateVital(field, value);
		setVitalsErrors((prev) => {
			const next = { ...prev };
			if (error) next[field] = error;
			else delete next[field];
			return next;
		});
	};

	const handleVitalKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
		index: number,
	) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const nextRef = vitalRefs[index + 1];
			if (nextRef?.current) nextRef.current.focus();
		}
	};

	// Síntomas
	const [symptoms, setSymptoms] = useState<any[]>([]);

	// Diagnósticos
	const [diagnoses, setDiagnoses] = useState<any[]>([]);

	// Insumos Usados
	const [supplies, setSupplies] = useState<any[]>([]);

	// Recetas
	const [prescriptions, setPrescriptions] = useState<any[]>([]);

	const [isSubmitting, setIsSubmitting] = useState(false);

	// Validación de campos requeridos
	const hasVitals =
		Object.values(vitals).every((v) => v !== "") &&
		Object.keys(vitalsErrors).length === 0;
	const hasMissingSymptomDuration = symptoms.some(
		(s) => !String(s?.duration ?? "").trim(),
	);
	const isFormValid =
		hasVitals &&
		symptoms.length > 0 &&
		diagnoses.length > 0 &&
		!hasMissingSymptomDuration;

	// Listas del Backend
	const [symptomsList, setSymptomsList] = useState<Symptom[]>([]);
	const [diagnosesList, setDiagnosesList] = useState<Diagnosis[]>([]);
	const [suppliesList, setSuppliesList] = useState<Supply[]>([]);

	useEffect(() => {
		getSymptoms().then(setSymptomsList).catch(console.error);
		getDiagnoses().then(setDiagnosesList).catch(console.error);
		getSupplies().then(setSuppliesList).catch(console.error);
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const missing: string[] = [];
		if (!hasVitals)
			missing.push(
				"examen clínico (todos los signos vitales con valores válidos)",
			);
		if (symptoms.length === 0) missing.push("al menos un síntoma");
		if (diagnoses.length === 0) missing.push("al menos un diagnóstico");
		if (hasMissingSymptomDuration)
			missing.push("la duración de todos los síntomas");

		if (missing.length > 0) {
			await Alert.error(
				"Faltan datos requeridos",
				`Completa: ${missing.join(", ")}`,
			);
			return;
		}

		const confirmed = await Alert.confirm(
			"¿Finalizar consulta?",
			"Se registrará la consulta con los datos ingresados. Esta acción no se puede deshacer.",
			"Sí, finalizar",
			"Cancelar",
		);
		if (!confirmed) return;

		setIsSubmitting(true);

		try {
			const consultationIdNum = Number(consultationId);
			if (!Number.isFinite(consultationIdNum) || consultationIdNum <= 0) {
				throw new Error("ID de consulta inválido");
			}

			const hasInvalidSupplyQty = supplies.some((s) => {
				const qty = Number.parseInt(String(s?.quantity ?? ""), 10);
				return !Number.isFinite(qty) || qty <= 0;
			});
			if (hasInvalidSupplyQty) {
				throw new Error("Cantidad de insumo inválida");
			}

			const hasStockOverflow = supplies.some((s) => {
				const qty = Number.parseInt(String(s?.quantity ?? ""), 10);
				const available = Number(s?.stock ?? 0);
				return Number.isFinite(qty) && qty > available;
			});
			if (hasStockOverflow) {
				throw new Error(
					"Stock insuficiente para uno de los insumos seleccionados",
				);
			}

			const payload: FinishConsultationDto = {
				finished_at: new Date().toISOString(),
				supplies: supplies.map((s) => ({
					supplyId: Number(s.id),
					quantity: Number.parseInt(String(s.quantity), 10),
				})),
				prescriptions: prescriptions.map((p) => ({
					supplyId: p.supplyId ? Number(p.supplyId) : undefined,
					medication_name: p.medication_name?.trim()
						? p.medication_name.trim()
						: undefined,
					dosage: p.dosage?.trim() ? p.dosage.trim() : undefined,
					frequency: p.frequency?.trim() ? p.frequency.trim() : undefined,
					duration: p.duration?.trim() ? p.duration.trim() : undefined,
					instructions: p.instructions?.trim()
						? p.instructions.trim()
						: undefined,
					active: true,
				})),
				symptomsConsultas: symptoms.map((s) => ({
					symptomId: Number(s.id),
					severity: String(s.severity ?? "Leve"),
					duration: String(s.duration ?? "").trim(),
					notes: s.notes?.trim() ? s.notes.trim() : undefined,
				})),
				clinicalExaminations: [
					{
						weight: vitals.weight ? Number(vitals.weight) : undefined,
						height: vitals.height ? Number(vitals.height) : undefined,
						temperature: vitals.temperature
							? Number(vitals.temperature)
							: undefined,
						systolic_bp: vitals.systolic_bp
							? Number(vitals.systolic_bp)
							: undefined,
						diastolic_bp: vitals.diastolic_bp
							? Number(vitals.diastolic_bp)
							: undefined,
						heart_rate: vitals.heart_rate
							? Number(vitals.heart_rate)
							: undefined,
						respiratory_rate: vitals.respiratory_rate
							? Number(vitals.respiratory_rate)
							: undefined,
						oxygen_saturation: vitals.oxygen_saturation
							? Number(vitals.oxygen_saturation)
							: undefined,
					},
				],
				consultationDiagnoses: diagnoses.map((d) => ({
					diagnosisId: Number(d.id),
					is_primary: Boolean(d.is_primary),
					condition_status: d.condition_status?.trim()
						? d.condition_status.trim()
						: undefined,
					onset_date: d.onset_date
						? new Date(d.onset_date).toISOString()
						: undefined,
				})),
			};

			await finishConsultation(consultationIdNum, payload);

			await Alert.success("Consulta finalizada correctamente.");
			window.location.replace(`/modules/doctor/${doctorId}/schedule`);
		} catch (error) {
			console.error(error);
			await Alert.error(
				"Error finalizando la consulta",
				error instanceof Error ? error.message : undefined,
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
			{/* Examen Clínico */}
			<StaticCard className="!p-0 overflow-hidden col-span-2">
				<div className="bg-primary-600 px-6 py-4 border-b border-primary-200 flex items-center gap-2">
					<FaHeartPulse className="text-primary-100" />
					<h2 className="text-lg font-bold text-primary-100">
						Examen Clínico (Signos Vitales)
					</h2>
				</div>
				<div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="flex flex-col gap-1">
						<label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
							<FaWeightScale /> Peso (kg)
						</label>
						<input
							ref={weightRef}
							type="number"
							step="0.1"
							value={vitals.weight}
							onChange={(e) => handleVitalChange("weight", e.target.value)}
							onKeyDown={(e) => handleVitalKeyDown(e, 0)}
							className={`px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${vitalsErrors.weight ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-primary-500"}`}
						/>
						{vitalsErrors.weight && (
							<span className="text-xs text-red-500">
								{vitalsErrors.weight}
							</span>
						)}
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
							<FaRulerVertical /> Altura (cm)
						</label>
						<input
							ref={heightRef}
							type="number"
							step="0.1"
							value={vitals.height}
							onChange={(e) => handleVitalChange("height", e.target.value)}
							onKeyDown={(e) => handleVitalKeyDown(e, 1)}
							className={`px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${vitalsErrors.height ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-primary-500"}`}
						/>
						{vitalsErrors.height && (
							<span className="text-xs text-red-500">
								{vitalsErrors.height}
							</span>
						)}
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
							<FaThermometer /> Temp (°C)
						</label>
						<input
							ref={tempRef}
							type="number"
							step="0.1"
							value={vitals.temperature}
							onChange={(e) => handleVitalChange("temperature", e.target.value)}
							onKeyDown={(e) => handleVitalKeyDown(e, 2)}
							className={`px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${vitalsErrors.temperature ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-primary-500"}`}
						/>
						{vitalsErrors.temperature && (
							<span className="text-xs text-red-500">
								{vitalsErrors.temperature}
							</span>
						)}
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
							<FaLungs /> Sat. O2 (%)
						</label>
						<input
							ref={satO2Ref}
							type="number"
							value={vitals.oxygen_saturation}
							onChange={(e) =>
								handleVitalChange("oxygen_saturation", e.target.value)
							}
							onKeyDown={(e) => handleVitalKeyDown(e, 3)}
							className={`px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${vitalsErrors.oxygen_saturation ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-primary-500"}`}
						/>
						{vitalsErrors.oxygen_saturation && (
							<span className="text-xs text-red-500">
								{vitalsErrors.oxygen_saturation}
							</span>
						)}
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-semibold text-slate-500 uppercase">
							Presión Sistólica
						</label>
						<input
							ref={systolicRef}
							type="number"
							value={vitals.systolic_bp}
							onChange={(e) => handleVitalChange("systolic_bp", e.target.value)}
							onKeyDown={(e) => handleVitalKeyDown(e, 4)}
							className={`px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${vitalsErrors.systolic_bp ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-primary-500"}`}
							placeholder="Ej: 120"
						/>
						{vitalsErrors.systolic_bp && (
							<span className="text-xs text-red-500">
								{vitalsErrors.systolic_bp}
							</span>
						)}
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-semibold text-slate-500 uppercase">
							Presión Diastólica
						</label>
						<input
							ref={diastolicRef}
							type="number"
							value={vitals.diastolic_bp}
							onChange={(e) =>
								handleVitalChange("diastolic_bp", e.target.value)
							}
							onKeyDown={(e) => handleVitalKeyDown(e, 5)}
							className={`px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${vitalsErrors.diastolic_bp ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-primary-500"}`}
							placeholder="Ej: 80"
						/>
						{vitalsErrors.diastolic_bp && (
							<span className="text-xs text-red-500">
								{vitalsErrors.diastolic_bp}
							</span>
						)}
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-semibold text-slate-500 uppercase">
							Frec. Cardíaca (lpm)
						</label>
						<input
							ref={heartRateRef}
							type="number"
							value={vitals.heart_rate}
							onChange={(e) => handleVitalChange("heart_rate", e.target.value)}
							onKeyDown={(e) => handleVitalKeyDown(e, 6)}
							className={`px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${vitalsErrors.heart_rate ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-primary-500"}`}
						/>
						{vitalsErrors.heart_rate && (
							<span className="text-xs text-red-500">
								{vitalsErrors.heart_rate}
							</span>
						)}
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-semibold text-slate-500 uppercase">
							Frec. Respiratoria
						</label>
						<input
							ref={respRateRef}
							type="number"
							value={vitals.respiratory_rate}
							onChange={(e) =>
								handleVitalChange("respiratory_rate", e.target.value)
							}
							onKeyDown={(e) => handleVitalKeyDown(e, 7)}
							className={`px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${vitalsErrors.respiratory_rate ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-primary-500"}`}
						/>
						{vitalsErrors.respiratory_rate && (
							<span className="text-xs text-red-500">
								{vitalsErrors.respiratory_rate}
							</span>
						)}
					</div>
				</div>
			</StaticCard>

			{/* Síntomas */}
			<StaticCard className="p-0! overflow-hidden @container">
				<main className="bg-primary-600 px-6 py-4 gap-2 border-b border-primary-200 flex  items-center justify-between">
					<header className="flex items-center gap-2">
						<FaNotesMedical className="text-primary-100" />
						<h2 className="text-lg font-bold text-primary-100">Síntomas</h2>
					</header>
					<div className="w-64">
						<SearchableSelect
							key={symptomKey}
							options={symptomsList.map((s) => ({
								value: s.id,
								label: s.name,
							}))}
							placeholder="Buscar síntoma..."
							searchPlaceholder="Buscar síntoma..."
							onChange={(value) => {
								const item = symptomsList.find((s) => s.id === Number(value));
								if (item && !symptoms.find((s) => s.id === item.id)) {
									setSymptoms([
										...symptoms,
										{ ...item, severity: "Leve", duration: "", notes: "" },
									]);
								}
								setSymptomKey((k) => k + 1);
							}}
							value=""
						/>
					</div>
				</main>
				<div className="p-4 flex flex-col items-center gap-3 @container">
					{symptoms.length === 0 ? (
						<p className="text-sm text-slate-400 text-center py-4">
							No hay síntomas registrados.
						</p>
					) : (
						symptoms.map((sym, idx) => (
							<article
								key={idx}
								className="flex flex-col @sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-lg border w-full border-slate-100">
								<span className="font-semibold text-slate-700 flex-1">
									{sym.name}
								</span>
								<main className="flex flex-wrap flex-2 gap-2">
									<div className="w-full flex gap-1 justify-between">
										<select
											className="px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none w-full md:w-auto"
											value={sym.severity}
											onChange={(e) => {
												const newSym = [...symptoms];
												newSym[idx].severity = e.target.value;
												setSymptoms(newSym);
											}}>
											<option value="Leve">Leve</option>
											<option value="Moderado">Moderado</option>
											<option value="Severo">Severo</option>
										</select>
										<input
											type="text"
											placeholder="Duración (ej: 3 días)"
											className="px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none flex-1"
											value={sym.duration}
											onChange={(e) => {
												const newSym = [...symptoms];
												newSym[idx].duration = e.target.value;
												setSymptoms(newSym);
											}}
										/>
									</div>

									<input
										type="text"
										placeholder="Notas adicionales"
										className="px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none flex-1"
										value={sym.notes}
										onChange={(e) => {
											const newSym = [...symptoms];
											newSym[idx].notes = e.target.value;
											setSymptoms(newSym);
										}}
									/>
								</main>
								<button
									type="button"
									onClick={() =>
										setSymptoms(symptoms.filter((_, i) => i !== idx))
									}
									className="text-red-500 p-2 hover:bg-red-50 rounded-md dy @sm:hidden">
									<FaTrash />
								</button>
							</article>
						))
					)}
				</div>
			</StaticCard>

			{/* Diagnósticos */}
			<StaticCard className="!p-0 overflow-hidden ">
				<div className="bg-primary-600 px-6 py-4 border-b border-primary-200 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<FaStethoscope className="text-primary-100" />
						<h2 className="text-lg font-bold text-primary-100">Diagnósticos</h2>
					</div>
					<div className="w-64">
						<SearchableSelect
							key={diagnosisKey}
							options={diagnosesList.map((d) => ({
								value: d.id,
								label: `${d.description} [${d.code}]`,
							}))}
							placeholder="Buscar diagnóstico..."
							searchPlaceholder="Buscar diagnóstico..."
							onChange={(value) => {
								const item = diagnosesList.find((d) => d.id === Number(value));
								if (item && !diagnoses.find((d) => d.id === item.id)) {
									setDiagnoses([
										...diagnoses,
										{
											...item,
											name: item.description,
											is_primary: diagnoses.length === 0,
											condition_status: "Activo",
											onset_date: "",
										},
									]);
								}
								setDiagnosisKey((k) => k + 1);
							}}
							value=""
						/>
					</div>
				</div>
				<div className="p-4 flex flex-col gap-3">
					{diagnoses.length === 0 ? (
						<p className="text-sm text-slate-400 text-center py-4">
							No hay diagnósticos registrados.
						</p>
					) : (
						diagnoses.map((diag, idx) => (
							<div
								key={idx}
								className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
								<span className="font-semibold text-slate-700 w-full md:w-1/3 flex items-center gap-2">
									{diag.name}{" "}
									<span className="text-xs bg-slate-200 text-slate-600 px-1.5 rounded">
										{diag.code}
									</span>
								</span>
								<label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
									<input
										type="radio"
										name="primaryDiagnosis"
										checked={diag.is_primary}
										onChange={() => {
											const newDiag = diagnoses.map((d, i) => ({
												...d,
												is_primary: i === idx,
											}));
											setDiagnoses(newDiag);
										}}
										className="text-primary-600 focus:ring-primary-500"
									/>
									Principal
								</label>
								<select
									className="px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none"
									value={diag.condition_status}
									onChange={(e) => {
										const newDiag = [...diagnoses];
										newDiag[idx].condition_status = e.target.value;
										setDiagnoses(newDiag);
									}}>
									<option value="Activo">Activo</option>
									<option value="Resuelto">Resuelto</option>
									<option value="Crónico">Crónico</option>
								</select>
								<input
									type="date"
									className="px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none flex-1"
									value={diag.onset_date}
									onChange={(e) => {
										const newDiag = [...diagnoses];
										newDiag[idx].onset_date = e.target.value;
										setDiagnoses(newDiag);
									}}
								/>
								<button
									type="button"
									onClick={() =>
										setDiagnoses(diagnoses.filter((_, i) => i !== idx))
									}
									className="text-red-500 p-2 hover:bg-red-50 rounded-md">
									<FaTrash />
								</button>
							</div>
						))
					)}
				</div>
			</StaticCard>

			{/* Insumos */}
			<StaticCard className="!p-0 overflow-hidden mb-28">
				<div className="bg-primary-600 px-6 py-4 border-b border-primary-200 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<FaBoxOpen className="text-primary-100" />
						<h2 className="text-lg font-bold text-primary-100">
							Insumos Consumidos
						</h2>
					</div>
					<div className="w-64">
						<SearchableSelect
							key={supplyKey}
							options={suppliesList
								.filter((s) => s.type === "Material")
								.map((s) => ({
									value: s.id,
									label: (s.stock ?? 0) <= 0 ? `${s.name} (Agotado)` : s.name,
									disabled: (s.stock ?? 0) <= 0,
								}))}
							placeholder="Buscar insumo..."
							searchPlaceholder="Buscar insumo..."
							onChange={(value) => {
								const item = suppliesList.find((s) => s.id === Number(value));
								if (item && !supplies.find((s) => s.id === item.id)) {
									setSupplies([...supplies, { ...item, quantity: 1 }]);
								}
								setSupplyKey((k) => k + 1);
							}}
							value=""
						/>
					</div>
				</div>
				<div className="p-4 flex flex-col gap-3">
					{supplies.length === 0 ? (
						<p className="text-sm text-slate-400 text-center py-4">
							No se consumieron insumos adicionales.
						</p>
					) : (
						supplies.map((sup, idx) => (
							<div
								key={idx}
								className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
								<span className="font-semibold text-slate-700 flex-1">
									{sup.name}
								</span>
								<div className="flex items-center gap-2">
									<label className="text-sm text-slate-500">Cantidad:</label>
									<input
										type="number"
										min="1"
										step="1"
										className="w-20 px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none text-center"
										value={sup.quantity}
										onChange={(e) => {
											const newSup = [...supplies];
											newSup[idx].quantity = e.target.value;
											setSupplies(newSup);
										}}
									/>
								</div>
								<button
									type="button"
									onClick={() =>
										setSupplies(supplies.filter((_, i) => i !== idx))
									}
									className="text-red-500 p-2 hover:bg-red-50 rounded-md ml-2">
									<FaTrash />
								</button>
							</div>
						))
					)}
				</div>
			</StaticCard>

			{/* Recetas */}
			<StaticCard className="!p-0 overflow-hidden mb-28">
				<div className="bg-primary-600 px-6 py-4 border-b border-primary-200 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<FaPills className="text-primary-100" />
						<h2 className="text-lg font-bold text-primary-100">
							Receta Médica
						</h2>
					</div>
					<div className="flex gap-2">
						<div className="w-64">
							<SearchableSelect
								key={medicationKey}
								options={suppliesList
									.filter((s) => s.type === "Medicamento")
									.map((s) => ({
										value: s.id,
										label:
											(s.stock ?? 0) <= (s.min_stock ?? 0)
												? `${s.name} - Stock bajo`
												: s.name,
										disabled: (s.stock ?? 0) <= 0,
									}))}
								placeholder="Buscar medicamento..."
								searchPlaceholder="Buscar medicamento..."
								onChange={(value) => {
									const item = suppliesList.find((s) => s.id === Number(value));
									if (item) {
										setPrescriptions([
											...prescriptions,
											{
												supplyId: item.id,
												medication_name: item.name,
												dosage: "",
												frequency: "",
												duration: "",
												instructions: "",
											},
										]);
									}
									setMedicationKey((k) => k + 1);
								}}
								value=""
							/>
						</div>
						<button
							type="button"
							onClick={() =>
								setPrescriptions([
									...prescriptions,
									{
										supplyId: null,
										medication_name: "",
										dosage: "",
										frequency: "",
										duration: "",
										instructions: "",
									},
								])
							}
							className="px-3 py-2 bg-white border border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 text-sm font-semibold flex items-center gap-1">
							<FaPlus /> Manual
						</button>
					</div>
				</div>
				<div className="p-4 flex flex-col gap-4 ">
					{prescriptions.length === 0 ? (
						<p className="text-sm text-slate-400 text-center py-4">
							No se emitieron recetas en esta consulta.
						</p>
					) : (
						prescriptions.map((pres, idx) => (
							<div
								key={idx}
								className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 relative">
								<button
									type="button"
									onClick={() =>
										setPrescriptions(prescriptions.filter((_, i) => i !== idx))
									}
									className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-2">
									<FaTrash />
								</button>
								<div className="pr-10">
									<label className="text-xs font-semibold text-slate-500 uppercase">
										Medicamento
									</label>
									{pres.supplyId ? (
										<p className="font-bold text-slate-800 text-lg">
											{pres.medication_name}
										</p>
									) : (
										<input
											type="text"
											placeholder="Nombre del medicamento"
											className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg outline-none"
											value={pres.medication_name}
											onChange={(e) => {
												const newPres = [...prescriptions];
												newPres[idx].medication_name = e.target.value;
												setPrescriptions(newPres);
											}}
										/>
									)}
								</div>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									<input
										type="text"
										placeholder="Dosis (Ej: 500mg)"
										className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
										value={pres.dosage}
										onChange={(e) => {
											const newPres = [...prescriptions];
											newPres[idx].dosage = e.target.value;
											setPrescriptions(newPres);
										}}
									/>
									<input
										type="text"
										placeholder="Frecuencia (Ej: Cada 8 horas)"
										className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
										value={pres.frequency}
										onChange={(e) => {
											const newPres = [...prescriptions];
											newPres[idx].frequency = e.target.value;
											setPrescriptions(newPres);
										}}
									/>
									<input
										type="text"
										placeholder="Duración (Ej: 5 días)"
										className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
										value={pres.duration}
										onChange={(e) => {
											const newPres = [...prescriptions];
											newPres[idx].duration = e.target.value;
											setPrescriptions(newPres);
										}}
									/>
								</div>
								<div>
									<input
										type="text"
										placeholder="Instrucciones adicionales (Opcional)"
										className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
										value={pres.instructions}
										onChange={(e) => {
											const newPres = [...prescriptions];
											newPres[idx].instructions = e.target.value;
											setPrescriptions(newPres);
										}}
									/>
								</div>
							</div>
						))
					)}
				</div>
			</StaticCard>

			{/* Actions */}
			<div className="fixed bottom-0 left-0 right-0 lg:pl-64 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
				{!isFormValid && (
					<p className="text-xs text-amber-600 mb-2 text-right">
						Faltan:{!hasVitals && " signos vitales"}
						{symptoms.length === 0 && " síntomas"}
						{diagnoses.length === 0 && " diagnósticos"}
						{hasMissingSymptomDuration && " duración de síntomas"}
					</p>
				)}
				<div className="flex justify-end gap-4">
					<a
						href={`/modules/doctor/${doctorId}/schedule`}
						data-astro-reload
						className="px-6 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-colors">
						Cancelar
					</a>
					<button
						type="submit"
						disabled={isSubmitting || !isFormValid}
						className="px-8 py-2.5 text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5">
						{isSubmitting ? (
							"Guardando..."
						) : (
							<>
								<FaCheck /> Finalizar Consulta
							</>
						)}
					</button>
				</div>
			</div>
		</form>
	);
}
