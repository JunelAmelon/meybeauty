'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  FileText,
  Send,
  Plus,
  Trash2,
  Upload,
  Clock,
  Euro,
  Calendar,
  AlertCircle,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useQuoteRequestB2B } from '../hooks/useQuoteRequestB2B';

export default function DemandeDevis() {
  const t = useTranslations('b2b.quote_request');
  const locale = useLocale();
  const {
    products,
    loadingProducts,
    productsError,
    form,
    setFormField,
    selectedProducts,
    addProduct,
    updateProductQty,
    removeProduct,
    totalHT,
    totalTTC,
    files,
    uploadFiles,
    removeFile,
    submitting,
    success,
    error,
    handleSubmit,
    reset,
  } = useQuoteRequestB2B();
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const formatMoney = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale]
  );

  const labels = useMemo(() => {
    const lower = locale.toLowerCase();
    if (lower.startsWith('fr')) {
      return {
        qty: 'Qté',
        ht: 'HT',
        ttc: 'TTC',
        sizeUnit: 'ko',
        unit: 'pcs',
        status: {
          idle: 'Prêt',
          uploading: 'En cours...',
          done: 'Terminé',
          error: 'Erreur',
        },
      };
    }
    if (lower.startsWith('es')) {
      return {
        qty: 'Cant.',
        ht: 'Sin IGV',
        ttc: 'Con IGV',
        sizeUnit: 'KB',
        unit: 'uds',
        status: {
          idle: 'Listo',
          uploading: 'Subiendo...',
          done: 'Completado',
          error: 'Error',
        },
      };
    }
    return {
      qty: 'Qty',
      ht: 'Excl. VAT',
      ttc: 'Incl. VAT',
      sizeUnit: 'KB',
      unit: 'pcs',
      status: {
        idle: 'Ready',
        uploading: 'Uploading...',
        done: 'Done',
        error: 'Error',
      },
    };
  }, [locale]);

  const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const buildLocalISO = (d: Date) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  const formattedDate = useMemo(() => {
    if (!form.date) return '';
    const d = new Date(`${form.date}T00:00:00`);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(d);
  }, [form.date, locale]);

  const weekDays = useMemo(() => {
    const base = new Date(2021, 7, 2); // Monday
    return Array.from({ length: 7 }, (_, i) =>
      new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
        new Date(base.getTime() + i * 24 * 60 * 60 * 1000)
      )
    );
  }, [locale]);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(viewDate),
    [locale, viewDate]
  );

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { offset, daysInMonth };
  }, [viewDate]);

  const selectDate = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setFormField('date', buildLocalISO(selected));
    setShowDatePicker(false);
  };

  const totalProducts = useMemo(
    () => selectedProducts.reduce((sum, p) => sum + p.quantite, 0),
    [selectedProducts]
  );

  if (success) {
    return (
      <div className="max-w-2xl mx-auto my-12">
        <div className="bg-white border border-[#523A28]/20 p-10 text-center">
          <div className="w-14 h-14 bg-[#F5EDE4] rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-7 h-7" style={{ color: '#523A28' }} />
          </div>
          <h2 className="text-gray-900 mb-3 text-xl font-bold">
            {t('success_msg')}
          </h2>
          <button
            onClick={reset}
            className="mt-6 px-6 py-3 text-white font-medium transition-colors"
            style={{ backgroundColor: '#523A28' }}
          >
            {t('footer.btn_send')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2 text-xl md:text-2xl font-bold">
          {t('title')}
        </h1>
        <p className="text-sm text-gray-600">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSubmit();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Section 1: Général */}
          <div className="bg-white border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5" style={{ color: '#523A28' }} />
              <h2 className="text-lg font-semibold text-gray-900">
                {t('sections.general.title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sections.general.subject_label')}
                </label>
                <input
                  required
                  type="text"
                  placeholder={t('sections.general.subject_placeholder')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28] focus:border-[#523A28]"
                  value={form.subject}
                  onChange={(e) => setFormField('subject', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sections.general.type_label')}
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28] focus:border-[#523A28] text-gray-900 bg-white"
                  value={form.type}
                  onChange={(e) => setFormField('type', e.target.value)}
                >
                  <option value="">{t('sections.general.type_placeholder')}</option>
                  <option value="ouverture">{t('sections.general.types.nouvelle_ouverture')}</option>
                  <option value="renouvellement">{t('sections.general.types.renouvellement')}</option>
                  <option value="evenement">{t('sections.general.types.evenement')}</option>
                  <option value="volume">{t('sections.general.types.commande_volume')}</option>
                  <option value="autre">{t('sections.general.types.autre')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sections.general.date_label')}
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDatePicker((v) => !v)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-[#523A28] focus:border-[#523A28]"
                  >
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    {formattedDate || t('sections.general.date_placeholder', { defaultMessage: 'Choisir une date' })}
                  </button>
                  {showDatePicker && (
                    <div className="absolute z-20 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <button
                          type="button"
                          onClick={() =>
                            setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-sm font-medium text-gray-900">{monthLabel}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
                        {weekDays.map((wd) => (
                          <span key={wd}>{wd}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-sm">
                        {Array.from({ length: calendarDays.offset }).map((_, idx) => (
                          <span key={`offset-${idx}`} />
                        ))}
                        {Array.from({ length: calendarDays.daysInMonth }).map((_, idx) => {
                          const day = idx + 1;
                          const isSelected =
                            form.date &&
                            new Date(form.date).toDateString() ===
                            new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => selectDate(day)}
                              className={`py-2 rounded transition-colors ${isSelected
                                ? 'text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              style={isSelected ? { backgroundColor: '#523A28' } : {}}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sections.general.description_label')}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={t('sections.general.description_placeholder')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28] focus:border-[#523A28]"
                  value={form.description}
                  onChange={(e) => setFormField('description', e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sections.general.qty_label')}
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28] focus:border-[#523A28]"
                  value={form.quantity ?? ''}
                  min={0}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormField('quantity', v === '' ? undefined : Number(v));
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sections.general.budget_label')}
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28] focus:border-[#523A28]"
                    value={form.budget ?? ''}
                    min={0}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormField('budget', v === '' ? undefined : Number(v));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Produits */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" style={{ color: '#523A28' }} />
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('sections.products.title')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowProductSelector(true)}
                className="text-sm font-medium hover:underline"
                style={{ color: '#523A28' }}
              >
                {t('sections.products.btn_add')}
              </button>
            </div>

            {selectedProducts.length > 0 ? (
              <div className="space-y-3">
                {selectedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-[#F5EDE4]/50 border border-[#523A28]/10 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{product.nom}</p>
                      <p className="text-xs text-gray-500">{product.reference}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={product.quantite}
                          onChange={(e) => updateProductQty(product.id, Number(e.target.value) || 1)}
                          className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#523A28]"
                        />
                        <div className="text-right">
                          <p className="text-sm text-gray-900">
                            {formatMoney.format(product.prixHT * product.quantite)}
                          </p>
                          <p className="text-xs text-gray-500">{labels.qty}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                  <span className="text-gray-600">{t('sections.products.total_label')}</span>
                  <span className="text-lg font-bold" style={{ color: '#523A28' }}>
                    {formatMoney.format(totalHT)} {labels.ht} · {formatMoney.format(totalTTC)} {labels.ttc} ({totalProducts} {labels.unit})
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-[#523A28]/15 rounded-lg">
                <AlertCircle className="w-8 h-8 text-[#523A28]/30 mx-auto mb-2" />
                <p className="text-sm text-gray-500 px-4">
                  {t('sections.products.empty')}
                </p>
              </div>
            )}
          </div>

          {/* Section 3: Documents */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5" style={{ color: '#523A28' }} />
              <h2 className="text-lg font-semibold text-gray-900">
                {t('sections.docs.title')}
              </h2>
            </div>

            <div className="border-2 border-dashed border-[#523A28]/15 rounded-lg p-6 text-center hover:border-[#523A28]/40 transition-colors cursor-pointer group">
              <label className="block cursor-pointer">
                <div className="bg-[#F5EDE4] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Upload className="w-6 h-6" style={{ color: '#523A28' }} />
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {t('sections.docs.upload_placeholder')}
                </p>
                <p className="text-xs text-gray-400">
                  {t('sections.docs.upload_hint')}
                </p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      uploadFiles(e.target.files);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-[#F5EDE4]/50 border border-[#523A28]/10 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} {labels.sizeUnit} · {labels.status[file.status] || file.status}
                        {file.url ? ' · OK' : ''}
                        {file.error ? ` · ${file.error}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'uploading' && (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-[#523A28] rounded-full animate-spin" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        disabled={file.status === 'uploading'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="bg-white border border-gray-200 p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t('footer.title')}
            </h3>
            <p className="text-sm text-gray-600 mb-6">{t('footer.subtitle')}</p>
            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}
            <button
              disabled={submitting}
              type="submit"
              className="px-10 py-3 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-3 mx-auto"
              style={{ backgroundColor: '#523A28' }}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
              {t('footer.btn_send')}
            </button>
          </div>
        </form>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-[#F5EDE4] border border-[#523A28]/15 p-6">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2 font-semibold">
              <AlertCircle className="w-5 h-5" style={{ color: '#523A28' }} />
              Pourquoi demander un devis ?
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-white border border-[#523A28]/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" style={{ color: '#523A28' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('tips.tip1_title')}</p>
                  <p className="text-xs text-gray-600">{t('tips.tip1_desc')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-white border border-[#523A28]/10 flex items-center justify-center flex-shrink-0">
                  <Euro className="w-4 h-4" style={{ color: '#523A28' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('tips.tip2_title')}</p>
                  <p className="text-xs text-gray-600">{t('tips.tip2_desc')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-white border border-[#523A28]/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" style={{ color: '#523A28' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('tips.tip3_title')}</p>
                  <p className="text-xs text-gray-600">{t('tips.tip3_desc')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-600 mb-3">Besoin d&apos;aide immédiate ?</p>
            <p className="text-lg font-bold" style={{ color: '#523A28' }}>01 23 45 67 89</p>
            <p className="text-xs text-gray-400 mt-1">pro@meybeauty.com</p>
          </div>
        </div>
      </div>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {t('sections.products.selector_title')}
              </h3>
              <button onClick={() => setShowProductSelector(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2">
              {productsError && (
                <p className="text-sm text-red-600">{productsError}</p>
              )}
              {loadingProducts && (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
                </p>
              )}
              {!loadingProducts && products.length === 0 && (
                <p className="text-sm text-gray-500">Aucun produit disponible</p>
              )}
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    addProduct(p, 1);
                    setShowProductSelector(false);
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-[#F5EDE4]/50 border border-gray-100 text-left transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.nom}</p>
                    <p className="text-xs text-gray-400">{p.reference}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm" style={{ color: '#523A28' }}>
                      {formatMoney.format(p.prixHT)} {labels.ht}
                    </p>
                    <Plus className="w-4 h-4" style={{ color: '#523A28' }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
