'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { useAdminProducts, AdminProduct, ProductDb } from '@/apps/admin/hooks/useAdminProducts';
import { useTranslations } from 'next-intl';
import ProductModal from '@/apps/admin/components/products/ProductModal';

export default function Produits() {
  const { products, loading, deleteProduct, addProduct, updateProduct } = useAdminProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Toutes');
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 8;
  const t = useTranslations('admin.products');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);

  // Build categories list with multilingual labels
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (p.category) {
        const label = p.categoryLabel || p.category;
        if (!map.has(p.category)) map.set(p.category, label);
      }
    });
    return [
      { value: 'Toutes', label: t('filters.allCategories') },
      ...Array.from(map.entries()).map(([value, label]) => ({ value, label }))
    ];
  }, [products, t]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'Toutes' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      inStock: products.filter((p) => p.stock > 0).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock < 10).length,
    };
  }, [products]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(t('confirmDelete', { name }))) {
      try {
        await deleteProduct(id);
      } catch {
        alert(t('deleteError'));
      }
    }
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: AdminProduct) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleSaveProduct = async (data: ProductDb) => {
    if (selectedProduct) {
      await updateProduct(selectedProduct.id, data);
    } else {
      await addProduct(data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#523A28] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 mb-2 font-bold">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle', { count: products.length })}</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#523A28] text-white rounded-lg hover:bg-[#3A2819] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('newProduct')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">{t('stats.totalProducts')}</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">{t('stats.inStock')}</p>
          <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">{t('stats.outOfStock')}</p>
          <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">{t('stats.lowStock')}</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
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

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28] bg-white text-gray-900"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          {t('noResults')}
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all flex flex-col group"
            >
              <div className="relative h-48 bg-gray-50 overflow-hidden flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full shadow-sm ${product.stock > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                      }`}
                  >
                    {product.stock > 0 ? t('status.active') : t('status.outOfStock')}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded uppercase tracking-wider">
                    {product.categoryLabel}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 h-10 leading-tight">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-400 mb-4">{t('card.ref', { ref: product.id })}</p>

                <div className="flex items-center justify-between mb-4 mt-auto">
                  <div>
                    <p className="text-lg font-bold text-[#523A28]">{product.price.toFixed(2)} €</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{t('card.priceB2C')}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${product.stock > 0 ? (product.stock < 10 ? 'text-yellow-600' : 'text-gray-900') : 'text-red-600'}`}>
                      {product.stock > 0 ? t('card.stock', { stock: product.stock }) : t('status.outOfStock')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/produits/${product.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-bold"
                  >
                    <Eye className="w-4 h-4" />
                    {t('card.explore')}
                  </Link>
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 bg-[#523A28]/10 text-[#523A28] rounded-lg hover:bg-[#523A28]/20 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm rounded-lg border border-[#523A28] text-[#523A28] hover:bg-[#523A28] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 text-sm rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-[#523A28] text-white'
                    : 'border border-[#523A28] text-[#523A28] hover:bg-[#523A28] hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm rounded-lg border border-[#523A28] text-[#523A28] hover:bg-[#523A28] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        )}

        {/* Results count */}
        <p className="text-center text-sm text-gray-500 mt-4">
          {Math.min((currentPage - 1) * PRODUCTS_PER_PAGE + 1, filteredProducts.length)}
          {'–'}
          {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)}
          {' sur '}
          {filteredProducts.length} produits
        </p>
        </>
      )}

      {/* Product Modal */}
      <ProductModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        product={selectedProduct}
        categories={categories}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
