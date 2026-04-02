import { useState } from 'react'
import { DataTable } from '@/components/react/primary/DataTable'
import type { Column } from '@/components/react/primary/DataTable'
import { Badge } from '@/components/react/primary/Badge'
import { Button, ButtonTheme } from '@/components/react/primary/Button'
import type { IconType } from 'react-icons'
import {
    FaBuildingColumns,
    FaCircleCheck,
    FaClock,
    FaCoins,
    FaCreditCard,
    FaDollarSign,
    FaEllipsis,
    FaMagnifyingGlass,
    FaMoneyBillWave,
} from 'react-icons/fa6'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Payment {
    id: string
    patient: string
    time: string
    method: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Otro'
    amount: number
    currency: 'USD' | 'Bs'
    status: 'Completado' | 'Pendiente' | 'Anulado'
    doctor?: string
}

// ─── Badge helpers ─────────────────────────────────────────────────────────────
const statusBadge = (status: Payment['status']) => {
    const map = {
        Completado: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
        Pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
        Anulado: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    }
    return <Badge styles={map[status]}>{status}</Badge>
}

const methodIcon = (method: Payment['method']) => {
    const icons: Record<Payment['method'], IconType> = {
        Efectivo: FaMoneyBillWave,
        Transferencia: FaBuildingColumns,
        Tarjeta: FaCreditCard,
        Otro: FaEllipsis,
    }

    const Icon = icons[method]

    return (
        <span className="inline-flex items-center gap-2 text-primary-700">
            <Icon className="text-xs text-primary-500" />
            {method}
        </span>
    )
}

// ─── Column definitions ────────────────────────────────────────────────────────
const columns: Column<Payment>[] = [
    {
        header: 'Paciente',
        cell: (p) => (
            <div className="flex flex-col">
                <span className="font-semibold text-primary-900">{p.patient}</span>
                <span className="text-xs text-cool-gray-50">{p.time}</span>
            </div>
        ),
    },
    {
        header: 'Médico',
        cell: (p) => (
            <span className="text-sm text-primary-700">{p.doctor ?? '—'}</span>
        ),
    },
    {
        header: 'Método',
        cell: (p) => methodIcon(p.method),
    },
    {
        header: 'Monto',
        align: 'right',
        cell: (p) => (
            <span className="font-semibold text-primary-900 tabular-nums">
                {p.currency === 'USD' ? '$' : 'Bs.'}{p.amount.toFixed(2)}
            </span>
        ),
    },
    {
        header: 'Estado',
        align: 'center',
        cell: (p) => statusBadge(p.status),
    },
    {
        header: 'Acciones',
        align: 'center',
        cell: (p) => (
            <Button
                label="Ver recibo"
                size="sm"
                variant={ButtonTheme.GHOST}
                onClick={() => alert(`Recibo de ${p.id}`)}
            />
        ),
    },
]

// ─── Summary stat mini-card ────────────────────────────────────────────────────
function SumCard({ icon: Icon, label, value, color }: { icon: IconType; label: string; value: string; color: string }) {
    return (
        <div className={`bg-white rounded-xl border border-primary-200 p-4 flex items-center gap-4 shadow-sm`}>
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                <Icon className="text-base" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-cool-gray-50 font-medium truncate">{label}</p>
                <p className="text-xl font-bold text-primary-900">{value}</p>
            </div>
        </div>
    )
}

// ─── Main component ────────────────────────────────────────────────────────────
interface PaymentsTableProps {
    payments: Payment[]
}

export default function PaymentsTable({ payments }: PaymentsTableProps) {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<Payment['status'] | 'TODOS'>('TODOS')

    const filtered = payments.filter(p => {
        const matchSearch = search === '' ||
            p.patient.toLowerCase().includes(search.toLowerCase()) ||
            p.id.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'TODOS' || p.status === statusFilter
        return matchSearch && matchStatus
    })

    // Summary stats
    const totalUSD = payments.filter(p => p.currency === 'USD' && p.status === 'Completado').reduce((s, p) => s + p.amount, 0)
    const totalBs = payments.filter(p => p.currency === 'Bs' && p.status === 'Completado').reduce((s, p) => s + p.amount, 0)
    const pending = payments.filter(p => p.status === 'Pendiente').length
    const completed = payments.filter(p => p.status === 'Completado').length

    return (
        <div className="space-y-5">

            {/* ── Summary mini-cards ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SumCard icon={FaDollarSign} label="Recaudado (USD)" value={`$${totalUSD.toFixed(2)}`} color="bg-green-100 text-green-600" />
                <SumCard icon={FaCoins} label="Recaudado (Bs)" value={`Bs.${totalBs.toFixed(2)}`} color="bg-primary-200 text-primary-600" />
                <SumCard icon={FaCircleCheck} label="Completados" value={String(completed)} color="bg-emerald-100 text-emerald-600" />
                <SumCard icon={FaClock} label="Pendientes" value={String(pending)} color="bg-yellow-100 text-yellow-600" />
            </div>

            {/* ── Table card ────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-primary-200 shadow-sm overflow-hidden">

                {/* Header + filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-primary-100">
                    <div className="flex items-center gap-2 flex-1">
                        <div className="relative flex-1 max-w-sm">
                            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 text-xs pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Buscar paciente o ID..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-sm bg-primary-100 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {(['TODOS', 'Completado', 'Pendiente', 'Anulado'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s as any)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${statusFilter === s
                                        ? 'bg-primary-700 text-white border-primary-700'
                                        : 'bg-white text-primary-700 border-primary-200 hover:bg-primary-50'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* DataTable */}
                <DataTable<Payment>
                    endpoint=""
                    data={filtered}
                    columns={columns}
                    className="rounded-none! border-0! shadow-none!"
                />

                {/* Footer count */}
                <div className="px-5 py-2.5 border-t border-primary-100 bg-primary-50/50 text-xs text-cool-gray-50">
                    Mostrando <span className="font-semibold text-primary-700">{filtered.length}</span> de {payments.length} pagos
                </div>
            </div>

        </div>
    )
}
