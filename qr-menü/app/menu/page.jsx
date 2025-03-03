'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/models';
import { fetchCategories } from '@/lib/firebaseUtils';
import Image from 'next/image';

// Memo ile optimize edilmiş alt bileşenler
const MenuItem = memo(({ item }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    {item.imageUrl && (
      <div className="relative h-48 w-full">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          loading="lazy"
          quality={75}
          placeholder="blur"
          blurDataURL={item.imageUrl + '?w=10&q=10'}
          onError={(e) => {
            e.target.src = '/images/placeholder.png';
          }}
        />
      </div>
    )}
    <div className="p-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
        <span className="font-bold text-indigo-600">{item.price} {item.currency || 'TL'}</span>
      </div>
      {item.description && (
        <p className="mt-2 text-gray-600 text-sm line-clamp-2">{item.description}</p>
      )}
      {item.tags && item.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.tags.map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
));

const CategoryButton = memo(({ category, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'bg-white text-gray-700 hover:bg-gray-100'
    }`}
  >
    {category.name}
  </button>
));

const SearchInput = memo(({ value, onChange }) => (
  <div className="relative">
    <input
      type="text"
      placeholder="Menüde ara..."
      value={value}
      onChange={onChange}
      className="w-full px-3 md:px-4 py-1.5 md:py-2 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-800 text-sm md:text-base"
    />
    {value && (
      <button 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
        onClick={() => onChange({ target: { value: '' } })}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </button>
    )}
  </div>
));

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredItems, setFeaturedItems] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [maxPrice, setMaxPrice] = useState(1000);
  const [activeTags, setActiveTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Veri getirme işlemini useCallback ile optimize ediyoruz
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Her denemede hata durumunu sıfırla
      
      // Kategorileri getir
      try {
        // Doğrudan Firestore sorgusu yerine yardımcı fonksiyonu kullan
        const categoriesData = await fetchCategories({
          onlyActive: true,
          orderField: 'order',
          orderDirection: 'asc',
          requireAuth: false // Menü sayfası için kimlik doğrulama gerekmez
        });
        
        setCategories(categoriesData);
        
        if (categoriesData.length === 0) {
          console.log('Hiç kategori bulunamadı');
        }
      } catch (categoryError) {
        console.error('Kategorileri getirme hatası:', categoryError);
        // Kategori hatası olsa bile menü öğelerini getirmeye çalış
        // Hata mesajını gösterme - kullanıcı deneyimini bozmamak için
      }

      // Tüm menü öğelerini getir
      try {
        const menuItemsQuery = query(
          collection(db, COLLECTIONS.MENU_ITEMS),
          where('isAvailable', '==', true),
          orderBy('order', 'asc')
        );
        const menuItemsSnapshot = await getDocs(menuItemsQuery);
        const menuItemsData = menuItemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMenuItems(menuItemsData);

        // Öne çıkan ürünleri ayır
        const featured = menuItemsData.filter(item => item.isFeatured);
        setFeaturedItems(featured);

        // Maksimum fiyatı bul
        const prices = menuItemsData.map(item => item.price || 0);
        const maxItemPrice = prices.length > 0 ? Math.max(...prices) : 1000;
        setMaxPrice(Math.ceil(maxItemPrice));
        setPriceRange({ min: 0, max: Math.ceil(maxItemPrice) });

        // Mevcut tüm etiketleri topla
        const allTags = menuItemsData.reduce((tags, item) => {
          if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach(tag => {
              if (!tags.includes(tag)) {
                tags.push(tag);
              }
            });
          }
          return tags;
        }, []);
        setAvailableTags(allTags);
      } catch (menuError) {
        console.error('Menü öğelerini getirme hatası:', menuError);
        // Menü öğeleri getirilemezse boş bir dizi kullan
        setMenuItems([]);
        setFeaturedItems([]);
        setAvailableTags([]);
        
        // Sadece her iki sorgu da başarısız olursa hata göster
        if (categories.length === 0) {
          setError('Menü yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        }
      }
    } catch (err) {
      console.error('Menü verilerini getirme hatası:', err);
      setError('Menü yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect'i dependencies ile optimize ediyoruz
  useEffect(() => {
    let isSubscribed = true;
    
    const loadData = async () => {
      if (!isSubscribed) return;
      await fetchData();
    };
    
    loadData();
    
    return () => {
      isSubscribed = false;
    };
  }, [fetchData]);

  // Kategori değiştirme işlemini useCallback ile optimize ediyoruz
  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(prev => prev === categoryId ? null : categoryId);
  }, []);

  // Arama işlemini useCallback ile optimize ediyoruz
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Filtrelenmiş menü öğelerini useMemo ile hesaplıyoruz
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = !activeCategory || item.categoryId === activeCategory;
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesPrice = item.price >= priceRange.min && item.price <= priceRange.max;
      const matchesTags = activeTags.length === 0 || 
        (item.tags && activeTags.every(tag => item.tags.includes(tag)));
      
      return matchesCategory && matchesSearch && matchesPrice && matchesTags;
    });
  }, [menuItems, activeCategory, searchTerm, priceRange, activeTags]);

  // Öne çıkan ürünleri useMemo ile hesaplıyoruz
  const visibleFeaturedItems = useMemo(() => {
    if (activeCategory || searchTerm || activeTags.length > 0) return [];
    return featuredItems;
  }, [featuredItems, activeCategory, searchTerm, activeTags]);

  // Render edilecek kategori başlığını useMemo ile hesaplıyoruz
  const categoryTitle = useMemo(() => {
    if (!activeCategory) return 'Tüm Ürünler';
    return categories.find(c => c.id === activeCategory)?.name || 'Ürünler';
  }, [activeCategory, categories]);

  // Etiket değiştirme işlemini useCallback ile optimize ediyoruz
  const handleTagToggle = useCallback((tag) => {
    setActiveTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  }, []);

  // Filtreleri sıfırlama işlemini useCallback ile optimize ediyoruz
  const resetFilters = useCallback(() => {
    setActiveCategory(null);
    setSearchTerm('');
    setPriceRange({ min: 0, max: maxPrice });
    setActiveTags([]);
  }, [maxPrice]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md w-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Bir Hata Oluştu</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              setTimeout(() => fetchData(), 500); // Kısa bir gecikme ekleyerek kullanıcıya geri bildirim sağla
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-4 md:py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center">Dijital Menü</h1>
          
          {/* Arama Kutusu */}
          <div className="mt-3 md:mt-4 max-w-md mx-auto">
            <SearchInput value={searchTerm} onChange={handleSearch} />
          </div>
          
          {/* Filtre Butonu */}
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>{showFilters ? 'Filtreleri Gizle' : 'Filtreleri Göster'}</span>
              {(activeTags.length > 0 || priceRange.min > 0 || priceRange.max < maxPrice) && (
                <span className="ml-1 bg-white text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {activeTags.length + (priceRange.min > 0 || priceRange.max < maxPrice ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Gelişmiş Filtreler */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2 md:mb-0">Filtreler</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Filtreleri Sıfırla
              </button>
            </div>
            
            {/* Fiyat Aralığı */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiyat Aralığı: {priceRange.min} - {priceRange.max} {menuItems[0]?.currency || 'TL'}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            
            {/* Etiketler */}
            {availableTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiketler
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activeTags.includes(tag)
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aktif Filtreler Özeti */}
        {(activeCategory || searchTerm || activeTags.length > 0 || priceRange.min > 0 || priceRange.max < maxPrice) && (
          <div className="bg-gray-100 rounded-lg p-3 mb-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-700 font-medium">Aktif Filtreler:</span>
              
              {activeCategory && (
                <span className="bg-white px-2 py-1 rounded-full text-xs flex items-center">
                  {categories.find(c => c.id === activeCategory)?.name || 'Kategori'}
                  <button 
                    onClick={() => handleCategoryChange(null)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              
              {searchTerm && (
                <span className="bg-white px-2 py-1 rounded-full text-xs flex items-center">
                  Arama: {searchTerm}
                  <button 
                    onClick={() => handleSearch({ target: { value: '' } })}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              
              {(priceRange.min > 0 || priceRange.max < maxPrice) && (
                <span className="bg-white px-2 py-1 rounded-full text-xs flex items-center">
                  Fiyat: {priceRange.min} - {priceRange.max} {menuItems[0]?.currency || 'TL'}
                  <button 
                    onClick={() => setPriceRange({ min: 0, max: maxPrice })}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              
              {activeTags.map(tag => (
                <span key={tag} className="bg-white px-2 py-1 rounded-full text-xs flex items-center">
                  {tag}
                  <button 
                    onClick={() => handleTagToggle(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
              
              <span className="text-gray-500 text-xs">
                {filteredMenuItems.length} ürün bulundu
              </span>
            </div>
          </div>
        )}

        {/* Kategori Seçimi */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            <CategoryButton
              category={{ name: 'Tümü' }}
              isActive={!activeCategory}
              onClick={() => handleCategoryChange(null)}
            />
            {categories.map(category => (
              <CategoryButton
                key={category.id}
                category={category}
                isActive={activeCategory === category.id}
                onClick={() => handleCategoryChange(category.id)}
              />
            ))}
          </div>
        </div>

        {/* Öne Çıkan Ürünler */}
        {visibleFeaturedItems.length > 0 && !activeCategory && !searchTerm && activeTags.length === 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Öne Çıkan Ürünler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleFeaturedItems.map(item => (
                <MenuItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Menü Öğeleri */}
        {filteredMenuItems.length > 0 ? (
          <div>
            {activeCategory && (
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {categoryTitle}
              </h2>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenuItems.map(item => (
                <MenuItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Ürün Bulunamadı</h3>
            <p className="text-gray-600 mb-4">Arama kriterlerinize uygun ürün bulunamadı.</p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Hatay Lezzetleri</h2>
              <p className="text-gray-400 text-sm mt-1">Antep ciğer, kavurma ve tost çeşitleri</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} Tüm hakları saklıdır.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                QR Menü Sistemi
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 