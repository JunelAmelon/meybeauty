'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, Plus, Edit, Trash2, Loader2, X, FileText, Download, UploadCloud, File, Eye } from 'lucide-react';
import { useAdminProtocoles, AdminProtocole } from '@/apps/admin/hooks/useAdminProtocoles';
import { useTranslations } from 'next-intl';
import { uploadToCloudinary } from '@meybeauty/cloudinary';
import { Input } from '@/apps/admin/components/ui/input';
import { Textarea } from '@/apps/admin/components/ui/textarea';

const PROTOCOLE_CATEGORIES = [
  'Soins du visage',
  'Soins du corps',
  'Rituels cabine',
  'Fiches techniques',
  'Protocoles expert',
  'Soins spécifiques',
];

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

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(url);
}

export default function ProtocolesAdmin() {
  const { protocoles, loading, error, addProtocole, updateProtocole, deleteProtocole } = useAdminProtocoles();
  const t = useTranslations('admin.protocoles');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tous');

  const categories = useMemo(() => {
    const cats = new Set(protocoles.map((p) => p.category).filter(Boolean));
    return Array.from(cats);
  }, [protocoles]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProtocole | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewProto, setPreviewProto] = useState<AdminProtocole | null>(null);

  const filtered = useMemo(() => {
    return protocoles.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'Tous' || p.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [protocoles, searchTerm, typeFilter]);

  const allCategories = useMemo(() => {
    const cats = new Set([...PROTOCOLE_CATEGORIES, ...categories]);
    return Array.from(cats);
  }, [categories]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (proto: AdminProtocole) => {
    setEditing(proto);
    setModalOpen(true);
  };

  const handleDelete = (proto: AdminProtocole) => {
    if (window.confirm(`Supprimer "${proto.title}" ?`)) {
      deleteProtocole(proto.slug, proto.type);
    }
  };

  const handleSave = async (data: AdminProtocole) => {
    setSaving(true);
    try {
      if (editing) {
        await updateProtocole(data);
      } else {
        await addProtocole(data);
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = (proto: AdminProtocole) => {
    const url = proto.documentUrl || proto.image;
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${proto.slug}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
          <h1 className="text-2xl text-gray-900 mb-2 font-bold">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#523A28] text-white rounded-lg hover:bg-[#3A2819] transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('add')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">{t('stats_total')}</p>
          <p className="text-2xl font-bold text-gray-900">{protocoles.length}</p>
        </div>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((proto) => (
          <div
            key={`${proto.type}-${proto.slug}`}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all flex flex-col"
          >
            <div className="relative h-40 bg-gray-100 overflow-hidden flex items-center justify-center">
              <FileText className="w-16 h-16 text-gray-400" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mb-2 w-fit">
                {proto.category || '—'}
              </span>
              <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">{proto.title}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{proto.description}</p>
              <div className="flex items-center gap-2 mt-auto">
                <button
                  onClick={() => setPreviewProto(proto)}
                  className="p-2 text-gray-600 hover:text-[#523A28] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEdit(proto)}
                  className="p-2 text-gray-600 hover:text-[#523A28] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(proto)}
                  className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(proto)}
                  className="p-2 text-gray-600 hover:text-[#523A28] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">{t('empty')}</p>
        </div>
      )}

      {previewProto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewProto(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">{previewProto.title}</h2>
              <div className="flex items-center gap-2">
                <a
                  href={previewProto.documentUrl || previewProto.image}
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
              <iframe src={previewProto.documentUrl || previewProto.image} className="w-full h-[80vh]" title={previewProto.title} />
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <ProtocoleModal
          key={editing ? `edit-${editing.type}-${editing.slug}` : 'add'}
          protocole={editing}
          categories={allCategories}
          saving={saving}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function ProtocoleModal({
  protocole,
  categories,
  saving,
  onSave,
  onClose,
}: {
  protocole: AdminProtocole | null;
  categories: string[];
  saving: boolean;
  onSave: (data: AdminProtocole) => void;
  onClose: () => void;
}) {
  const t = useTranslations('admin.protocoles');
  const [form, setForm] = useState<AdminProtocole>(
    protocole || {
      slug: '',
      type: 'fiche',
      title: '',
      description: '',
      category: '',
      image: '',
      documentUrl: '',
      reference: '',
      duration: '',
    }
  );
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [docFileName, setDocFileName] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState(false);

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: protocole ? prev.slug : slugify(title),
    }));
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFileName(file.name);
    setUploadError(null);
    setUploadingDoc(true);
    try {
      const url = await uploadToCloudinary(file, { folder: 'protocoles' });
      setForm((prev) => ({ ...prev, documentUrl: url, image: url }));
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Erreur upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.title || !form.documentUrl) return;
    onSave(form);
  };

  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {protocole ? t('edit') : t('add')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>{t('form.title')}</label>
            <Input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls}>{t('form.description')}</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <label className={labelCls}>{t('form.category')}</label>
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
          <div>
            <label className={labelCls}>{t('form.file')}</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#523A28] transition-colors">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleDocUpload}
                className="hidden"
                id="doc-upload"
                disabled={uploadingDoc}
              />
              <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center gap-2">
                {uploadingDoc ? (
                  <><Loader2 className="w-8 h-8 text-[#523A28] animate-spin" /><span className="text-sm text-gray-600">{t('form.uploading')}</span></>
                ) : form.documentUrl ? (
                  <><FileText className="w-8 h-8 text-green-600" /><span className="text-sm text-gray-700 font-medium truncate w-full">{docFileName || form.documentUrl.split('/').pop()}</span><span className="text-xs text-[#523A28] underline">{t('form.replace_file')}</span></>
                ) : (
                  <><UploadCloud className="w-8 h-8 text-gray-400" /><span className="text-sm text-gray-600">{t('form.upload_placeholder')}</span></>
                )}
              </label>
            </div>
            {uploadError && <p className="text-sm text-red-600 mt-2">{uploadError}</p>}
          </div>
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
              disabled={saving || uploadingDoc}
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
