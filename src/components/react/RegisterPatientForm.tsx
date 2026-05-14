import { useState, useEffect } from 'react'
import { Field } from '@/components/react/primary/Field'
import { Select } from '@/components/react/primary/Select'
import { Button, ButtonTheme } from '@/components/react/primary/Button'
import { CheckBox } from '@/components/react/primary/CheckBox'
import { Modal } from '@/components/react/primary/Modal'
import { SearchableSelect } from '@/components/react/primary/SearchableSelect'
import { useModal } from '@/hooks/UseModal'
import { listUsers, createUser } from '@/lib/services/User/user.service'
import { addPatient } from '@/lib/services/medical/patient/patient.service'
import { addPatientInfo } from '@/lib/services/medical/info-patient/info_patient.service'
import type { UserDto } from '@/lib/services/User/user.interface'
import type { IconType } from 'react-icons'
import {
    FaCircleExclamation,
    FaHeartPulse,
    FaIdCard,
    FaNotesMedical,
    FaPhone,
    FaUserCheck,
    FaUserLock,
} from 'react-icons/fa6'

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle }: { icon: IconType; title: string; subtitle?: string }) {
    return (
        <div className="flex items-center gap-3 border-b border-primary-100 pb-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-primary-200 flex items-center justify-center flex-shrink-0">
                <Icon className="text-primary-600 text-sm" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-primary-800">{title}</h3>
                {subtitle && <p className="text-xs text-cool-gray-50">{subtitle}</p>}
            </div>
        </div>
    )
}

// ─── Types & Constants ───────────────────────────────────────────────────────
interface EmergencyContact {
    name: string
    relation: string
    phone: string
}

interface PatientForm {
    firstName: string
    lastName: string
    ci: string
    birthDate: string
    gender: string
    bloodType: string
    nationality: string
    phone: string
    email: string
    address: string
    city: string
    allergies: string
    chronicDiseases: string
    currentMedications: string
    previousSurgeries: string
    smokingStatus: string
    alcoholUse: string
    hasInsurance: boolean
    insuranceCompany: string
    insurancePolicyNumber: string
    linkExistingUser: boolean
    selectedUserId: number | null
    tempPassword: string
    emergencyContact: EmergencyContact
}

