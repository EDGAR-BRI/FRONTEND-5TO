import React, { useState, useEffect } from 'react';
import { FaHeartPulse, FaLungs, FaThermometer, FaWeightScale, FaRulerVertical, FaPlus, FaTrash, FaCheck, FaPills, FaBoxOpen, FaStethoscope, FaNotesMedical } from 'react-icons/fa6';
import { finishConsultation } from '@/lib/services/medical/consultation/consultation.service';
import type { FinishConsultationDto } from '@/lib/services/medical/consultation/consultation.interface';
import { getSymptoms } from '@/lib/services/medical/symptoms/symptoms.service';
import type { Symptom } from '@/lib/services/medical/symptoms/symptoms.interface';
import { getDiagnoses } from '@/lib/services/medical/diagnosis/diagnosis.service';
import type { Diagnosis } from '@/lib/services/medical/diagnosis/diagnosis.interface';
import { getSupplies } from '@/lib/services/inventory/supply/supply.service';
import type { Supply } from '@/lib/services/inventory/supply/supply.interface';

interface ConsultationFormProps {
    doctorId: string;
    consultationId: string;
    invoiceCode: string;
}

// Se obtienen las listas desde el backend

// Helper Component for Search/Select
const ItemSelector = ({ items, onSelect, placeholder, labelKey = 'name', renderExtra = (item: any) => null }: any) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filtered = items.filter((item: any) => item[labelKey].toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="relative w-full">
            <div className="relative">
                <FaLungs className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
                />
            </div>
            {isOpen && search && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filtered.length > 0 ? filtered.map((item: any) => (
                        <div 
                            key={item.id}
                            onClick={() => { onSelect(item); setSearch(''); setIsOpen(false); }}
                            className="px-4 py-2 hover:bg-primary-50 cursor-pointer flex justify-between items-center transition-colors text-sm"
                        >
                            <span className="font-medium text-slate-700">{item[labelKey]}</span>
                            {renderExtra(item)}
                        </div>
                    )) : (
                        <div className="px-4 py-3 text-sm text-slate-500 text-center">No se encontraron resultados</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function ConsultationForm({ doctorId, consultationId, invoiceCode }: ConsultationFormProps) {
    // Examen Clínico
    const [vitals, setVitals] = useState({
        weight: '', height: '', temperature: '', systolic_bp: '', diastolic_bp: '', heart_rate: '', respiratory_rate: '', oxygen_saturation: ''
    });

    // Síntomas
    const [symptoms, setSymptoms] = useState<any[]>([]);
    
    // Diagnósticos
    const [diagnoses, setDiagnoses] = useState<any[]>([]);

    // Insumos Usados
    const [supplies, setSupplies] = useState<any[]>([]);

    // Recetas
    const [prescriptions, setPrescriptions] = useState<any[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setIsSubmitting(true);

        try {
            const consultationIdNum = Number(consultationId);
            if (!Number.isFinite(consultationIdNum) || consultationIdNum <= 0) {
                throw new Error("ID de consulta inválido");
            }

            const hasMissingSymptomDuration = symptoms.some((s) => !String(s?.duration ?? "").trim());
            if (hasMissingSymptomDuration) {
                throw new Error("Completa la duración de todos los síntomas");
            }

            const hasInvalidSupplyQty = supplies.some((s) => {
                const qty = Number.parseInt(String(s?.quantity ?? ""), 10);
                return !Number.isFinite(qty) || qty <= 0;
            });
            if (hasInvalidSupplyQty) {
                throw new Error("Cantidad de insumo inválida");
            }

            const payload: FinishConsultationDto = {
                finished_at: new Date().toISOString(),
                supplies: supplies.map((s) => ({
                    supplyId: Number(s.id),
                    quantity: Number.parseInt(String(s.quantity), 10),
                })),
                prescriptions: prescriptions.map((p) => ({
                    supplyId: p.supplyId ? Number(p.supplyId) : undefined,
                    medication_name: p.medication_name?.trim() ? p.medication_name.trim() : undefined,
                    dosage: p.dosage?.trim() ? p.dosage.trim() : undefined,
                    frequency: p.frequency?.trim() ? p.frequency.trim() : undefined,
                    duration: p.duration?.trim() ? p.duration.trim() : undefined,
                    instructions: p.instructions?.trim() ? p.instructions.trim() : undefined,
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
                        temperature: vitals.temperature ? Number(vitals.temperature) : undefined,
                        systolic_bp: vitals.systolic_bp ? Number(vitals.systolic_bp) : undefined,
                        diastolic_bp: vitals.diastolic_bp ? Number(vitals.diastolic_bp) : undefined,
                        heart_rate: vitals.heart_rate ? Number(vitals.heart_rate) : undefined,
                        respiratory_rate: vitals.respiratory_rate ? Number(vitals.respiratory_rate) : undefined,
                        oxygen_saturation: vitals.oxygen_saturation ? Number(vitals.oxygen_saturation) : undefined,
                    },
                ],
                consultationDiagnoses: diagnoses.map((d) => ({
                    diagnosisId: Number(d.id),
                    is_primary: Boolean(d.is_primary),
                    condition_status: d.condition_status?.trim()
                        ? d.condition_status.trim()
                        : undefined,
                    onset_date: d.onset_date ? new Date(d.onset_date).toISOString() : undefined,
                })),
            };


            await finishConsultation(consultationIdNum, payload);

            alert("Consulta finalizada correctamente.");
            window.location.href = `/modules/doctor/${doctorId}/schedule`;
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Error finalizando la consulta");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-20">
            {/* Examen Clínico */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                    <FaHeartPulse className="text-primary-500" />
                    <h2 className="text-lg font-bold text-slate-800">Examen Clínico (Signos Vitales)</h2>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1"><FaWeightScale/> Peso (kg)</label>
                        <input type="number" step="0.1" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1"><FaRulerVertical/> Altura (cm)</label>
                        <input type="number" step="0.1" value={vitals.height} onChange={e => setVitals({...vitals, height: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1"><FaThermometer/> Temp (°C)</label>
                        <input type="number" step="0.1" value={vitals.temperature} onChange={e => setVitals({...vitals, temperature: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1"><FaLungs/> Sat. O2 (%)</label>
                        <input type="number" value={vitals.oxygen_saturation} onChange={e => setVitals({...vitals, oxygen_saturation: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Presión Sistólica</label>
                        <input type="number" value={vitals.systolic_bp} onChange={e => setVitals({...vitals, systolic_bp: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ej: 120" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Presión Diastólica</label>
                        <input type="number" value={vitals.diastolic_bp} onChange={e => setVitals({...vitals, diastolic_bp: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ej: 80" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Frec. Cardíaca (lpm)</label>
                        <input type="number" value={vitals.heart_rate} onChange={e => setVitals({...vitals, heart_rate: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Frec. Respiratoria</label>
                        <input type="number" value={vitals.respiratory_rate} onChange={e => setVitals({...vitals, respiratory_rate: e.target.value})} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>
                </div>
            </section>

            {/* Síntomas */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FaNotesMedical className="text-orange-500" />
                        <h2 className="text-lg font-bold text-slate-800">Síntomas</h2>
                    </div>
                    <div className="w-64">
                        <ItemSelector 
                            items={symptomsList} 
                            placeholder="Buscar síntoma..." 
                            onSelect={(item: any) => {
                                if(!symptoms.find(s => s.id === item.id)) {
                                    setSymptoms([...symptoms, { ...item, severity: 'Leve', duration: '', notes: '' }]);
                                }
                            }} 
                        />
                    </div>
                </div>
                <div className="p-4 flex flex-col gap-3">
                    {symptoms.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No hay síntomas registrados.</p>
                    ) : (
                        symptoms.map((sym, idx) => (
                            <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="font-semibold text-slate-700 w-full md:w-1/4">{sym.name}</span>
                                <select 
                                    className="px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none w-full md:w-auto"
                                    value={sym.severity}
                                    onChange={(e) => {
                                        const newSym = [...symptoms];
                                        newSym[idx].severity = e.target.value;
                                        setSymptoms(newSym);
                                    }}
                                >
                                    <option value="Leve">Leve</option>
                                    <option value="Moderado">Moderado</option>
                                    <option value="Severo">Severo</option>
                                </select>
                                <input 
                                    type="text" placeholder="Duración (ej: 3 días)" 
                                    className="px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none flex-1"
                                    value={sym.duration}
                                    onChange={(e) => { const newSym = [...symptoms]; newSym[idx].duration = e.target.value; setSymptoms(newSym); }}
                                />
                                <input 
                                    type="text" placeholder="Notas adicionales" 
                                    className="px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none flex-1"
                                    value={sym.notes}
                                    onChange={(e) => { const newSym = [...symptoms]; newSym[idx].notes = e.target.value; setSymptoms(newSym); }}
                                />
                                <button type="button" onClick={() => setSymptoms(symptoms.filter((_, i) => i !== idx))} className="text-red-500 p-2 hover:bg-red-50 rounded-md">
                                    <FaTrash />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Diagnósticos */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FaStethoscope className="text-purple-500" />
                        <h2 className="text-lg font-bold text-slate-800">Diagnósticos</h2>
                    </div>
                    <div className="w-64">
                        <ItemSelector 
                            items={diagnosesList} 
                            placeholder="Buscar diagnóstico..." 
                            renderExtra={(item: any) => <span className="text-xs bg-purple-100 text-purple-700 px-1 rounded">{item.code}</span>}
                            onSelect={(item: any) => {
                                if(!diagnoses.find(d => d.id === item.id)) {
                                    setDiagnoses([...diagnoses, { ...item, is_primary: diagnoses.length === 0, condition_status: 'Activo', onset_date: '' }]);
                                }
                            }} 
                        />
                    </div>
                </div>
                <div className="p-4 flex flex-col gap-3">
                    {diagnoses.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No hay diagnósticos registrados.</p>
                    ) : (
                        diagnoses.map((diag, idx) => (
                            <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="font-semibold text-slate-700 w-full md:w-1/3 flex items-center gap-2">
                                    {diag.name} <span className="text-xs bg-slate-200 text-slate-600 px-1.5 rounded">{diag.code}</span>
                                </span>
                                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="primaryDiagnosis" 
                                        checked={diag.is_primary}
                                        onChange={() => {
                                            const newDiag = diagnoses.map((d, i) => ({ ...d, is_primary: i === idx }));
                                            setDiagnoses(newDiag);
                                        }}
                                        className="text-primary-600 focus:ring-primary-500"
                                    />
                                    Principal
                                </label>
                                <select 
                                    className="px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none"
                                    value={diag.condition_status}
                                    onChange={(e) => { const newDiag = [...diagnoses]; newDiag[idx].condition_status = e.target.value; setDiagnoses(newDiag); }}
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Resuelto">Resuelto</option>
                                    <option value="Crónico">Crónico</option>
                                </select>
                                <input 
                                    type="date" 
                                    className="px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none flex-1"
                                    value={diag.onset_date}
                                    onChange={(e) => { const newDiag = [...diagnoses]; newDiag[idx].onset_date = e.target.value; setDiagnoses(newDiag); }}
                                />
                                <button type="button" onClick={() => setDiagnoses(diagnoses.filter((_, i) => i !== idx))} className="text-red-500 p-2 hover:bg-red-50 rounded-md">
                                    <FaTrash />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Insumos */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FaBoxOpen className="text-emerald-500" />
                        <h2 className="text-lg font-bold text-slate-800">Insumos Consumidos</h2>
                    </div>
                    <div className="w-64">
                        <ItemSelector 
                            items={suppliesList.filter(s => s.type === 'Material')} 
                            placeholder="Buscar insumo..." 
                            onSelect={(item: any) => {
                                if(!supplies.find(s => s.id === item.id)) {
                                    setSupplies([...supplies, { ...item, quantity: 1 }]);
                                }
                            }} 
                        />
                    </div>
                </div>
                <div className="p-4 flex flex-col gap-3">
                    {supplies.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No se consumieron insumos adicionales.</p>
                    ) : (
                        supplies.map((sup, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="font-semibold text-slate-700 flex-1">{sup.name}</span>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-slate-500">Cantidad:</label>
                                    <input 
                                        type="number" min="1" step="1"
                                        className="w-20 px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none text-center"
                                        value={sup.quantity}
                                        onChange={(e) => { const newSup = [...supplies]; newSup[idx].quantity = e.target.value; setSupplies(newSup); }}
                                    />
                                </div>
                                <button type="button" onClick={() => setSupplies(supplies.filter((_, i) => i !== idx))} className="text-red-500 p-2 hover:bg-red-50 rounded-md ml-2">
                                    <FaTrash />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Recetas */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FaPills className="text-blue-500" />
                        <h2 className="text-lg font-bold text-slate-800">Receta Médica</h2>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-64">
                            <ItemSelector 
                                items={suppliesList.filter(s => s.type === 'Medicamento')} 
                                placeholder="Buscar medicamento..." 
                                onSelect={(item: any) => {
                                    setPrescriptions([...prescriptions, { supplyId: item.id, medication_name: item.name, dosage: '', frequency: '', duration: '', instructions: '' }]);
                                }} 
                            />
                        </div>
                        <button 
                            type="button"
                            onClick={() => setPrescriptions([...prescriptions, { supplyId: null, medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' }])}
                            className="px-3 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-semibold flex items-center gap-1"
                        >
                            <FaPlus /> Manual
                        </button>
                    </div>
                </div>
                <div className="p-4 flex flex-col gap-4">
                    {prescriptions.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No se emitieron recetas en esta consulta.</p>
                    ) : (
                        prescriptions.map((pres, idx) => (
                            <div key={idx} className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 relative">
                                <button type="button" onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-2">
                                    <FaTrash />
                                </button>
                                <div className="pr-10">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Medicamento</label>
                                    {pres.supplyId ? (
                                        <p className="font-bold text-slate-800 text-lg">{pres.medication_name}</p>
                                    ) : (
                                        <input 
                                            type="text" placeholder="Nombre del medicamento" 
                                            className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg outline-none"
                                            value={pres.medication_name}
                                            onChange={(e) => { const newPres = [...prescriptions]; newPres[idx].medication_name = e.target.value; setPrescriptions(newPres); }}
                                        />
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input 
                                        type="text" placeholder="Dosis (Ej: 500mg)" 
                                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                                        value={pres.dosage}
                                        onChange={(e) => { const newPres = [...prescriptions]; newPres[idx].dosage = e.target.value; setPrescriptions(newPres); }}
                                    />
                                    <input 
                                        type="text" placeholder="Frecuencia (Ej: Cada 8 horas)" 
                                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                                        value={pres.frequency}
                                        onChange={(e) => { const newPres = [...prescriptions]; newPres[idx].frequency = e.target.value; setPrescriptions(newPres); }}
                                    />
                                    <input 
                                        type="text" placeholder="Duración (Ej: 5 días)" 
                                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                                        value={pres.duration}
                                        onChange={(e) => { const newPres = [...prescriptions]; newPres[idx].duration = e.target.value; setPrescriptions(newPres); }}
                                    />
                                </div>
                                <div>
                                    <input 
                                        type="text" placeholder="Instrucciones adicionales (Opcional)" 
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                                        value={pres.instructions}
                                        onChange={(e) => { const newPres = [...prescriptions]; newPres[idx].instructions = e.target.value; setPrescriptions(newPres); }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Actions */}
            <div className="fixed bottom-0 left-0 right-0 lg:pl-64 bg-white border-t border-slate-200 p-4 flex justify-end gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
                <a 
                    href={`/modules/doctor/${doctorId}/schedule`}
                    className="px-6 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-colors"
                >
                    Cancelar
                </a>
                <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-2.5 text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5"
                >
                    {isSubmitting ? 'Guardando...' : <><FaCheck /> Finalizar Consulta</>}
                </button>
            </div>
        </form>
    );
}
