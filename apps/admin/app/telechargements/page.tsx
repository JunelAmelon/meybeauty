'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, Plus, Edit, Trash2, Loader2, X, Download, FileText, Image as ImageIcon, Video, UploadCloud, File, Eye } from 'lucide-react';
import { useAdminDownloads, DownloadAsset } from '@/apps/admin/hooks/useAdminDownloads';
import { useTranslations } from 'next-intl';
import { uploadToCloudinary } from '@meybeauty/cloudinary';
import { Input } from '@/apps/admin/components/ui/input';
import { Textarea } from '@/apps/admin/components/ui/textarea';

const TYPES = ['image', 'pdf'] as const;
const TYPE_LABELS: Record<string, string> = {
  image: 'Image',
  pdf: 'PDF',
};

function detectType(file: File): DownloadAsset['type'] {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) return 'pdf';
  return 'pdf';
}

function detectFormat(file: File): string {
  const ext = file.name.split('.').pop();
  return ext ? ext.toUpperCase() : 'PDF';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(url);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const DOWNLOAD_CATEGORIES = [
  'PLV',
  'Catalogues',
  'Visuels marketing',
  'Fiches produits',
  'Logos & Charte',
];

export default function TelechargementsAdmin() {
  const { assets, loading, error, addDownload, updateDownload, deleteDownload } = useAdminDownloads();
  const t = useTranslations('admin.downloads');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<DownloadAsset | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<DownloadAsset | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(assets.map((a) => a.category).filter(Boolean));
    return Array.from(cats);
  }, [assets]);

  const allCategories = useMemo(() => {
    const cats = new Set([...DOWNLOAD_CATEGORIES, ...categories]);
    return Array.from(cats);
  }, [categories]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'Tous' || asset.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [assets, searchTerm, typeFilter]);

  const openAddModal = () => {
    setEditingAsset(null);
    setModalOpen(true);
  };

  const openEditModal = (asset: DownloadAsset) => {
    setEditingAsset(asset);
    setModalOpen(true);
  };

  const handleDelete = (asset: DownloadAsset) => {
    if (window.confirm(`Supprimer "${asset.title}" ?`)) {
      deleteDownload(asset.slug);
    }
  };

  const handleSave = async (data: DownloadAsset) => {
    setSaving(true);
    try {
      if (editingAsset) {
        await updateDownload(data);
      } else {
        await addDownload(data);
      }
      setModalOpen(false);
      setEditingAsset(null);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'pdf': return FileText;
      case 'video': return Video;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#523A28]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#523A28] text-white rounded-lg hover:bg-[#3A2819] transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('add')}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28] text-gray-900 bg-white"
          >
            <option value="Tous">Tous les types</option>
            {TYPES.map((type) => (
              <option key={type} value={type}>{TYPE_LABELS[type]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAssets.map((asset) => {
          const TypeIcon = getTypeIcon(asset.type);
          return (
            <div
              key={asset.slug}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all flex flex-col"
            >
              <div className="relative h-40 bg-gray-100 overflow-hidden flex items-center justify-center">
                {isImageUrl(asset.url) ? (
                  <Image
                    src={asset.url}
                    alt={asset.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    {asset.type === 'pdf' ? (
                      <FileText className="w-16 h-16" />
                    ) : asset.type === 'video' ? (
                      <Video className="w-16 h-16" />
                    ) : (
                      <File className="w-16 h-16" />
                    )}
                    <span className="text-xs font-medium uppercase">{asset.format}</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/90 text-gray-700">
                    <TypeIcon className="w-3 h-3" />
                    {asset.format}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mb-2 w-fit">
                  {asset.category}
                </span>
                <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">{asset.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{asset.size}</p>
                <div className="flex items-center gap-2 mt-auto">
                  <button
                    onClick={() => setPreviewAsset(asset)}
                    className="p-2 text-gray-600 hover:text-[#523A28] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(asset)}
                    className="p-2 text-gray-600 hover:text-[#523A28] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(asset)}
                    className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={asset.slug}
                    className="p-2 text-gray-600 hover:text-[#523A28] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">{t('empty')}</p>
        </div>
      )}

      {previewAsset && (
        <PreviewModal asset={previewAsset} onClose={() => setPreviewAsset(null)} />
      )}

      {modalOpen && (
        <DownloadModal
          key={editingAsset ? `edit-${editingAsset.slug}` : 'add'}
          asset={editingAsset}
          categories={allCategories}
          saving={saving}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingAsset(null); }}
        />
      )}
    </div>
  );
}

function DownloadModal({
  asset,
  categories,
  saving,
  onSave,
  onClose,
}: {
  asset: DownloadAsset | null;
  categories: string[];
  saving: boolean;
  onSave: (data: DownloadAsset) => void;
  onClose: () => void;
}) {
  const t = useTranslations('admin.downloads');
  const [form, setForm] = useState<DownloadAsset>(
    asset || {
      slug: '',
      type: 'pdf',
      category: '',
      format: '',
      size: '',
      url: '',
      title: '',
      defaultLocale: 'fr',
    }
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState(false);

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: asset ? prev.slug : slugify(title),
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setUploadError(null);
    setUploading(true);

    try {
      const url = await uploadToCloudinary(file, { folder: 'downloadsB2B' });
      const detectedType = detectType(file);
      const detectedFormat = detectFormat(file);
      const detectedSize = formatFileSize(file.size);

      setForm((prev) => ({
        ...prev,
        url,
        type: detectedType,
        format: detectedFormat,
        size: detectedSize,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.title || !form.url) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {asset ? t('edit') : t('add')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.title')}</label>
            <Input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.category')}</label>
            {customCategory ? (
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Nouvelle catégorie..."
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setCustomCategory(false)}
                  className="px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                >
                  {t('form.use_list')}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#523A28]"
                >
                  <option value="">— Sélectionner —</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setCustomCategory(true)}
                  className="px-3 py-2 text-xs text-[#523A28] border border-[#523A28] rounded-lg hover:bg-[#FDF8F3] whitespace-nowrap"
                >
                  + {t('form.new_category')}
                </button>
              </div>
            )}
          </div>
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.file')}</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#523A28] transition-colors">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-[#523A28] animate-spin" />
                    <span className="text-sm text-gray-600">{t('form.uploading')}</span>
                  </>
                ) : form.url ? (
                  <>
                    <UploadCloud className="w-8 h-8 text-green-600" />
                    <span className="text-sm text-gray-700 font-medium">
                      {selectedFileName || form.url.split('/').pop()}
                    </span>
                    <span className="text-xs text-gray-500">{form.format} · {form.size}</span>
                    <span className="text-xs text-[#523A28] underline">{t('form.replace_file')}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">{t('form.upload_placeholder')}</span>
                  </>
                )}
              </label>
            </div>
            {uploadError && (
              <p className="text-sm text-red-600 mt-2">{uploadError}</p>
            )}
          </div>

          {/* Preview */}
          {form.url && isImageUrl(form.url) && (
            <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={form.url}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}
          {form.url && !isImageUrl(form.url) && (
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
              {form.type === 'pdf' ? (
                <FileText className="w-10 h-10 text-red-600" />
              ) : form.type === 'video' ? (
                <Video className="w-10 h-10 text-blue-600" />
              ) : (
                <File className="w-10 h-10 text-gray-600" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{form.format}</p>
                <p className="text-xs text-gray-500">{form.size}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('form.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving || uploading || !form.url}
              className="px-4 py-2 bg-[#523A28] text-white rounded-lg hover:bg-[#3A2819] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('form.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PreviewModal({ asset, onClose }: { asset: DownloadAsset; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
              {asset.format}
            </span>
            <h2 className="text-sm font-semibold text-gray-900">{asset.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={asset.url}
              download={asset.slug}
              className="p-2 text-gray-600 hover:text-[#523A28] hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
            </a>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center">
          {asset.type === 'image' ? (
            <div className="relative w-full h-full min-h-[400px]">
              <Image src={asset.url} alt={asset.title} fill className="object-contain" />
            </div>
          ) : asset.type === 'pdf' ? (
            <iframe src={asset.url} className="w-full h-[80vh]" title={asset.title} />
          ) : asset.type === 'video' ? (
            <video controls className="max-w-full max-h-[80vh]">
              <source src={asset.url} />
            </video>
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-400 py-20">
              <File className="w-16 h-16" />
              <p className="text-sm">Prévisualisation non disponible pour ce format</p>
              <a href={asset.url} download={asset.slug} className="text-[#523A28] underline text-sm">
                Télécharger le fichier
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