const EMPTY_FORM: PatientForm = {
    firstName: '', lastName: '', ci: '', birthDate: '', gender: '', bloodType: '',
    nationality: 'Venezolano/a', phone: '', email: '', address: '', city: '',
    allergies: '', chronicDiseases: '', currentMedications: '',
    previousSurgeries: '', smokingStatus: '', alcoholUse: '',
    hasInsurance: false, insuranceCompany: '', insurancePolicyNumber: '',
    linkExistingUser: true, selectedUserId: null, tempPassword: '',
    emergencyContact: { name: '', relation: '', phone: '' },
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(v => ({ value: v, label: v }))
const GENDERS = [{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Femenino' }]
const SMOKING = [
    { value: 'no', label: 'No fumador' }, { value: 'ex', label: 'Ex-fumador' }, { value: 'si', label: 'Fumador activo' },
]
const ALCOHOL = [
    { value: 'no', label: 'No consume' }, { value: 'ocasional', label: 'Ocasional' }, { value: 'frecuente', label: 'Frecuente' },
]
const RELATION_OPTIONS = [
    { value: 'madre', label: 'Madre' }, { value: 'padre', label: 'Padre' }, { value: 'conyuge', label: 'Cónyuge' },
    { value: 'hijo', label: 'Hijo/a' }, { value: 'hermano', label: 'Hermano/a' }, { value: 'otro', label: 'Otro' },
]

// ─── Props ───────────────────────────────────────────────────────────────────
interface RegisterPatientProps {
    role?: 'receptionist' | 'pacient'
    currentUserId?: number // Si es paciente, le pasamos su ID de usuario logueado
    onSuccessCallback?: (patientId: number) => void // Para redirigir al Overview después
}

const RegisterPatientForm: React.FC<RegisterPatientProps> = ({
    role = 'receptionist',
    currentUserId,
    onSuccessCallback
}) => {

    const [form, setForm] = useState<PatientForm>(EMPTY_FORM)
    const [isSaving, setIsSaving] = useState(false)
    const [globalError, setGlobalError] = useState<string | null>(null)
    const [errors, setErrors] = useState<Partial<Record<keyof PatientForm, string>>>({})
    const { isOpen: isSuccessOpen, openModal: openSuccess, closeModal: closeSuccess } = useModal(false)
    const [createdPatientId, setCreatedPatientId] = useState<number | null>(null);
    const [users, setUsers] = useState<UserDto[]>([])
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)

    // Solo buscamos usuarios si es recepcionista
    useEffect(() => {
        if (role === 'receptionist') {
            const fetchUsers = async () => {
                setIsLoadingUsers(true)
                try {
                    const data = await listUsers()
                    setUsers(data)
                } catch (error) {
                    console.error("Error fetching users:", error)
                } finally {
                    setIsLoadingUsers(false)
                }
            }
            fetchUsers()
        }
    }, [role])

    const set = (field: keyof PatientForm, value: string | boolean | number | null) =>
        setForm(prev => ({ ...prev, [field]: value }))

    const setEcontact = (field: keyof EmergencyContact, value: string) =>
        setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [field]: value } }))

    const validate = () => {
        const e: Partial<Record<keyof PatientForm, string>> = {}
        if (!form.firstName.trim()) e.firstName = 'Requerido'
        if (!form.lastName.trim()) e.lastName = 'Requerido'
        if (!form.ci.trim()) e.ci = 'Requerido'
        if (!form.birthDate) e.birthDate = 'Requerido'
        if (!form.gender) e.gender = 'Requerido'
        if (!form.phone.trim()) e.phone = 'Requerido'

        // Validaciones EXCLUSIVAS de recepcionista
        if (role === 'receptionist') {
            if (form.linkExistingUser && !form.selectedUserId) {
                e.selectedUserId = 'Debes seleccionar un usuario'
            }
            if (!form.linkExistingUser && !form.tempPassword.trim()) {
                e.tempPassword = 'La contraseña es requerida'
            }
        }
        else if (!hasLengthInRange(form.ci, 3, 30)) e.ci = 'La cédula debe tener entre 3 y 30 caracteres'

        if (!form.birthDate) e.birthDate = 'Requerido'
        if (!form.gender) e.gender = 'Requerido'

        if (form.bloodType.trim() && !hasLengthInRange(form.bloodType, 1, 10)) e.bloodType = 'Debe tener entre 1 y 10 caracteres'
        if (form.nationality.trim() && !hasLengthInRange(form.nationality, 2, 100)) e.nationality = 'Debe tener entre 2 y 100 caracteres'
        if (form.phone.trim() && !hasLengthInRange(form.phone, 6, 20)) e.phone = 'Debe tener entre 6 y 20 caracteres'
        if (form.email.trim() && !isValidEmail(form.email.trim())) e.email = 'El email no es válido'
        if (form.address.trim() && !hasLengthInRange(form.address, 5, 500)) e.address = 'Debe tener entre 5 y 500 caracteres'
        if (form.city.trim() && !hasLengthInRange(form.city, 2, 100)) e.city = 'Debe tener entre 2 y 100 caracteres'

        if (form.allergies.trim() && !hasLengthInRange(form.allergies, 1, 5000)) e.allergies = 'Debe tener entre 1 y 5000 caracteres'
        if (form.chronicDiseases.trim() && !hasLengthInRange(form.chronicDiseases, 1, 5000)) e.chronicDiseases = 'Debe tener entre 1 y 5000 caracteres'
        if (form.currentMedications.trim() && !hasLengthInRange(form.currentMedications, 1, 5000)) e.currentMedications = 'Debe tener entre 1 y 5000 caracteres'
        if (form.previousSurgeries.trim() && !hasLengthInRange(form.previousSurgeries, 1, 5000)) e.previousSurgeries = 'Debe tener entre 1 y 5000 caracteres'

        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSave = async () => {
        setGlobalError(null)
        if (!validate()) return
        setIsSaving(true)

        try {
            let patientUserId = form.selectedUserId;

            // Lógica de usuario según el ROL
            if (role === 'pacient') {
                if (!currentUserId) throw new Error("ID de usuario no proporcionado. Debes iniciar sesión.");
                patientUserId = currentUserId; // El usuario es él mismo
            } else {
                // Lógica de Recepcionista
                if (!form.linkExistingUser) {
                    const newUser = await createUser({
                        ci: form.ci,
                        name: `${form.firstName} ${form.lastName}`,
                        password: form.tempPassword,
                        roleId: 4 // PACIENTE
                    });
                    patientUserId = newUser.id;
                    setUsers(prev => [...prev, newUser]);
                }
            }

            if (!patientUserId) {
                throw new Error("No se pudo obtener el ID del usuario para vincular al paciente.");
            }

            // 1. Crear Paciente en BD (O buscarlo si ya existe)
            const patient = await addPatient({
                userId: patientUserId,
            const patient = await addPatientFromReception({
                ci: form.ci,
                name: `${form.firstName} ${form.lastName}`,
            })
            setCreatedPatientId(patient.id); //

            if (createInfoPatientOnRegister) {
                // Create patient info only when this flow explicitly requires it
                const birthDate = new Date(form.birthDate);
                const sex: 'MALE' | 'FEMALE' = form.gender === 'M' ? 'MALE' : 'FEMALE';

            await addPatientInfo({
                patientId: patient.id,
                ci: form.ci,
                name: form.firstName,
                last_name: form.lastName,
                sex,
                birth_date: birthDate,
                blood_type: form.bloodType || null,
                nacionality: form.nationality || null,
                main_phone: form.phone || null,
                email: form.email || null,
                address: form.address || null,
                city: form.city || null,
                allergies: form.allergies || null,
                chronic_diseases: form.chronicDiseases || null,
                current_medications: form.currentMedications || null,
                previous_surgeries: form.previousSurgeries || null
            });

            openSuccess()
        } catch (error: any) {
            console.error("Error during registration flow:", error);
            setGlobalError(error.message || "Ocurrió un error al registrar los datos.");
        } finally {
            setIsSaving(false)
        }
    }

    const handleReset = () => {
        setForm(EMPTY_FORM)
        setErrors({})
        setGlobalError(null)
    }


    return (
        <div className="flex flex-col gap-6">

            {/* Si es paciente, le mostramos un banner de bienvenida / onboarding */}
            {role === 'pacient' && (
                <div className="bg-primary-50 border border-primary-200 text-primary-800 p-4 rounded-xl mb-2">
                    <h2 className="text-lg font-bold mb-1">¡Bienvenido a la Clínica! 👋</h2>
                    <p className="text-sm opacity-90">Para poder agendar citas y brindarte la mejor atención, necesitamos que completes tu ficha médica por única vez. Esto tomará solo unos minutos.</p>
                </div>
            )}

            <div className="bg-white rounded-xl border border-primary-200 shadow-sm p-6">
                <SectionHeader icon={FaIdCard} title="Identificación Personal" subtitle="Datos básicos del paciente" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field name="firstName" label="Primer nombre *" placeholder="Ej. María" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                    <Field name="lastName" label="Apellidos *" placeholder="Ej. García Rodríguez" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                    <Field name="ci" label="Cédula de Identidad *" placeholder="Ej. V-12345678" value={form.ci} onChange={e => set('ci', e.target.value)} />
                    <Field name="birthDate" label="Fecha de nacimiento *" type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} />
                    <Select name="gender" label="Sexo *" options={GENDERS} placeholder="Seleccionar..." value={form.gender} onChange={v => set('gender', String(v))} />
                    <Select name="bloodType" label="Tipo de sangre" options={BLOOD_TYPES} placeholder="Seleccionar..." value={form.bloodType} onChange={v => set('bloodType', String(v))} />
                    <Field name="nationality" label="Nacionalidad" placeholder="Venezolano/a" value={form.nationality} onChange={e => set('nationality', e.target.value)} />
                </div>
                {Object.values(errors).some(Boolean) && (
                    <p className="mt-3 text-xs text-error flex items-center gap-1">
                        <FaCircleExclamation /> Por favor completa los campos requeridos marcados con *.
                    </p>
                )}
            </div>

            <div className="bg-white rounded-xl border border-primary-200 shadow-sm p-6">
                <SectionHeader icon={FaPhone} title="Información de Contacto" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field name="phone" label="Teléfono principal *" placeholder="Ej. 0414-1234567" value={form.phone} onChange={e => set('phone', e.target.value)} />
                    <Field name="email" label="Correo electrónico" type="email" placeholder="Ej. maria@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                    <Field name="address" label="Dirección" placeholder="Calle, urbanización..." value={form.address} onChange={e => set('address', e.target.value)} />
                    <Field name="city" label="Ciudad / Municipio" placeholder="Ej. Caracas" value={form.city} onChange={e => set('city', e.target.value)} />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-primary-200 shadow-sm p-6">
                <SectionHeader icon={FaHeartPulse} title="Contacto de Emergencia" subtitle="Persona a quien llamar en caso de urgencia" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field name="emergencyName" label="Nombre completo" placeholder="Ej. Carlos García" value={form.emergencyContact.name} onChange={e => setEcontact('name', e.target.value)} />
                    <Select name="emergencyRelation" label="Parentesco" options={RELATION_OPTIONS} placeholder="Seleccionar..." value={form.emergencyContact.relation} onChange={v => setEcontact('relation', String(v))} />
                    <Field name="emergencyPhone" label="Teléfono" placeholder="Ej. 0414-9876543" value={form.emergencyContact.phone} onChange={e => setEcontact('phone', e.target.value)} />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-primary-200 shadow-sm p-6">
                <SectionHeader icon={FaNotesMedical} title="Antecedentes de Salud" subtitle="Información clínica relevante para el expediente" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-sm text-primary-700 px-1">Alergias conocidas</label>
                        <textarea className="w-full bg-primary-100 border border-primary-300 rounded-md px-4 py-2 text-sm text-primary-900 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-60/10 focus:border-primary-60/40 hover:border-primary-60/60 transition-all resize-none h-24" placeholder="Ej. Penicilina, látex, mariscos..." value={form.allergies} onChange={e => set('allergies', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-sm text-primary-700 px-1">Enfermedades crónicas</label>
                        <textarea className="w-full bg-primary-100 border border-primary-300 rounded-md px-4 py-2 text-sm text-primary-900 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-60/10 focus:border-primary-60/40 hover:border-primary-60/60 transition-all resize-none h-24" placeholder="Ej. Diabetes tipo 2, hipertensión..." value={form.chronicDiseases} onChange={e => set('chronicDiseases', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-sm text-primary-700 px-1">Medicamentos actuales</label>
                        <textarea className="w-full bg-primary-100 border border-primary-300 rounded-md px-4 py-2 text-sm text-primary-900 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-60/10 focus:border-primary-60/40 hover:border-primary-60/60 transition-all resize-none h-24" placeholder="Ej. Metformina 850mg, Losartán 50mg..." value={form.currentMedications} onChange={e => set('currentMedications', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-sm text-primary-700 px-1">Cirugías previas</label>
                        <textarea className="w-full bg-primary-100 border border-primary-300 rounded-md px-4 py-2 text-sm text-primary-900 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-60/10 focus:border-primary-60/40 hover:border-primary-60/60 transition-all resize-none h-24" placeholder="Ej. Apendicectomía 2015..." value={form.previousSurgeries} onChange={e => set('previousSurgeries', e.target.value)} />
                    </div>
                    <Select name="smokingStatus" label="Tabaquismo" options={SMOKING} placeholder="Seleccionar..." value={form.smokingStatus} onChange={v => set('smokingStatus', String(v))} />
                    <Select name="alcoholUse" label="Consumo de alcohol" options={ALCOHOL} placeholder="Seleccionar..." value={form.alcoholUse} onChange={v => set('alcoholUse', String(v))} />
                </div>
            </div>

            {/* SOLO SE MUESTRA SI ES LA RECEPCIONISTA QUIEN LO USA */}
            {role === 'receptionist' && (
                <div className="bg-white rounded-xl border border-primary-200 shadow-sm p-6">
                    <SectionHeader icon={FaUserLock} title="Vincular a Usuario Preexistente" subtitle="Selecciona un usuario preexistente o crea uno nuevo" />
                    <div className="space-y-4">
                        <CheckBox name="linkExistingUser" label="Vincular a usuario preexistente" variant="switch" checked={form.linkExistingUser} onChange={e => set('linkExistingUser', e.target.checked)} />
                        {form.linkExistingUser ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-primary-100 mt-2 animate-fade-in">
                                <div className="flex flex-col gap-1 w-full">
                                    <SearchableSelect
                                        name="selectedUserId"
                                        options={users.map(u => ({ value: u.id, label: `${u.name} - ${u.ci}` }))}
                                        value={form.selectedUserId || ""}
                                        onChange={v => set('selectedUserId', Number(v))}
                                        placeholder={isLoadingUsers ? "Cargando usuarios..." : "Buscar usuario por nombre o CI"}
                                        label="Seleccionar Usuario *"
                                    />
                                    {errors.selectedUserId && <p className="text-xs text-error mt-1">{errors.selectedUserId}</p>}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-primary-100 mt-2 animate-fade-in">
                                <div className="flex flex-col gap-1 w-full">
                                    <Field name="tempPassword" label="Contraseña temporal para nuevo usuario *" type="password" showTogglePassword placeholder="Mín. 8 caracteres" value={form.tempPassword} onChange={e => set('tempPassword', e.target.value)} />
                                    {errors.tempPassword && <p className="text-xs text-error mt-1">{errors.tempPassword}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pb-4">
                {globalError && (
                    <p className="text-sm text-error font-medium mr-auto flex items-center gap-1">
                        <FaCircleExclamation />
                        {globalError}
                    </p>
                )}

                {/* Botones dinámicos según el rol */}
                {role === 'receptionist' && <Button variant={ButtonTheme.GHOST} label="Limpiar formulario" onClick={handleReset} />}

                <Button
                    variant={ButtonTheme.PRIMARY}
                    label={isSaving ? 'Guardando...' : role === 'pacient' ? 'Completar mi perfil' : 'Registrar paciente'}
                    loading={isSaving}
                    onClick={handleSave}
                />
            </div>

            <Modal isOpen={isSuccessOpen} onClose={() => {
                closeSuccess();
                if (onSuccessCallback && createdPatientId !== null) {
                    onSuccessCallback(createdPatientId);
                }
            }} title={role === 'pacient' ? "¡Perfil Completado!" : "Paciente registrado"}>
                <div className="space-y-4 text-sm text-primary-800">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <FaUserCheck className="text-success text-xl" />
                        </div>
                        <div>
                            <p className="font-bold text-base">{form.firstName} {form.lastName}</p>
                            <p className="text-cool-gray-50">CI: {form.ci}</p>
                        </div>
                    </div>

                    <p>
                        {role === 'pacient'
                            ? "Tus datos médicos se han guardado exitosamente. Ya puedes utilizar todas las funciones del portal."
                            : "El paciente ha sido registrado exitosamente en el sistema. Puede agendar una cita para esta visita desde la agenda."}
                    </p>

                    <div className="flex justify-end gap-2 pt-2 border-t border-primary-100">
                        {role === 'receptionist' ? (
                            <>
                                <Button label="Registrar otro" variant={ButtonTheme.SECONDARY} size="sm" onClick={() => { closeSuccess(); handleReset() }} />
                                <Button label="Agendar cita" variant={ButtonTheme.PRIMARY} size="sm" onClick={() => window.location.href = window.location.pathname.replace('/register-patient', '/appointments')} />
                            </>
                        ) : (
                            <Button label="Ir a mi inicio" variant={ButtonTheme.PRIMARY} size="sm" onClick={() => {
                                closeSuccess();
                                if (onSuccessCallback && createdPatientId !== null) {
                                    onSuccessCallback(createdPatientId);
                                }
                            }} />
                        )}
                    </div>
                </div>
            </Modal>

        </div>
    )
}
export default RegisterPatientForm;