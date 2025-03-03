'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { collection, query, orderBy, getDocs, doc, deleteDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/models';
import { fetchCategories, fetchMenuItems } from '@/lib/firebaseUtils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { OptimizedImage } from '@/components/ui/optimized-image';

export default function MenuItemsPage() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeFilter, setActiveFilter] = useState(filterParam || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([loadCategories(), loadMenuItems()]);
      } catch (err) {
        console.error('Veri getirme hatası:', err);
        setError('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeFilter]);

  // Arama ve filtreleme işlemi için useEffect
  useEffect(() => {
    if (menuItems.length > 0) {
      const filtered = menuItems.filter(item => {
        const matchesSearch = !searchTerm || 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesSearch;
      });
      
      setFilteredItems(filtered);
    }
  }, [menuItems, searchTerm]);

  const loadCategories = async () => {
    try {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
      return categoriesData;
    } catch (error) {
      console.error('Kategorileri getirme hatası:', error);
      throw error;
    }
  };

  const loadMenuItems = async () => {
    try {
      const options = {
        formatDates: true
      };
      
      if (activeFilter === 'featured') {
        options.onlyFeatured = true;
      } else if (activeFilter !== 'all') {
        options.categoryId = activeFilter;
      }
      
      const menuItemsData = await fetchMenuItems(options);
      setMenuItems(menuItemsData);
      setFilteredItems(menuItemsData);
      return menuItemsData;
    } catch (error) {
      console.error('Menü öğelerini getirme hatası:', error);
      throw error;
    }
  };

  const handleToggleAvailable = async (id, currentStatus) => {
    try {
      const menuItemRef = doc(db, COLLECTIONS.MENU_ITEMS, id);
      await updateDoc(menuItemRef, {
        isAvailable: !currentStatus,
        updatedAt: new Date()
      });
      
      // Menü öğeleri listesini güncelle
      setMenuItems(prevItems => 
        prevItems.map(item => 
          item.id === id 
            ? { ...item, isAvailable: !currentStatus } 
            : item
        )
      );
      
      // Filtrelenmiş listeyi de güncelle
      setFilteredItems(prevItems => 
        prevItems.map(item => 
          item.id === id 
            ? { ...item, isAvailable: !currentStatus } 
            : item
        )
      );
    } catch (err) {
      console.error('Menü öğesi güncelleme hatası:', err);
      setError('Menü öğesi güncellenirken bir hata oluştu');
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      const menuItemRef = doc(db, COLLECTIONS.MENU_ITEMS, id);
      await updateDoc(menuItemRef, {
        isFeatured: !currentStatus,
        updatedAt: new Date()
      });
      
      // Menü öğeleri listesini güncelle
      setMenuItems(prevItems => 
        prevItems.map(item => 
          item.id === id 
            ? { ...item, isFeatured: !currentStatus } 
            : item
        )
      );
      
      // Filtrelenmiş listeyi de güncelle
      setFilteredItems(prevItems => 
        prevItems.map(item => 
          item.id === id 
            ? { ...item, isFeatured: !currentStatus } 
            : item
        )
      );
    } catch (err) {
      console.error('Menü öğesi güncelleme hatası:', err);
      setError('Menü öğesi güncellenirken bir hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, COLLECTIONS.MENU_ITEMS, id));
      
      // Menü öğeleri listesini güncelle
      setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
      setFilteredItems(prevItems => prevItems.filter(item => item.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Menü öğesi silme hatası:', err);
      setError('Menü öğesi silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Kategori Bulunamadı';
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setLoading(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading && menuItems.length === 0) {
    return <LoadingSpinner size="lg" text="Menü öğeleri yükleniyor..." className="py-10" />;
  }

  if (error && menuItems.length === 0) {
    return <ErrorMessage message={error} onRetry={() => Promise.all([loadCategories(), loadMenuItems()])} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-semibold text-gray-900">Menü Öğeleri</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/dashboard"
            className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm"
          >
            Dashboard'a Dön
          </Link>
          <Link
            href="/admin/menu-items/new"
            className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
          >
            Yeni Menü Öğesi
          </Link>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-full sm:w-auto">
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Kategoriye Göre Filtrele
            </label>
            <select
              id="category-filter"
              value={activeFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="featured">Öne Çıkanlar</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Ara
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Menü öğesi ara..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full sm:w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-8"
              />
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Aktif filtre bilgisi */}
        {(activeFilter !== 'all' || searchTerm) && (
          <div className="mt-3 flex items-center text-sm text-gray-600">
            <span>
              {filteredItems.length} sonuç bulundu
              {activeFilter !== 'all' && activeFilter !== 'featured' && (
                <span> - Kategori: {getCategoryName(activeFilter)}</span>
              )}
              {activeFilter === 'featured' && (
                <span> - Öne Çıkanlar</span>
              )}
              {searchTerm && (
                <span> - Arama: "{searchTerm}"</span>
              )}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Hata</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Menü öğesi bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? `"${searchTerm}" aramasına uygun menü öğesi bulunamadı.`
              : activeFilter !== 'all'
                ? 'Bu kategoride menü öğesi bulunmuyor.'
                : 'Henüz hiç menü öğesi eklenmemiş. Yeni bir menü öğesi eklemek için "Yeni Menü Öğesi" butonuna tıklayın.'}
          </p>
          {(searchTerm || activeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('all');
              }}
              className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Sıra
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ürün
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Kategori
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fiyat
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Durum
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {item.order}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.imageUrls && item.imageUrls.length > 0 ? (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <OptimizedImage
                              src={item.imageUrls[0]}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="rounded-full"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-10 w-10 mr-3 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg
                              className="h-6 w-6 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryName(item.categoryId)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {item.price.toFixed(2)} {item.currency}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleToggleAvailable(item.id, item.isAvailable)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.isAvailable
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.isAvailable ? 'Mevcut' : 'Mevcut Değil'}
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.isFeatured
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.isFeatured ? 'Öne Çıkan' : 'Normal'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/admin/menu-items/${item.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Düzenle
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Menü Öğesini Sil
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Bu menü öğesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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