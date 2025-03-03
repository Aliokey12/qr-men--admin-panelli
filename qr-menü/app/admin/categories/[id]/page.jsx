'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, updateDoc, serverTimestamp, collection, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS, validateCategory } from '@/lib/models';
import { use } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { ImageUpload } from '@/components/ui/image-upload';

export default function EditCategoryPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const isNewCategory = id === 'new';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
    isActive: true,
    imageUrl: ''
  });
  const [loading, setLoading] = useState(!isNewCategory);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!isNewCategory) {
      fetchCategory();
    }
  }, [id, isNewCategory]);

  const fetchCategory = async () => {
    try {
      const docRef = doc(db, COLLECTIONS.CATEGORIES, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const categoryData = docSnap.data();
        setFormData({
          name: categoryData.name || '',
          description: categoryData.description || '',
          order: categoryData.order || 0,
          isActive: categoryData.isActive !== false, // Default to true if not specified
          imageUrl: categoryData.imageUrl || ''
        });
      } else {
        setError('Kategori bulunamadı');
      }
    } catch (err) {
      console.error('Kategori getirme hatası:', err);
      setError('Kategori yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Validation error'u temizle
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    if (!isNaN(numValue)) {
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
    
    // Validation error'u temizle
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageUploaded = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      imageUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validasyonu
    const validationResult = validateCategory(formData);
    if (!validationResult.isValid) {
      setValidationErrors(validationResult.errors);
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const categoryData = {
        ...formData,
        updatedAt: serverTimestamp()
      };
      
      if (isNewCategory) {
        // Yeni kategori oluştur
        categoryData.createdAt = serverTimestamp();
        const newCategoryRef = doc(collection(db, COLLECTIONS.CATEGORIES));
        await setDoc(newCategoryRef, categoryData);
      } else {
        // Mevcut kategoriyi güncelle
        const categoryRef = doc(db, COLLECTIONS.CATEGORIES, id);
        await updateDoc(categoryRef, categoryData);
      }
      
      router.push('/admin/categories');
    } catch (err) {
      console.error('Kategori kaydetme hatası:', err);
      setError('Kategori kaydedilirken bir hata oluştu');
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Kategori yükleniyor..." className="py-10" />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isNewCategory ? 'Yeni Kategori Ekle' : 'Kategori Düzenle'}
        </h1>
        <Link
          href="/admin/categories"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Geri Dön
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Kategori Adı *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  validationErrors.name ? 'border-red-500' : ''
                }`}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                Sıralama
              </label>
              <input
                type="number"
                id="order"
                name="order"
                min="0"
                value={formData.order}
                onChange={handleNumberChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Aktif
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori Resmi
            </label>
            <ImageUpload
              initialImage={formData.imageUrl}
              folder="categories"
              onImageUploaded={handleImageUploaded}
              aspectRatio="square"
              className="mb-4"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link
            href="/admin/categories"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
} 