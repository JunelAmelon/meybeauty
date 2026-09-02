'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Tag, Info, Loader2, Edit, Trash2, Globe, Sparkles, BookOpen } from 'lucide-react';
import { useAdminProduct, useAdminProducts } from '@/apps/admin/hooks/useAdminProducts';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/apps/admin/components/ui/tabs';

export default function ProductDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { product, loading: productLoading, error } = useAdminProduct(id);
    const { deleteProduct } = useAdminProducts();
    const t = useTranslations('admin.products');

    const locales = [
        { id: 'fr', label: 'Français' },
        { id: 'en', label: 'English' },
        { id: 'es-PE', label: 'Español' }
    ];

    const handleDelete = async () => {
        if (!product) return;
        if (window.confirm(t('confirmDelete', { name: product.name }))) {
            try {
                await deleteProduct(product.id);
                router.push('/admin/produits');
            } catch {
                alert(t('deleteError'));
            }
        }
    };

    if (productLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-[#523A28] animate-spin" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
                {error || 'Produit introuvable'}
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href="/admin/produits"
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t('backToList') || 'Retour aux produits'}
                </Link>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/admin/produits?edit=${product.id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#523A28] text-white rounded-lg hover:bg-[#3A2819] transition-all shadow-sm hover:shadow-md"
                    >
                        <Edit className="w-4 h-4" />
                        Modifier
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-all border border-red-100 shadow-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-72 h-72 bg-[#f8f9f8] rounded-2xl relative overflow-hidden border border-gray-50 flex-shrink-0 group">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                                    unoptimized
                                />
                            </div>
                            <div className="flex-grow pt-2">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-[#f0f4f1] text-[#523A28] text-xs font-bold rounded-full uppercase tracking-wider">
                                        {product.categoryLabel}
                                    </span>
                                    <span
                                        className={`px-3 py-1 text-xs font-bold uppercase rounded-full shadow-sm ${product.stock > 0
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {product.stock > 0 ? t('status.active') : t('status.outOfStock')}
                                    </span>
                                    {product.stock > 0 && product.stock < 10 && (
                                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase">
                                            Stock Faible
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
                                <p className="text-gray-400 font-mono text-xs mb-8">REF: {product.id}</p>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest">Prix de vente</p>
                                        <p className="text-2xl font-black text-[#523A28]">{product.price.toFixed(2)} €</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest">Unités en stock</p>
                                        <p className={`text-2xl font-black ${product.stock > 0 ? (product.stock < 10 ? 'text-amber-500' : 'text-gray-900') : 'text-red-600'}`}>
                                            {product.stock}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-[#523A28]" />
                                {t('detail.title') || 'Détails & Traductions'}
                            </h2>
                        </div>
                        <div className="p-8">
                            <Tabs defaultValue="fr" className="w-full">
                                <TabsList className="bg-gray-100/50 p-1 mb-8">
                                    {locales.map(l => (
                                        <TabsTrigger key={l.id} value={l.id} className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            {l.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {locales.map(l => {
                                    const tr = product.translations?.[l.id] || {};
                                    return (
                                        <TabsContent key={l.id} value={l.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-black uppercase tracking-widest text-[#523A28] flex items-center gap-2">
                                                    <Info className="w-4 h-4" />
                                                    {t('detail.presentation') || 'Présentation'}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-2">
                                                        <p className="text-xs font-bold text-gray-400">Nom ({l.id})</p>
                                                        <p className="text-gray-900 font-medium">{tr.name || '---'}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-xs font-bold text-gray-400">Catégorie ({l.id})</p>
                                                        <p className="text-gray-900 font-medium">{tr.category || '---'}</p>
                                                    </div>
                                                </div>
                                                <div className="pt-4 space-y-2">
                                                    <p className="text-xs font-bold text-gray-400">Description courte</p>
                                                    <p className="text-gray-600 leading-relaxed italic border-l-4 border-[#523A28]/20 pl-4">{tr.desc || '---'}</p>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-50 space-y-4">
                                                <h3 className="text-sm font-black uppercase tracking-widest text-[#523A28] flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4" />
                                                    {t('form.longDescLabel') || 'Description Détaillée'}
                                                </h3>
                                                <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                    {tr.long_desc || 'Aucune description détaillée disponible.'}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-black uppercase tracking-widest text-[#523A28] flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4" />
                                                        {t('form.usageLabel') || 'Conseils d\'utilisation'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                                                        {tr.usage || 'Non renseigné.'}
                                                    </p>
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-black uppercase tracking-widest text-[#523A28] flex items-center gap-2">
                                                        <Tag className="w-4 h-4" />
                                                        {t('form.ingredientLabel') || 'Ingrédient de base'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                                                        {tr.ingredient_base || 'Non renseigné.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    );
                                })}
                            </Tabs>
                        </div>
                    </div>
                </div>

                {/* Sidebar stats/info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 font-black uppercase tracking-tight">{t('detail.characteristics') || 'Caractéristiques'}</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3 text-gray-400 group-hover:text-[#523A28] transition-colors">
                                    <Package className="w-5 h-5" />
                                    <span className="text-xs font-bold uppercase tracking-wider">{t('form.volumeLabel')?.split(' (')[0] || 'Volume'}</span>
                                </div>
                                <span className="text-sm font-black text-gray-900">{product.volume || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3 text-gray-400 group-hover:text-[#523A28] transition-colors">
                                    <Tag className="w-5 h-5" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Slug ID</span>
                                </div>
                                <span className="text-sm font-black text-gray-900">{product.slug}</span>
                            </div>
                            <div className="flex items-center justify-between group pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Globe className="w-5 h-5" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Langues</span>
                                </div>
                                <div className="flex gap-1">
                                    {locales.map(l => (
                                        <span key={l.id} className="w-6 h-6 flex items-center justify-center bg-gray-100 text-[10px] font-black rounded text-gray-400 border border-gray-200 uppercase">
                                            {l.id.substring(0, 2)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#523A28] rounded-2xl p-8 text-white shadow-xl shadow-[#523A28]/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Package className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-2">{t('detail.stockValue') || 'Valeur du Stock'}</p>
                            <h3 className="text-3xl font-black mb-6">{(product.price * product.stock).toFixed(2)} €</h3>
                            <button
                                onClick={() => router.push(`/admin/produits?edit=${product.id}`)}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-sm font-bold transition-all border border-white/10"
                            >
                                {t('detail.updateInventory') || 'Mettre à jour l\'inventaire'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
