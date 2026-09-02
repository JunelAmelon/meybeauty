'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, Download, Search, Filter, Eye, X } from 'lucide-react';
import { useProtocolesListB2B, ProtocoleListItem } from '../hooks/useProtocolesB2B';

export default function Protocoles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('Toutes');
  const [previewProto, setPreviewProto] = useState<ProtocoleListItem | null>(null);
  const t = useTranslations('b2b.protocoles');
  const { items, categories: catList, loading, error } = useProtocolesListB2B();

  const categories = useMemo(
    () => ['Toutes', ...catList.filter(Boolean)],
    [catList]
  );

  const filteredProtocoles = items.filter((protocole) => {
    const matchesSearch = (protocole.title || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategorie =
      selectedCategorie === 'Toutes' || protocole.category === selectedCategorie;
    return matchesSearch && matchesCategorie;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-gray-900 mb-2 font-bold">{t('title')}</h1>
        <p className="text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">{t('results_count', { count: filteredProtocoles.length })}</p>
          <p className="text-2xl font-bold text-gray-900">{filteredProtocoles.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
            />
          </div>
          <select
            value={selectedCategorie}
            onChange={(e) => setSelectedCategorie(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28] text-gray-900 bg-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'Toutes' ? t('filter_all_cats') : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-gray-500">{t('loading') || 'Chargement...'}</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Protocoles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProtocoles.map((protocole) => (
          <div
            key={protocole.slug}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all flex flex-col"
          >
            <div className="relative h-40 bg-gray-100 overflow-hidden flex items-center justify-center">
              <FileText className="w-16 h-16 text-gray-400" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mb-2 w-fit">
                {protocole.category || '—'}
              </span>
              <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">{protocole.title}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{protocole.description}</p>
              <div className="flex items-center gap-2 mt-auto">
                <button
                  onClick={() => setPreviewProto(protocole)}
                  className="p-2 text-gray-600 hover:text-[#523A28] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = protocole.image;
                    link.download = protocole.slug;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="p-2 text-gray-600 hover:text-[#523A28] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProtocoles.length === 0 && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">{t('no_results')}</h3>
          <p className="text-gray-600 mb-4">{t('no_results_desc')}</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategorie('Toutes');
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

      {/* Inline Preview Modal */}
      {previewProto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewProto(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">{previewProto.title}</h2>
              <div className="flex items-center gap-2">
                <a
                  href={previewProto.image}
                  download={previewProto.slug}
                  className="p-2 text-gray-600 hover:text-[#523A28] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button onClick={() => setPreviewProto(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center">
              <iframe src={previewProto.image} className="w-full h-[80vh]" title={previewProto.title} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Force SSR pour éviter les erreurs de build
export async function getServerSideProps() {
  return { props: {} };
}
