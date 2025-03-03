'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCategories } from '@/lib/firebaseUtils';
import { COLLECTIONS } from '@/lib/models'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    categories: 0,
    menuItems: 0,
    featuredItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Kategorileri getir
        const categoriesQuery = query(
          collection(db, COLLECTIONS.CATEGORIES),
          orderBy('order', 'asc')
        );
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categoriesCount = categoriesSnapshot.size;

        // Tüm menü öğelerini getir
        const menuItemsQuery = query(
          collection(db, COLLECTIONS.MENU_ITEMS),
          orderBy('createdAt', 'desc')
        );
        const menuItemsSnapshot = await getDocs(menuItemsQuery);
        const menuItemsCount = menuItemsSnapshot.size;

        // Öne çıkan menü öğelerini getir
        const featuredItemsQuery = query(
          collection(db, COLLECTIONS.MENU_ITEMS),
          where('isFeatured', '==', true)
        );
        const featuredItemsSnapshot = await getDocs(featuredItemsQuery);
        const featuredItemsCount = featuredItemsSnapshot.size;

        setStats({
          categories: categoriesCount,
          menuItems: menuItemsCount,
          featuredItems: featuredItemsCount,
        });
      } catch (error) {
        console.error('İstatistikleri getirme hatası:', error);
        setError('İstatistikler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kategori Kartı */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-500">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-700">
                {stats.categories}
              </h2>
              <p className="text-gray-500">Kategoriler</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/categories"
              className="text-indigo-500 hover:text-indigo-600 text-sm font-medium"
            >
              Kategorileri Yönet &rarr;
            </Link>
          </div>
        </div>

        {/* Menü Öğeleri Kartı */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-700">
                {stats.menuItems}
              </h2>
              <p className="text-gray-500">Menü Öğeleri</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/menu-items"
              className="text-green-500 hover:text-green-600 text-sm font-medium"
            >
              Menü Öğelerini Yönet &rarr;
            </Link>
          </div>
        </div>

        {/* Öne Çıkan Öğeler Kartı */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-700">
                {stats.featuredItems}
              </h2>
              <p className="text-gray-500">Öne Çıkan Öğeler</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/menu-items?filter=featured"
              className="text-yellow-500 hover:text-yellow-600 text-sm font-medium"
            >
              Öne Çıkanları Yönet &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Hızlı Erişim Bölümü */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Hızlı Erişim
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/menu-items/new"
            className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100"
          >
            <svg
              className="h-6 w-6 text-indigo-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="text-gray-700">Yeni Menü Öğesi</span>
          </Link>
          <Link
            href="/admin/categories/new"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100"
          >
            <svg
              className="h-6 w-6 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="text-gray-700">Yeni Kategori</span>
          </Link>
          <Link
            href="/admin/qr-code"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100"
          >
            <svg
              className="h-6 w-6 text-purple-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            <span className="text-gray-700">QR Kod Oluştur</span>
          </Link>
          <Link
            href="/menu"
            target="_blank"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100"
          >
            <svg
              className="h-6 w-6 text-blue-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="text-gray-700">Menüyü Görüntüle</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 