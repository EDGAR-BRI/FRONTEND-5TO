import React, { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/react/primary/DataTable';
import { Badge } from '@/components/react/primary/Badge';
import EditUserModalTrigger from '@/components/react/admin/EditUserModalTrigger';
import CreateUserModalTrigger from '@/components/react/admin/CreateUserModalTrigger';
import { StatsCard } from '@/components/react/primary/StatsCard';
import { LuSearch, LuUsers, LuChevronDown, LuUserCheck, LuUserX, LuStethoscope } from 'react-icons/lu';
import type { User, UserRole, UserStatus } from '@/types/User';
import { Select } from '../primary/Select';
import { Field } from '../primary/Field';
import { api } from '@/lib/api';

const ALL_ROLES: (UserRole | 'TODOS')[] = ['TODOS', 'ADMIN', 'DOCTOR', 'RECEPCIONISTA', 'PACIENTE'];

const statusBadgeStyles = (status: UserStatus) => {
    if (status === 'ACTIVO') return { bg: 'bg-primary-200/30', text: 'text-primary-700', border: 'border-primary-300' };
    return { bg: 'bg-error/15', text: 'text-error', border: 'border-error/20' };
};

const roleBadgeStyles = (role: UserRole) => {
    switch (role) {
        case 'ADMIN': return { bg: 'bg-primary-100', text: 'text-primary-800', border: 'border-primary-600', borderWidth: 'border-2', font: 'font-bold' };
        case 'DOCTOR': return { bg: 'bg-primary-100', text: 'text-primary-600', border: 'border-primary-400', font: 'font-semibold' };
        case 'RECEPCIONISTA': return { bg: 'bg-primary-50', text: 'text-primary-500', border: 'border-primary-300' };
        default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
    }
};

const columns: Column<User>[] = [
    { header: 'ID', accessorKey: 'id', align: 'left' },
    {
        header: 'Nombre / Correo',
        cell: (item) => (
            <div className="flex flex-col">
                <span className="text-primary-900 font-medium">{item.name}</span>
                <span className="text-xs text-primary-700">{item.email}</span>
            </div>
        ),
    },
    {
        header: 'Rol',
        align: 'center',
        cell: (item) => <Badge styles={roleBadgeStyles(item.role)}>{item.role}</Badge>,
    },
    {
        header: 'Estado',
        align: 'center',
        cell: (item) => <Badge styles={statusBadgeStyles(item.status)}>{item.status}</Badge>,
    },
    {
        header: 'Acciones',
        align: 'center',
        cell: (item) => (
            <div className="flex justify-center gap-3">
                <EditUserModalTrigger user={item} />
                <button className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors">
                    Eliminar
                </button>
            </div>
        ),
    },
];

export default function UsersDashboard() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'TODOS'>('TODOS');
    const [summary, setSummary] = useState({ total: 0, activos: 0, inactivos: 0, doctores: 0 });

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await api('/admin/users-summary', { method: 'GET' });
                if (!res.ok) return;
                const json = await res.json();
                const data = (json && typeof json === 'object' && 'data' in json) ? (json as any).data : json;
                if (mounted) setSummary(data);
            } catch {
                // ignore
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (roleFilter !== 'TODOS') params.set('role', roleFilter);
    const endpoint = `/admin/users${params.toString() ? `?${params.toString()}` : ''}`;

    return (
        <div className="space-y-6">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Usuarios"
                    value={summary.total}
                    color="primary"
                    icon={<LuUsers size={18} />}
                    variant="compact"
                />
                <StatsCard
                    title="Usuarios Activos"
                    value={summary.activos}
                    color="success"
                    icon={<LuUserCheck size={18} />}
                    variant="compact"
                />
                <StatsCard
                    title="Usuarios Inactivos"
                    value={summary.inactivos}
                    color="danger"
                    icon={<LuUserX size={18} />}
                    variant="compact"
                />
                <StatsCard
                    title="Médicos"
                    value={summary.doctores}
                    color="primary"
                    icon={<LuStethoscope size={18} />}
                    variant="compact"
                />
            </div>

            <section className="bg-primary-700 rounded-lg border border-primary-400 overflow-hidden">

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                            <LuUsers size={18} className="text-white" />
                        </div>
                        <div className='min-w-0'>
                            <h2 className="text-base font-semibold text-white leading-tight">Usuarios del Sistema</h2>
                            <p className="text-xs text-primary-200 mt-0.5">Administra accesos, roles y estados del personal.</p>
                        </div>
                    </div>
                    <div className='shrink-0"'>
                        <CreateUserModalTrigger />
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="px-6 py-3 flex flex-wrap gap-3 items-center">

                    {/* Search */}
                    <div className="relative flex-1 min-w-[180px] max-w-sm">
                        <Field
                            name='search'
                            type="text"
                            placeholder="Buscar por nombre o correo..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Role filter select */}
                    <div className="relative min-w-[180px] flex-1 sm:flex-none">
                        <Select

                            value={roleFilter}
                            onChange={value => setRoleFilter(value as UserRole | 'TODOS')}
                            options={ALL_ROLES.map(role => ({ value: role, label: role }))}
                        >
                        </Select>
                    </div>
                </div>

                <DataTable<User>
                    className="rounded-none! border-none!"
                    endpoint={endpoint}
                    columns={columns}
                />
            </section>
        </div>
    );
}
