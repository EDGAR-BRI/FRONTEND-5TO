import { useEffect, useMemo, useState } from 'react';
import { DataTable, type Column } from '@/components/react/primary/DataTable';
import { Badge } from '@/components/react/primary/Badge';
import EditUserModalTrigger from '@/components/react/admin/EditUserModalTrigger';
import CreateUserModalTrigger from '@/components/react/admin/CreateUserModalTrigger';
import { StatsCard } from '@/components/react/primary/StatsCard';
import { FaUsers, FaUserCheck, FaUserXmark, FaStethoscope } from 'react-icons/fa6';
import type { User, UserRole, UserStatus } from '@/types/User';
import { Select } from '../primary/Select';
import { Field } from '../primary/Field';
import { listAdminRoles, listAdminUsers } from '@/lib/services/admin/admin.service';

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

export default function UsersDashboard() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'TODOS'>('TODOS');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [roleOptions, setRoleOptions] = useState<Array<{ value: number; label: string }>>([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const [usersData, rolesData] = await Promise.all([
                    listAdminUsers(),
                    listAdminRoles(),
                ]);

                if (!mounted) return;

                setUsers(usersData.map((user) => ({
                    id: user.id,
                    ci: user.ci,
                    name: user.name,
                    roleId: user.roleId,
                    role: user.role,
                    status: user.status,
                })));

                setRoleOptions(
                    rolesData.map((role) => ({
                        value: role.id,
                        label: `${role.name} (${role.code})`,
                    }))
                );
            } catch {
                if (mounted) {
                    setUsers([]);
                    setRoleOptions([]);
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const filteredUsers = useMemo(() => {
        const byRole = roleFilter === 'TODOS'
            ? users
            : users.filter((user) => user.role === roleFilter);

        if (!search.trim()) return byRole;

        const term = search.toLowerCase();
        return byRole.filter((user) =>
            user.name.toLowerCase().includes(term) ||
            user.ci.toLowerCase().includes(term)
        );
    }, [users, roleFilter, search]);

    const summary = useMemo(() => {
        const total = users.length;
        const activos = users.filter((user) => user.status === 'ACTIVO').length;
        const inactivos = users.filter((user) => user.status === 'INACTIVO').length;
        const doctores = users.filter((user) => user.role === 'DOCTOR').length;

        return { total, activos, inactivos, doctores };
    }, [users]);

    const reloadUsers = async () => {
        setIsLoading(true);
        try {
            const usersData = await listAdminUsers();
            setUsers(usersData.map((user) => ({
                id: user.id,
                ci: user.ci,
                name: user.name,
                roleId: user.roleId,
                role: user.role,
                status: user.status,
            })));
        } finally {
            setIsLoading(false);
        }
    };

    const columns: Column<User>[] = [
        { header: 'ID', accessorKey: 'id', align: 'left' },
        {
            header: 'Nombre / Cédula',
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-primary-900 font-medium">{item.name}</span>
                    <span className="text-xs text-primary-700">CI: {item.ci}</span>
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
                    <EditUserModalTrigger
                        user={item}
                        roleOptions={roleOptions}
                        onUpdated={reloadUsers}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Usuarios"
                    value={summary.total}
                    color="primary"
                    icon={<FaUsers size={18} />}
                    variant="compact"
                />
                <StatsCard
                    title="Usuarios Activos"
                    value={summary.activos}
                    color="success"
                    icon={<FaUserCheck size={18} />}
                    variant="compact"
                />
                <StatsCard
                    title="Usuarios Inactivos"
                    value={summary.inactivos}
                    color="danger"
                    icon={<FaUserXmark size={18} />}
                    variant="compact"
                />
                <StatsCard
                    title="Médicos"
                    value={summary.doctores}
                    color="primary"
                    icon={<FaStethoscope size={18} />}
                    variant="compact"
                />
            </div>

            <section className="bg-primary-700 rounded-lg border border-primary-400 overflow-hidden">

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                            <FaUsers size={18} className="text-white" />
                        </div>
                        <div className='min-w-0'>
                            <h2 className="text-base font-semibold text-white leading-tight">Usuarios del Sistema</h2>
                            <p className="text-xs text-primary-200 mt-0.5">Administra accesos, roles y estados del personal.</p>
                        </div>
                    </div>
                    <div className='shrink-0'>
                        <CreateUserModalTrigger
                            roleOptions={roleOptions}
                            onCreated={reloadUsers}
                        />
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="px-6 py-3 flex flex-wrap gap-3 items-center">

                    {/* Search */}
                    <div className="relative flex-1 min-w-45 max-w-sm">
                        <Field
                            name='search'
                            type="text"
                            placeholder="Buscar por nombre o cédula..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Role filter select */}
                    <div className="relative min-w-45 flex-1 sm:flex-none">
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
                    endpoint=""
                    data={filteredUsers}
                    columns={columns}
                    isLoading={isLoading}
                />
            </section>
        </div>
    );
}
