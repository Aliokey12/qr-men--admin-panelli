'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Kullanıcı giriş yapmamışsa ve login sayfasında değilse, login sayfasına yönlendir
      if (!currentUser && !pathname.includes('/admin/login')) {
        router.push('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // Kullanıcı giriş yapmamışsa ve yükleme tamamlandıysa, sadece login sayfasını göster
  if (!user && !loading && !pathname.includes('/admin/login')) {
    return null;
  }

  // Login sayfasında ise, sadece içeriği göster (menü olmadan)
  if (pathname.includes('/admin/login')) {
    return <>{children}</>;
  }

  // Yükleme devam ediyorsa, yükleme ekranı göster
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Admin paneli menüsü
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Üst Menü */}
      <nav className="bg-indigo-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin/dashboard" className="text-xl font-bold">
                  QR Menü Admin
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  <span className="text-sm mr-4">
                    {user?.email}
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        await auth.signOut();
                        router.push('/admin/login');
                      } catch (error) {
                        console.error('Çıkış hatası:', error);
                      }
                    }}
                    className="px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-800"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700 focus:text-white"
                >
                  <svg
                    className={`${menuOpen ? 'hidden' : 'block'} h-6 w-6`}
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  <svg
                    className={`${menuOpen ? 'block' : 'hidden'} h-6 w-6`}
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobil Menü */}
        <div className={`${menuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 sm:px-3">
            <Link
              href="/admin/dashboard"
              className={`${
                pathname === '/admin/dashboard'
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
              } block px-3 py-2 rounded-md text-base font-medium`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/categories"
              className={`${
                pathname === '/admin/categories'
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
              } block px-3 py-2 rounded-md text-base font-medium`}
            >
              Kategoriler
            </Link>
            <Link
              href="/admin/menu-items"
              className={`${
                pathname === '/admin/menu-items'
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
              } block px-3 py-2 rounded-md text-base font-medium`}
            >
              Menü Öğeleri
            </Link>
            <Link
              href="/admin/media"
              className={`${
                pathname === '/admin/media'
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
              } block px-3 py-2 rounded-md text-base font-medium`}
            >
              Medya
            </Link>
            <Link
              href="/admin/qr-generator"
              className={`${
                pathname === '/admin/qr-generator'
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
              } block px-3 py-2 rounded-md text-base font-medium`}
            >
              QR Oluşturucu
            </Link>
            <Link
              href="/admin/users"
              className={`${
                pathname === '/admin/users'
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
              } block px-3 py-2 rounded-md text-base font-medium`}
            >
              Kullanıcılar
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-indigo-700">
            <div className="flex items-center px-5">
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2">
              <button
                onClick={async () => {
                  try {
                    await auth.signOut();
                    router.push('/admin/login');
                  } catch (error) {
                    console.error('Çıkış hatası:', error);
                  }
                }}
                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:text-white hover:bg-indigo-700"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Ana İçerik */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Yan Menü ve İçerik */}
          <div className="flex flex-col md:flex-row">
            {/* Yan Menü */}
            <div className="hidden md:block w-64 mr-8">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 bg-indigo-600 text-white">
                  <h3 className="text-lg font-medium">Admin Menü</h3>
                </div>
                <nav className="mt-2">
                  <Link
                    href="/admin/dashboard"
                    className={`${
                      pathname === '/admin/dashboard'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-4 py-3 text-sm font-medium border-l-4 ${
                      pathname === '/admin/dashboard'
                        ? 'border-indigo-600'
                        : 'border-transparent'
                    }`}
                  >
                    <svg
                      className={`${
                        pathname === '/admin/dashboard'
                          ? 'text-indigo-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/categories"
                    className={`${
                      pathname === '/admin/categories'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-4 py-3 text-sm font-medium border-l-4 ${
                      pathname === '/admin/categories'
                        ? 'border-indigo-600'
                        : 'border-transparent'
                    }`}
                  >
                    <svg
                      className={`${
                        pathname === '/admin/categories'
                          ? 'text-indigo-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    Kategoriler
                  </Link>
                  <Link
                    href="/admin/menu-items"
                    className={`${
                      pathname === '/admin/menu-items'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-4 py-3 text-sm font-medium border-l-4 ${
                      pathname === '/admin/menu-items'
                        ? 'border-indigo-600'
                        : 'border-transparent'
                    }`}
                  >
                    <svg
                      className={`${
                        pathname === '/admin/menu-items'
                          ? 'text-indigo-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Menü Öğeleri
                  </Link>
                  <Link
                    href="/admin/media"
                    className={`${
                      pathname === '/admin/media'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-4 py-3 text-sm font-medium border-l-4 ${
                      pathname === '/admin/media'
                        ? 'border-indigo-600'
                        : 'border-transparent'
                    }`}
                  >
                    <svg
                      className={`${
                        pathname === '/admin/media'
                          ? 'text-indigo-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Medya
                  </Link>
                  <Link
                    href="/admin/qr-generator"
                    className={`${
                      pathname === '/admin/qr-generator'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-4 py-3 text-sm font-medium border-l-4 ${
                      pathname === '/admin/qr-generator'
                        ? 'border-indigo-600'
                        : 'border-transparent'
                    }`}
                  >
                    <svg
                      className={`${
                        pathname === '/admin/qr-generator'
                          ? 'text-indigo-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z"
                        clipRule="evenodd"
                      />
                      <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
                    </svg>
                    QR Oluşturucu
                  </Link>
                  <Link
                    href="/admin/users"
                    className={`${
                      pathname === '/admin/users'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-4 py-3 text-sm font-medium border-l-4 ${
                      pathname === '/admin/users'
                        ? 'border-indigo-600'
                        : 'border-transparent'
                    }`}
                  >
                    <svg
                      className={`${
                        pathname === '/admin/users'
                          ? 'text-indigo-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Kullanıcılar
                  </Link>
                </nav>
              </div>
            </div>

            {/* İçerik */}
            <div className="flex-1">
              <div className="bg-white shadow rounded-lg p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 