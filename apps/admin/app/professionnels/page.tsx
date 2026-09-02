'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, Check, X, EllipsisVertical, Loader2, Pencil } from 'lucide-react';
import { useAdminUsers, type AdminUser } from '@/apps/admin/hooks/useAdminUsers';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/apps/admin/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/apps/admin/components/ui/dialog';
import { Input } from '@/apps/admin/components/ui/input';
import { Label } from '@/apps/admin/components/ui/label';
import { Button } from '@/apps/admin/components/ui/button';

export default function Professionnels() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tous');
    const [currentPage, setCurrentPage] = useState(1);
    const { users, loading, error, validateUser, suspendUser, reactivateUser, updateUserRemise } = useAdminUsers();
    const t = useTranslations('admin.professionals');
    const searchParams = useSearchParams();

    useEffect(() => {
        const q = searchParams.get('q');
        if (q) setSearchTerm(q);
    }, [searchParams]);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [tempRemise, setTempRemise] = useState<string>('0');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleModifyDiscount = (user: AdminUser) => {
        setSelectedUser(user);
        setTempRemise((user.remise || 0).toString());
        setModalOpen(true);
    };

    const confirmModifyDiscount = async () => {
        if (!selectedUser) return;
        const newRemise = parseFloat(tempRemise);
        if (!isNaN(newRemise) && newRemise >= 0 && newRemise <= 100) {
            setIsUpdating(true);
            try {
                await updateUserRemise(selectedUser.id, newRemise);
                setModalOpen(false);
            } catch {
                alert('Erreur lors de la modification de la remise');
            } finally {
                setIsUpdating(false);
            }
        } else {
            alert('Veuillez entrer un nombre valide entre 0 et 100');
        }
    };
    const itemsPerPage = 5;

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'Tous' || user.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [users, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUsers, currentPage]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-[#523A28] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
                {t('error', { error })}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl text-gray-900 mb-2">{t('title')}</h1>
                <p className="text-gray-600">{t('subtitle', { count: users.length })}</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('search.placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28] text-gray-900 bg-white"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28] text-gray-900 bg-white"
                    >
                        <option value="Tous">{t('filters.allStatuses')}</option>
                        <option value="Validé">{t('filters.validated')}</option>
                        <option value="En attente">{t('filters.pending')}</option>
                        <option value="Suspendu">{t('filters.suspended')}</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-600 mb-1">{t('stats.total')}</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-600 mb-1">{t('stats.validated')}</p>
                    <p className="text-2xl font-bold text-green-600">
                        {users.filter((u) => u.status === 'Validé').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-600 mb-1">{t('stats.pending')}</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {users.filter((u) => u.status === 'En attente').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-600 mb-1">{t('stats.suspended')}</p>
                    <p className="text-2xl font-bold text-red-600">
                        {users.filter((u) => u.status === 'Suspendu').length}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">{t('table.professional')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">{t('table.company')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">{t('table.siret')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">{t('table.status')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">{t('table.discount')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">{t('table.registrationDate')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        {t('table.noResults')}
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{user.company}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.siret}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${user.status === 'Validé'
                                                    ? 'bg-green-100 text-green-700'
                                                    : user.status === 'En attente'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{user.remise}%</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.createdAt}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-gray-100">
                                                            <span className="sr-only">Open menu</span>
                                                            <EllipsisVertical className="h-5 w-5 text-gray-600" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[200px]">
                                                        <DropdownMenuLabel>{t('table.actions')}</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/admin/professionnels/${user.id}`}
                                                                className="flex items-center"
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                {t('actions.view')}
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem onClick={() => handleModifyDiscount(user)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            {t('actions.modifyDiscount') || 'Modifier remise'}
                                                        </DropdownMenuItem>

                                                        {user.status === 'En attente' && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => validateUser(user.id)} className="text-green-600 focus:text-green-600">
                                                                    <Check className="mr-2 h-4 w-4" />
                                                                    {t('actions.validate')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => suspendUser(user.id)} className="text-red-600 focus:text-red-600">
                                                                    <X className="mr-2 h-4 w-4" />
                                                                    {t('actions.reject')}
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}

                                                        {user.status === 'Validé' && (
                                                            <DropdownMenuItem onClick={() => suspendUser(user.id)} className="text-red-600 focus:text-red-600">
                                                                <X className="mr-2 h-4 w-4" />
                                                                {t('actions.suspend')}
                                                            </DropdownMenuItem>
                                                        )}

                                                        {user.status === 'Suspendu' && (
                                                            <DropdownMenuItem onClick={() => reactivateUser(user.id)} className="text-green-600 focus:text-green-600">
                                                                <Check className="mr-2 h-4 w-4" />
                                                                {t('actions.reactivate') || 'Réactiver'}
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Page {currentPage} sur {totalPages} ({filteredUsers.length} résultats)
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Précédent
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Discount Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('actions.modifyDiscount')}</DialogTitle>
                        <DialogDescription>
                            {selectedUser?.name} ({selectedUser?.company})
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="remise">
                                {t('table.discount')}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="remise"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={tempRemise}
                                    onChange={(e) => setTempRemise(e.target.value)}
                                    className="pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">%</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isUpdating}>
                            {t('auth.register.btn_cancel') || 'Annuler'}
                        </Button>
                        <Button onClick={confirmModifyDiscount} disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (t('settings.saveChanges') || 'Enregistrer')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
