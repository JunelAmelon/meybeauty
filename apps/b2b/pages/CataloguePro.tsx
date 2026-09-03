'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocale, useTranslations } from 'next-intl';
import { Search, Filter, Grid, List, ShoppingCart, Plus, Minus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useProductsB2B, type ProductB2B } from '../hooks/useProductsB2B';

export default function CataloguePro() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('Toutes');
  const [selectedFormat, setSelectedFormat] = useState('Tous');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  const [qtyInputs, setQtyInputs] = useState<Record<string, number>>({});
  const [openQty, setOpenQty] = useState<string | null>(null);
  const [stockMessage, setStockMessage] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  const { addToCart } = useCart();
  const { user } = useAuth();
  const locale = useLocale();
  const t = useTranslations('b2b.catalogue');
  const { products } = useProductsB2B();

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
  const htLabel = useMemo(() => {
    const lower = locale.toLowerCase();
    if (lower.startsWith('fr')) return 'HT';
    if (lower.startsWith('es')) return 'Sin IGV';
    return 'Excl. VAT';
  }, [locale]);

  const formatVolume = useCallback(
    (value: string) => {
      if (!value) return value;
      const match = value.match(/^(\d+(?:[.,]\d+)?)(.*)$/);
      if (!match) return value;
      const [, numStr, unit] = match;
      const num = Number(numStr.replace(',', '.'));
      if (Number.isNaN(num)) return value;
      const formattedNum = new Intl.NumberFormat(locale, {
        maximumFractionDigits: 2,
      }).format(num);
      return `${formattedNum} ${unit.trim()}`;
    },
    [locale]
  );

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (p.categorie) {
        const label = p.categoryLabel || p.categorie;
        if (!map.has(p.categorie)) map.set(p.categorie, label);
      }
    });
    return [{ value: 'Toutes', label: t('filter_all_cats') }, ...Array.from(map.entries()).map(([value, label]) => ({ value, label }))];
  }, [products, t]);

  const formats = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.formatCabine) set.add(p.formatCabine);
    });
    return ['Tous', ...Array.from(set)];
  }, [products]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategorie =
      selectedCategorie === 'Toutes' || product.categorie === selectedCategorie;
    const matchesFormat =
      selectedFormat === 'Tous' || product.formatCabine === selectedFormat;
    return matchesSearch && matchesCategorie && matchesFormat;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategorie, selectedFormat]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const minQty = user ? 100 : 1;

  const handleConfirmQty = (product: ProductB2B) => {
    const requested = Math.max(minQty, qtyInputs[product.id] ?? minQty);
    if (typeof product.stock === 'number') {
      if (product.stock <= 0) {
        setStockMessage((prev) => ({ ...prev, [product.id]: t('stock.out') || 'Stock épuisé' }));
        return;
      }
      if (requested > product.stock) {
        setStockMessage((prev) => ({
          ...prev,
          [product.id]: t('stock.limited', { max: product.stock }) || `Stock max: ${product.stock}`,
        }));
        setQtyInputs((prev) => ({ ...prev, [product.id]: product.stock }));
        return;
      }
    }
    setStockMessage((prev) => ({ ...prev, [product.id]: '' }));
    addToCart(
      {
        id: product.id,
        nom: product.nom,
        reference: product.reference,
        prixHT: product.prixHT,
        image: product.image,
      },
      requested
    );
    setAddedProducts((prev) => new Set(prev).add(product.id));
    setOpenQty(null);
    setTimeout(() => {
      setAddedProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  const handleOpenQty = (product: ProductB2B) => {
    setOpenQty((prev) => (prev === product.id ? null : product.id));
    setQtyInputs((prev) => ({
      ...prev,
      [product.id]: prev[product.id] ?? minQty,
    }));
  };

  const calculateRemise = (prix: number) => {
    const remise = user?.remise || 0;
    return prix - (prix * remise) / 100;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2 text-xl md:text-2xl">{t('title')}</h1>
        <p className="text-sm md:text-base text-gray-600">
          {t('subtitle', { remise: user?.remise ?? 0 })}
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
        <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" style={{ color: '#523A28' }} />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-sm md:text-base"
                style={{ '--tw-ring-color': '#523A28' } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Filters - Responsive */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Category Filter */}
            <select
              value={selectedCategorie}
              onChange={(e) => setSelectedCategorie(e.target.value)}
              className="px-3 md:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-sm md:text-base text-gray-900 bg-white"
              style={{ '--tw-ring-color': '#523A28' } as React.CSSProperties}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Format Filter */}
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-3 md:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-sm md:text-base text-gray-900 bg-white"
              style={{ '--tw-ring-color': '#523A28' } as React.CSSProperties}
            >
              {formats.map((format) => (
                <option key={format} value={format}>
                  {format === 'Tous'
                    ? t('filter_all_formats')
                    : `${t('filter_format_prefix')} ${formatVolume(format)}`}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              style={viewMode === 'grid' ? { backgroundColor: '#523A28' } : {}}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              style={viewMode === 'list' ? { backgroundColor: '#523A28' } : {}}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategorie !== 'Toutes' || selectedFormat !== 'Tous' || searchTerm) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">{t('active_filters')}</span>
            {searchTerm && (
              <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: '#523A28' }}>
                Recherche: &quot;{searchTerm}&quot;
              </span>
            )}
            {selectedCategorie !== 'Toutes' && (
              <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: '#523A28' }}>
                {selectedCategorie}
              </span>
            )}
            {selectedFormat !== 'Tous' && (
              <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: '#523A28' }}>
                {selectedFormat}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategorie('Toutes');
                setSelectedFormat('Tous');
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              {t('clear_all')}
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {t('results_count', { count: filteredProducts.length })}
        </p>
      </div>

      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProducts.map((product) => {
            const prixRemise = calculateRemise(product.prixHT);
            const isAdded = addedProducts.has(product.id);

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
                style={{ minHeight: '580px' }}
              >
                <Link href={`/pro/catalogue/${product.reference}`} className="block">
                <div className="relative h-64 bg-gray-100 overflow-hidden flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.nom}
                    width={400}
                    height={400}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2 py-1 text-xs rounded mb-2 text-white" style={{ backgroundColor: '#523A28' }}>
                        {formatVolume(product.formatCabine)}
                      </span>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1" style={{ minHeight: '48px' }}>{product.nom}</h3>
                      <p className="text-xs text-gray-500">{product.reference}</p>
                    </div>
                    <div className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap flex-shrink-0">
                      {product.stock > 0
                        ? t('stock.label', { count: product.stock }) || `Stock : ${product.stock}`
                        : t('stock.out') || 'Rupture'}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2" style={{ minHeight: '40px' }}>{product.description}</p>
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      {user?.remise ? (
                        <div>
                          <p className="text-xs text-gray-400 line-through">
                            {formatMoney.format(product.prixHT)}
                          </p>
                          <p className="text-lg text-gray-900">
                            {formatMoney.format(prixRemise)} <span className="text-sm">{htLabel}</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-lg text-gray-900">
                          {formatMoney.format(product.prixHT)} <span className="text-sm">{htLabel}</span>
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {product.stock > 0
                        ? t('stock.in_stock', { count: product.stock }) || t('stock.label', { count: product.stock }) || `Stock : ${product.stock}`
                        : t('stock.out') || 'Rupture'}
                    </span>
                  </div>
                </div>
                </Link>
                  <div className="px-4 pb-4">
                  {openQty === product.id ? (
                    <div className="w-full space-y-2">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          type="button"
                          className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-l-lg"
                          onClick={() =>
                            setQtyInputs((prev) => {
                              const next = Math.max(minQty, (prev[product.id] ?? minQty) - 1);
                              return { ...prev, [product.id]: next };
                            })
                          }
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min={minQty}
                          value={qtyInputs[product.id] ?? minQty}
                          onChange={(e) =>
                            setQtyInputs((prev) => ({
                              ...prev,
                              [product.id]: Math.max(minQty, Number(e.target.value) || minQty),
                            }))
                          }
                          className="w-full text-center px-3 py-2 text-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-r-lg"
                          onClick={() =>
                            setQtyInputs((prev) => ({
                              ...prev,
                              [product.id]: (prev[product.id] ?? minQty) + 1,
                            }))
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleConfirmQty(product)}
                          className="px-3 py-2 rounded-lg text-white"
                          style={{ backgroundColor: '#523A28' }}
                        >
                          {t('add_to_cart')}
                        </button>
                        <button
                          onClick={() => setOpenQty(null)}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          {t('cancel') ?? 'Annuler'}
                        </button>
                      </div>
                      {stockMessage[product.id] && (
                        <p className="text-xs text-red-600">{stockMessage[product.id]}</p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenQty(product)}
                      className={`w-full py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-white ${isAdded ? 'bg-green-500' : ''
                        }`}
                      style={!isAdded ? { backgroundColor: '#523A28' } : {}}
                      onMouseEnter={(e) => !isAdded && (e.currentTarget.style.backgroundColor = '#3A2819')}
                      onMouseLeave={(e) => !isAdded && (e.currentTarget.style.backgroundColor = '#523A28')}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          {t('added_to_cart')}
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          {t('add_to_cart')}
                        </>
                      )}
                    </button>
                  )}
                  </div>
                </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs text-gray-600">{t('table.col_product')}</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs text-gray-600 hidden sm:table-cell">{t('table.col_ref')}</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs text-gray-600">{t('table.col_format')}</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs text-gray-600">{t('table.col_price')}</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs text-gray-600 hidden lg:table-cell">{t('table.col_stock')}</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs text-gray-600">{t('table.col_action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.map((product) => {
                  const prixRemise = calculateRemise(product.prixHT);
                  const isAdded = addedProducts.has(product.id);

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-4">
                        <Link href={`/pro/catalogue/${product.reference}`} className="flex items-center gap-3">
                          <Image
                            src={product.image}
                            alt={product.nom}
                            width={48}
                            height={48}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs md:text-sm text-gray-900 truncate hover:text-[#523A28] transition-colors">{product.nom}</p>
                            <p className="text-xs text-gray-500 truncate hidden md:block">{product.description}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 md:px-6 py-4 text-xs md:text-sm text-gray-600 hidden sm:table-cell">{product.reference}</td>
                      <td className="px-3 md:px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded text-white whitespace-nowrap" style={{ backgroundColor: '#523A28' }}>
                          {formatVolume(product.formatCabine)}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        {user?.remise ? (
                          <div>
                            <p className="text-xs text-gray-400 line-through">
                              {formatMoney.format(product.prixHT)}
                            </p>
                            <p className="text-xs md:text-sm text-gray-900 whitespace-nowrap">{formatMoney.format(prixRemise)} {htLabel}</p>
                          </div>
                        ) : (
                          <p className="text-xs md:text-sm text-gray-900 whitespace-nowrap">{formatMoney.format(product.prixHT)} {htLabel}</p>
                        )}
                      </td>
                      <td className="px-3 md:px-6 py-4 text-xs md:text-sm text-gray-600 hidden lg:table-cell">
                        {product.stock > 0
                          ? t('stock.label', { count: product.stock }) || `Stock : ${product.stock}`
                          : t('stock.out') || 'Rupture'}
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        {openQty === product.id ? (
                          <div className="flex items-center gap-1 flex-wrap md:flex-nowrap">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-full md:w-auto md:max-w-[120px]">
                              <button
                                type="button"
                                className="px-2 py-1.5 text-gray-700 hover:bg-gray-50"
                                onClick={() =>
                                  setQtyInputs((prev) => {
                                    const next = Math.max(minQty, (prev[product.id] ?? minQty) - 1);
                                    return { ...prev, [product.id]: next };
                                  })
                                }
                              >
                                <Minus className="w-4 h-4" aria-label="minus" />
                              </button>
                              <input
                                type="number"
                                min={minQty}
                                value={qtyInputs[product.id] ?? minQty}
                                onChange={(e) =>
                                  setQtyInputs((prev) => ({
                                    ...prev,
                                    [product.id]: Math.max(minQty, Number(e.target.value) || minQty),
                                  }))
                                }
                                className="w-full text-center px-2 py-1.5 text-xs md:text-sm focus:outline-none"
                              />
                              <button
                                type="button"
                                className="px-2 py-1.5 text-gray-700 hover:bg-gray-50"
                                onClick={() =>
                                  setQtyInputs((prev) => ({
                                    ...prev,
                                    [product.id]: (prev[product.id] ?? minQty) + 1,
                                  }))
                                }
                              >
                                <Plus className="w-4 h-4" aria-label="plus" />
                              </button>
                            </div>
                            <div className="flex items-center gap-1 w-full md:w-auto justify-end">
                              <button
                                onClick={() => handleConfirmQty(product)}
                                className="w-8 h-8 md:w-9 md:h-9 rounded-lg text-white flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: '#523A28' }}
                              >
                                <ShoppingCart className="w-4 h-4" aria-label="add" />
                              </button>
                              <button
                                onClick={() => setOpenQty(null)}
                                className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center flex-shrink-0"
                              >
                                <Plus className="w-4 h-4 rotate-45" aria-label="close" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenQty(product)}
                            className={`px-3 md:px-4 py-2 rounded-lg transition-all text-xs md:text-sm flex items-center gap-2 whitespace-nowrap ${isAdded
                              ? 'bg-green-100 text-green-700'
                              : 'text-white'
                              }`}
                            style={!isAdded ? { backgroundColor: '#523A28' } : {}}
                            onMouseEnter={(e) => !isAdded && (e.currentTarget.style.backgroundColor = '#3A2819')}
                            onMouseLeave={(e) => !isAdded && (e.currentTarget.style.backgroundColor = '#523A28')}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('table.btn_added')}</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('table.btn_add')}</span>
                              </>
                            )}
                          </button>
                        )}
                        {stockMessage[product.id] && (
                          <p className="text-xs text-red-600 mt-1">{stockMessage[product.id]}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">{t('no_results')}</h3>
          <p className="text-gray-600 mb-4">{t('no_results_desc')}</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategorie('Toutes');
              setSelectedFormat('Tous');
            }}
            className="px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#523A28' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3A2819')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#523A28')}
          >
            {t('reset_filters')}
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredProducts.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-4 pt-4">
          <p className="text-sm text-gray-600">
            {t('results_count', { count: filteredProducts.length })} — Page {currentPage} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((page, idx, arr) => (
                <span key={page} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="px-2 text-gray-400">…</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm transition-colors ${
                      page === currentPage
                        ? 'text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    style={page === currentPage ? { backgroundColor: '#523A28' } : {}}
                  >
                    {page}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Force SSR pour éviter les erreurs de build avec useCart/useAuth
export async function getServerSideProps() {
  return { props: {} };
}
