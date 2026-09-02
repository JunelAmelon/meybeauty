'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Search, Plus, Edit, Trash2, Loader2, Calendar, Clock } from 'lucide-react';
import { useAdminBlogs, AdminBlog, BlogDb } from '@/apps/admin/hooks/useAdminBlogs';
import BlogModal from '@/apps/admin/components/blog/BlogModal';

export default function BlogAdmin() {
  const { blogs, loading, deleteBlog, addBlog, updateBlog } = useAdminBlogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<AdminBlog | null>(null);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [blogs, searchTerm]);

  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBlogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBlogs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Supprimer l'article "${title}" ?`)) {
      try {
        await deleteBlog(id);
      } catch {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleCreate = () => {
    setSelectedBlog(null);
    setModalOpen(true);
  };

  const handleEdit = (blog: AdminBlog) => {
    setSelectedBlog(blog);
    setModalOpen(true);
  };

  const handleSaveBlog = async (data: BlogDb) => {
    if (selectedBlog) {
      await updateBlog(selectedBlog.id, data);
    } else {
      await addBlog(data);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 mb-2 font-bold">Blog</h1>
          <p className="text-gray-600">Gérer les articles de blog ({blogs.length})</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#523A28] text-white rounded-lg hover:bg-[#3A2819] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvel article
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total articles</p>
          <p className="text-2xl font-bold text-gray-900">{blogs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Catégories</p>
          <p className="text-2xl font-bold text-[#523A28]">{new Set(blogs.map(b => b.category)).size}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Avec image</p>
          <p className="text-2xl font-bold text-green-600">{blogs.filter(b => b.image && b.image !== '/placeholder.jpg').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, slug ou catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523A28] text-gray-900 bg-white"
          />
        </div>
      </div>

      {filteredBlogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Aucun article trouvé.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedBlogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all flex flex-col group"
              >
                <div className="relative h-48 bg-gray-50 overflow-hidden flex-shrink-0">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#523A28] text-white text-xs px-2 py-1 rounded-full">
                      {blog.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {blog.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {blog.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-10 leading-tight">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{blog.excerpt}</p>

                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#523A28]/10 text-[#523A28] rounded-lg hover:bg-[#523A28]/20 transition-colors text-xs font-bold"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id, blog.title)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
        </>
      )}

      <BlogModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        blog={selectedBlog}
        onSave={handleSaveBlog}
      />
    </div>
  );
}
