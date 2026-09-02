'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Package, Mail, Phone, MapPin, CreditCard, Calendar, User, Building2 } from 'lucide-react';
import { useAdminOrder } from '@/apps/admin/hooks/useAdminOrder';

const statusColors: Record<string, string> = {
    payee: 'bg-green-100 text-green-700',
    en_attente: 'bg-yellow-100 text-yellow-700',
    retard: 'bg-red-100 text-red-700',
    livree: 'bg-[#523A28]/10 text-[#523A28]',
    annulee: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<string, string> = {
    payee: 'Payée',
    en_attente: 'En attente',
    retard: 'En retard',
    livree: 'Livrée',
    annulee: 'Annulée',
};

export default function CommandeDetail() {
    const params = useParams();
    const id = params.id as string;
    const { order, loading, error } = useAdminOrder(id);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-[#523A28] animate-spin" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="space-y-4">
                <Link href="/admin/commandes" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Retour aux commandes
                </Link>
                <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
                    {error || 'Commande introuvable'}
                </div>
            </div>
        );
    }

    const statusColor = statusColors[order.status] || 'bg-gray-100 text-gray-700';
    const statusLabel = statusLabels[order.status] || order.status;
    const currencySymbol = order.currency === 'PEN' ? 'PEN' : '€';

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <Link href="/admin/commandes" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Retour aux commandes
                </Link>
                <span className={`px-4 py-2 text-sm font-bold uppercase rounded-full ${statusColor}`}>
                    {statusLabel}
                </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Commande #{order.id.slice(0, 12)}</h1>
                        <p className="text-gray-400 font-mono text-xs">REF: {order.id}</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-center">
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Source</p>
                            <p className="text-sm font-bold text-[#523A28] uppercase">{order.source}</p>
                        </div>
                        <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-center">
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Articles</p>
                            <p className="text-sm font-bold text-gray-900">{order.itemsCount}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                            <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-[#523A28]" />
                                    Articles commandés
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {order.lines.length === 0 ? (
                                    <p className="p-6 text-gray-400 text-center">Aucun article trouvé.</p>
                                ) : (
                                    order.lines.map((line, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                {line.image ? (
                                                    <img src={line.image} alt={line.name || ''} className="w-full h-full object-contain rounded-lg" />
                                                ) : (
                                                    <Package className="w-5 h-5 text-gray-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 text-sm truncate">{line.name || line.reference || 'Article'}</p>
                                                {line.reference && <p className="text-xs text-gray-400">REF: {line.reference}</p>}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">x{line.quantity}</p>
                                                <p className="text-xs text-gray-500">
                                                    {((line.unitPriceHT ?? line.prixHT ?? 0)).toFixed(2)} {currencySymbol}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Récapitulatif</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Montant HT</span>
                                    <span className="font-medium text-gray-900">{order.amountHT.toFixed(2)} {currencySymbol}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">TVA</span>
                                    <span className="font-medium text-gray-900">{(order.amountTTC - order.amountHT).toFixed(2)} {currencySymbol}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-100">
                                    <span className="text-gray-900">Total TTC</span>
                                    <span className="text-[#523A28]">{order.amountTTC.toFixed(2)} {currencySymbol}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Informations</h2>
                            <div className="space-y-5">
                                <div className="flex items-start gap-3">
                                    <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Client</p>
                                        <p className="text-sm font-medium text-gray-900">{order.client}</p>
                                    </div>
                                </div>

                                {order.clientSociete && (
                                    <div className="flex items-start gap-3">
                                        <Building2 className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Société</p>
                                            <p className="text-sm font-medium text-gray-900">{order.clientSociete}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Email</p>
                                        <p className="text-sm font-medium text-gray-900 truncate">{order.clientEmail}</p>
                                    </div>
                                </div>

                                {order.clientPhone && (
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Téléphone</p>
                                            <p className="text-sm font-medium text-gray-900">{order.clientPhone}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Date</p>
                                        <p className="text-sm font-medium text-gray-900">{order.date}</p>
                                    </div>
                                </div>

                                {order.paymentProvider && (
                                    <div className="flex items-start gap-3">
                                        <CreditCard className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Paiement</p>
                                            <p className="text-sm font-medium text-gray-900 capitalize">{order.paymentProvider}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {(order.shippingAddress || order.shippingCity) && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-[#523A28]" />
                                    Livraison
                                </h2>
                                <div className="text-sm text-gray-600 space-y-1">
                                    {order.shippingAddress && <p>{order.shippingAddress}</p>}
                                    {(order.shippingPostalCode || order.shippingCity) && (
                                        <p>{[order.shippingPostalCode, order.shippingCity].filter(Boolean).join(' ')}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
