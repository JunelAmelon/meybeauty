'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Download, Search, Filter, Heart, Image as ImageIcon, FileText, Video, Eye, X } from 'lucide-react';
import { useDownloadsB2B } from '../hooks/useDownloadsB2B';

export default function Telechargements() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [selectedCategorie, setSelectedCategorie] = useState('Toutes');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [showFavorites, setShowFavorites] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<{ url: string; titre: string; type: string; format: string; slug: string } | null>(null);
  const t = useTranslations('b2b.downloads_page');
  const { assets, categories, loading, error } = useDownloadsB2B();

  const types = ['Tous', 'Images', 'PDF'];
  const categoriesWithAll = useMemo(() => ['Toutes', ...categories], [categories]);

  const toggleFavorite = (slug: string) => {
    setFavorites((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const normalizedAssets = useMemo(
    () =>
      assets.map((asset) => ({
        ...asset,
        isFavorite: favorites[asset.slug] || false,
        titre: asset.title,
        categorie: asset.category,
        taille: asset.size,
      })),
    [assets, favorites]
  );

  const filteredAssets = normalizedAssets.filter((asset) => {
    const matchesSearch = asset.titre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === 'Tous' ||
      (selectedType === 'Images' && asset.type === 'image') ||
      (selectedType === 'PDF' && asset.type === 'pdf');
    const matchesCategorie =
      selectedCategorie === 'Toutes' || asset.categorie === selectedCategorie;
    const matchesFavorites = !showFavorites || asset.isFavorite;
    return matchesSearch && matchesType && matchesCategorie && matchesFavorites;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return ImageIcon;
      case 'pdf':
        return FileText;
      case 'video':
        return Video;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'bg-[#523A28]/10 text-[#523A28]';
      case 'pdf':
        return 'bg-red-100 text-red-700';
      case 'video':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-gray-700">{t('loading', { defaultMessage: 'Chargement...' })}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-6 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2 text-lg md:text-xl lg:text-2xl">{t('title')}</h1>
        <p className="text-xs md:text-sm text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
        <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28] text-gray-900 bg-white"
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type === 'Tous' ? t('filter_all_types') : type}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategorie}
            onChange={(e) => setSelectedCategorie(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28] text-gray-900 bg-white"
          >
            {categoriesWithAll.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Favorites Toggle */}
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${showFavorites
              ? 'bg-pink-100 text-pink-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <Heart className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
            {t('filter_favorites')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">{t('stats.total')}</p>
          <p className="text-2xl text-gray-900">{normalizedAssets.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">{t('stats.images')}</p>
          <p className="text-2xl text-gray-900">
            {normalizedAssets.filter((a) => a.type === 'image').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">{t('stats.pdf')}</p>
          <p className="text-2xl text-gray-900">
            {normalizedAssets.filter((a) => a.type === 'pdf').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">{t('stats.favorites')}</p>
          <p className="text-2xl text-gray-900">
            {normalizedAssets.filter((a) => a.isFavorite).length}
          </p>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {t('results_count', { count: filteredAssets.length })}
        </p>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAssets.map((asset) => {
          const TypeIcon = getTypeIcon(asset.type);
          return (
            <div
              key={asset.slug}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
              style={{ minHeight: '420px' }}
            >
              <div className="relative h-48 bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {asset.type === 'image' ? (
                  <Image
                    src={asset.url}
                    alt={asset.titre}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    {asset.type === 'pdf' ? (
                      <FileText className="w-16 h-16" />
                    ) : (
                      <Video className="w-16 h-16" />
                    )}
                    <span className="text-xs font-medium uppercase">{asset.format}</span>
                  </div>
                )}
                <button
                  onClick={() => toggleFavorite(asset.slug)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-pink-50 transition-colors shadow-lg"
                >
                  <Heart
                    className={`w-4 h-4 ${asset.isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400'
                      }`}
                  />
                </button>
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTypeColor(
                      asset.type
                    )}`}
                  >
                    <TypeIcon className="w-3 h-3" />
                    {asset.format}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mb-3 w-fit">
                  {asset.categorie}
                </span>
                <h3 className="font-semibold text-sm text-gray-900 mb-3 line-clamp-2" style={{ minHeight: '40px' }}>{asset.titre}</h3>
                <p className="text-xs text-gray-500 mb-4">{asset.taille}</p>
                <div className="flex items-center gap-2 mt-auto">
                  <button
                    onClick={() => setPreviewAsset(asset)}
                    className="p-2 text-gray-600 hover:text-[#523A28] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = asset.url;
                      link.download = `${asset.slug}.${asset.format.toLowerCase()}`;
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
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">{t('no_results')}</h3>
          <p className="text-gray-600 mb-4">{t('no_results_desc')}</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('Tous');
              setSelectedCategorie('Toutes');
              setShowFavorites(false);
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

      {/* Info */}
      <div className="bg-gradient-to-br from-[#F5EDE4] to-[#EDE0D3] rounded-xl p-6 border border-[#523A28]/20">
        <h3 className="text-gray-900 mb-3">{t('info.title')}</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span style={{ color: '#523A28' }}>•</span>
            {t('info.line1')}
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: '#523A28' }}>•</span>
            {t('info.line2')}
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: '#523A28' }}>•</span>
            {t('info.line3')}
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: '#523A28' }}>•</span>
            {t('info.line4')}
          </li>
        </ul>
      </div>

      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewAsset(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                  {previewAsset.format}
                </span>
                <h2 className="text-sm font-semibold text-gray-900">{previewAsset.titre}</h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewAsset.url}
                  download={previewAsset.slug}
                  className="p-2 text-gray-600 hover:text-[#523A28] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button onClick={() => setPreviewAsset(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center">
              {previewAsset.type === 'image' ? (
                <div className="relative w-full h-full min-h-[400px]">
                  <Image src={previewAsset.url} alt={previewAsset.titre} fill className="object-contain" />
                </div>
              ) : previewAsset.type === 'pdf' ? (
                <iframe src={previewAsset.url} className="w-full h-[80vh]" title={previewAsset.titre} />
              ) : previewAsset.type === 'video' ? (
                <video controls className="max-w-full max-h-[80vh]">
                  <source src={previewAsset.url} />
                </video>
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-400 py-20">
                  <FileText className="w-16 h-16" />
                  <p className="text-sm">Prévisualisation non disponible pour ce format</p>
                  <a href={previewAsset.url} download={previewAsset.slug} className="text-[#523A28] underline text-sm">
                    Télécharger le fichier
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
