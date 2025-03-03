'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/models';
import { fetchCategories } from '@/lib/firebaseUtils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { OptimizedImage } from '@/components/ui/optimized-image';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesData = await fetchCategories({ 
        orderField: 'order', 
        orderDirection: 'asc',
        requireAuth: true 
      });
      setCategories(categoriesData);
    } catch (err) {
      console.error('Kategorileri getirme hatası:', err);
      setError(err.message || 'Kategoriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (categoryId, currentStatus) => {
    try {
      const categoryRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
      await updateDoc(categoryRef, {
        isActive: !currentStatus,
        updatedAt: new Date()
      });
      
      // Kategori listesini güncelle
      setCategories(prevCategories => 
        prevCategories.map(category => 
          category.id === categoryId 
            ? { ...category, isActive: !currentStatus } 
            : category
        )
      );
    } catch (err) {
      console.error('Kategori güncelleme hatası:', err);
      setError('Kategori güncellenirken bir hata oluştu.');
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, categoryId));
      setCategories(prevCategories => prevCategories.filter(category => category.id !== categoryId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Kategori silme hatası:', err);
      setError('Kategori silinirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return <LoadingSpinner size="lg" text="Kategoriler yükleniyor..." className="py-10" />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadCategories} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kategoriler</h1>
        <Link
          href="/admin/categories/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Yeni Kategori Ekle
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Henüz kategori bulunmuyor.</p>
          <Link
            href="/admin/categories/new"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            İlk Kategoriyi Ekle
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 mr-4">
                        {category.imageUrl ? (
                          <OptimizedImage
                            src={category.imageUrl}
                            alt={category.name}
                            width={48}
                            height={48}
                            className="rounded-md"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                            <svg
                              className="h-6 w-6 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-indigo-600 truncate">
                          {category.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 truncate">
                          {category.description || 'Açıklama yok'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {category.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                      <button
                        onClick={() => handleToggleActive(category.id, category.isActive)}
                        className={`p-1 rounded-full ${
                          category.isActive
                            ? 'text-green-600 hover:bg-green-100'
                            : 'text-red-600 hover:bg-red-100'
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {category.isActive ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          )}
                        </svg>
                      </button>
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-full"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(category.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kategoriyi Sil</h3>
            <p className="text-sm text-gray-500 mb-4">
              Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 