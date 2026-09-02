'use client';

import { useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';

export default function ReassortAuto() {
  const t = useTranslations('b2b.auto_reassort');

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md px-6">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-[#523A28]/10 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-[#523A28]" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('coming_soon_title')}
        </h1>
        <p className="text-gray-600 text-lg">
          {t('coming_soon_desc')}
        </p>
      </div>
    </div>
  );
}

// 'use client';

// import { useState } from 'react';
// import { useLocale, useTranslations } from 'next-intl';
// import { RotateCcw, Plus, Edit2, Trash2, Power, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
// import { useReassortB2B } from '../hooks/useReassortB2B';

// type FormMode = 'create' | 'edit';

// type FormState = {
//   productSlug: string;
//   threshold: number;
//   autoQty: number;
//   frequency: 'weekly' | 'bi_monthly' | 'monthly' | string;
//   nextRunAt: string;
// };

// export default function ReassortAuto() {
//   const t = useTranslations('b2b.auto_reassort');
//   const locale = useLocale();
//   const { configs, history, products, stats, loading, error, addConfig, updateConfig, deleteConfig, toggleActive } = useReassortB2B();
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [formMode, setFormMode] = useState<FormMode>('create');
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [form, setForm] = useState<FormState>({
//     productSlug: '',
//     threshold: 0,
//     autoQty: 0,
//     frequency: 'weekly',
//     nextRunAt: '',
//   });

//   const openCreate = () => {
//     setFormMode('create');
//     setEditingId(null);
//     setForm({
//       productSlug: '',
//       threshold: 0,
//       autoQty: 0,
//       frequency: 'weekly',
//       nextRunAt: '',
//     });
//     setShowAddModal(true);
//   };

//   const openEdit = (id: string) => {
//     const cfg = configs.find((c) => c.id === id);
//     if (!cfg) return;
//     setFormMode('edit');
//     setEditingId(id);
//     setForm({
//       productSlug: cfg.productSlug,
//       threshold: cfg.threshold,
//       autoQty: cfg.autoQty,
//       frequency: (cfg.frequency as FormState['frequency']) || 'weekly',
//       nextRunAt: cfg.nextRunAt || '',
//     });
//     setShowAddModal(true);
//   };

//   const formatFrequency = (code: string) => {
//     switch (code) {
//       case 'weekly':
//         return t('freq.weekly');
//       case 'bi_monthly':
//         return t('freq.bi_monthly');
//       case 'monthly':
//         return t('freq.monthly');
//       default:
//         return code;
//     }
//   };

//   const formatStatus = (status: string) => {
//     switch (status) {
//       case 'complete':
//         return { label: t('history.status_finished'), variant: 'green' };
//       case 'in_progress':
//         return { label: t('history.status_ongoing'), variant: 'blue' };
//       case 'cancelled':
//       default:
//         return { label: t('history.status_cancelled'), variant: 'gray' };
//     }
//   };


//   const formatDate = (value: string | null) => {
//     if (!value) return '-';
//     const d = new Date(value);
//     if (Number.isNaN(d.getTime())) return value;
//     return d.toLocaleDateString(locale);
//   };

//   const activeConfigs = stats.active;
//   const totalProductsMonitored = stats.monitored;

//   if (loading) {
//     return (
//       <div className="space-y-4 md:space-y-6">
//         <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
//           <div>
//             <h1 className="text-gray-900 mb-2 flex items-center gap-2 text-lg md:text-xl lg:text-2xl">
//               <RotateCcw className="w-6 h-6 md:w-7 md:h-7 text-orange-600" />
//               {t('title')}
//             </h1>
//             <p className="text-xs md:text-sm text-gray-600">{t('subtitle')}</p>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 text-center text-sm md:text-base text-gray-700">
//           {t('loading', { defaultMessage: 'Chargement...' })}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="space-y-4 md:space-y-6">
//         <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
//           <div>
//             <h1 className="text-gray-900 mb-2 flex items-center gap-2 text-lg md:text-xl lg:text-2xl">
//               <RotateCcw className="w-6 h-6 md:w-7 md:h-7 text-orange-600" />
//               {t('title')}
//             </h1>
//             <p className="text-xs md:text-sm text-gray-600">{t('subtitle')}</p>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl border border-red-200 p-4 md:p-6 text-center text-sm md:text-base text-red-700">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div className="flex-1 min-w-0">
//           <h1 className="text-gray-900 mb-2 flex items-center gap-2 text-lg md:text-xl lg:text-2xl">
//             <RotateCcw className="w-7 h-7 text-orange-600" />
//             {t('title')}
//           </h1>
//           <p className="text-gray-600 text-sm md:text-base">
//             {t('subtitle')}
//           </p>
//         </div>
//         <button
//           onClick={openCreate}
//           className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors w-full sm:w-auto justify-center"
//         >
//           <Plus className="w-5 h-5" />
//           <span className="truncate">{t('btn_new')}</span>
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white rounded-xl p-6 border border-gray-200">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
//               <RotateCcw className="w-5 h-5 text-orange-600" />
//             </div>
//             <div>
//               <p className="text-2xl text-gray-900">{activeConfigs}</p>
//               <p className="text-sm text-gray-600">{t('stats.active')}</p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-6 border border-gray-200">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-10 h-10 bg-[#523A28]/10 rounded-lg flex items-center justify-center">
//               <CheckCircle2 className="w-5 h-5 text-[#523A28]" />
//             </div>
//             <div>
//               <p className="text-2xl text-gray-900">{totalProductsMonitored}</p>
//               <p className="text-sm text-gray-600">{t('stats.monitored')}</p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-6 border border-gray-200">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
//               <Clock className="w-5 h-5 text-green-600" />
//             </div>
//             <div>
//               <p className="text-2xl text-gray-900">{stats.next7days}</p>
//               <p className="text-sm text-gray-600">{t('stats.next_7_days')}</p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-6 border border-gray-200">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
//               <AlertTriangle className="w-5 h-5 text-purple-600" />
//             </div>
//             <div>
//               <p className="text-2xl text-gray-900">{stats.thresholdReached}</p>
//               <p className="text-sm text-gray-600">{t('stats.threshold_reached')}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Configurations */}
//       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-gray-900">{t('configs.title')}</h2>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs text-gray-600">{t('configs.table.col_product')}</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-600">{t('configs.table.col_min_threshold')}</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-600">{t('configs.table.col_auto_qty')}</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-600">{t('configs.table.col_frequency')}</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-600">{t('configs.table.col_last_reassort')}</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-600">{t('configs.table.col_next')}</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-600">{t('configs.table.col_status')}</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-600">{t('configs.table.col_actions')}</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {configs.map((config) => (
//                 <tr key={config.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4">
//                     <div>
//                       <p className="text-sm text-gray-900">{config.productName}</p>
//                       <p className="text-xs text-gray-500">{config.reference}</p>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className="text-sm text-gray-900">
//                       {config.threshold} {t('units', { defaultMessage: 'unités' })}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className="text-sm text-gray-900">
//                       {config.autoQty} {t('units', { defaultMessage: 'unités' })}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className="text-sm text-gray-600">{formatFrequency(config.frequency)}</span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className="text-sm text-gray-600">
//                       {formatDate(config.lastRunAt)}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className="text-sm text-gray-900">{formatDate(config.nextRunAt)}</span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <button
//                       onClick={() => toggleActive(config.id, !config.active)}
//                       className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${config.active
//                         ? 'bg-green-100 text-green-700'
//                         : 'bg-gray-100 text-gray-600'
//                         }`}
//                     >
//                       <Power className="w-3 h-3" />
//                       {config.active ? t('configs.status_active') : t('configs.status_inactive')}
//                     </button>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => openEdit(config.id)}
//                         className="p-2 text-[#523A28] hover:bg-[#F5EDE4] rounded-lg transition-colors"
//                       >
//                         <Edit2 className="w-4 h-4" />
//                       </button>
//                       <button
//                         onClick={() => deleteConfig(config.id)}
//                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Historique */}
//       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-gray-900">{t('history.title')}</h2>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs text-gray-600">{t('history.table.col_ref')}</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-600">{t('history.table.col_date')}</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-600">{t('history.table.col_product')}</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-600">{t('history.table.col_qty')}</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-600">{t('history.table.col_amount')}</th>
//                 <th className="px-6 py-3 text-left text-xs text-gray-600">{t('history.table.col_status')}</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {history.map((item) => {
//                 const statusFmt = formatStatus(item.status);
//                 return (
//                   <tr key={item.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 text-sm text-gray-900">{item.id}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.date)}</td>
//                     <td className="px-6 py-4 text-sm text-gray-900">{item.productName}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
//                     <td className="px-6 py-4 text-sm text-gray-900">{item.amount.toFixed(2)} €</td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${statusFmt.variant === 'green'
//                           ? 'bg-green-100 text-green-700'
//                           : statusFmt.variant === 'blue'
//                             ? 'bg-[#523A28]/10 text-[#523A28]'
//                             : 'bg-gray-100 text-gray-700'
//                           }`}
//                       >
//                         {statusFmt.variant === 'green' ? (
//                           <CheckCircle2 className="w-3 h-3" />
//                         ) : statusFmt.variant === 'blue' ? (
//                           <Clock className="w-3 h-3" />
//                         ) : null}
//                         {statusFmt.label}
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Info Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
//           <h4 className="text-gray-900 mb-2">{t('tips.tip1_title')}</h4>
//           <p className="text-sm text-gray-600">
//             {t('tips.tip1_desc')}
//           </p>
//         </div>
//         <div className="bg-gradient-to-br from-[#F5EDE4] to-[#EDE0D3] rounded-lg p-4 border border-[#523A28]/20">
//           <h4 className="text-gray-900 mb-2">{t('tips.tip2_title')}</h4>
//           <p className="text-sm text-gray-600">
//             {t('tips.tip2_desc')}
//           </p>
//         </div>
//         <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
//           <h4 className="text-gray-900 mb-2">{t('tips.tip3_title')}</h4>
//           <p className="text-sm text-gray-600">
//             {t('tips.tip3_desc')}
//           </p>
//         </div>
//       </div>

//       {/* Modal formulaire */}
//       {showAddModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg text-gray-900">
//                 {formMode === 'create' ? t('modal.title_new') : t('modal.title_edit')}
//               </h3>
//               <button
//                 onClick={() => setShowAddModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="space-y-3">
//               <div>
//                 <label className="block text-sm text-gray-700 mb-1">{t('modal.product')}</label>
//                 <select
//                   className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
//                   value={form.productSlug}
//                   onChange={(e) => setForm({ ...form, productSlug: e.target.value })}
//                 >
//                   <option value="">{t('modal.product_placeholder')}</option>
//                   {products.map((p) => (
//                     <option key={p.slug} value={p.slug}>
//                       {p.name} ({p.reference})
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-1">{t('configs.table.col_min_threshold')}</label>
//                   <input
//                     type="number"
//                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
//                     value={form.threshold}
//                     onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-1">{t('configs.table.col_auto_qty')}</label>
//                   <input
//                     type="number"
//                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
//                     value={form.autoQty}
//                     onChange={(e) => setForm({ ...form, autoQty: Number(e.target.value) })}
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-1">{t('configs.table.col_frequency')}</label>
//                   <select
//                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
//                     value={form.frequency}
//                     onChange={(e) => setForm({ ...form, frequency: e.target.value })}
//                   >
//                     <option value="weekly">{t('freq.weekly')}</option>
//                     <option value="bi_monthly">{t('freq.bi_monthly')}</option>
//                     <option value="monthly">{t('freq.monthly')}</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-1">{t('configs.table.col_next')}</label>
//                   <input
//                     type="date"
//                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
//                     value={form.nextRunAt}
//                     onChange={(e) => setForm({ ...form, nextRunAt: e.target.value })}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center justify-end gap-3">
//               <button
//                 onClick={() => setShowAddModal(false)}
//                 className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 {t('modal.cancel')}
//               </button>
//               <button
//                 onClick={async () => {
//                   if (formMode === 'create') {
//                     await addConfig({
//                       productSlug: form.productSlug,
//                       threshold: form.threshold,
//                       autoQty: form.autoQty,
//                       frequency: form.frequency,
//                       active: true,
//                       nextRunAt: form.nextRunAt || null,
//                       lastRunAt: null,
//                     });
//                   } else if (editingId) {
//                     await updateConfig(editingId, {
//                       productSlug: form.productSlug,
//                       threshold: form.threshold,
//                       autoQty: form.autoQty,
//                       frequency: form.frequency,
//                       nextRunAt: form.nextRunAt || null,
//                     });
//                   }
//                   setShowAddModal(false);
//                 }}
//                 className="px-4 py-2 text-sm text-white rounded-lg transition-colors"
//                 style={{ backgroundColor: '#523A28' }}
//                 onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3A2819')}
//                 onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#523A28')}
//               >
//                 {formMode === 'create' ? t('modal.save') : t('modal.update')}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

