'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, updateDoc, serverTimestamp, collection, setDoc, query, orderBy, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { COLLECTIONS, validateMenuItem } from '@/lib/models';
import { use } from 'react';
import { optimizeImage } from '@/lib/utils';

export default function EditMenuItemPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const isNewItem = id === 'new';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'TRY',
    categoryId: '',
    imageUrls: [],
    nutritionInfo: {},
    tags: [],
    isAvailable: true,
    isFeatured: false,
    order: 0
  });
  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(!isNewItem);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCategories();
        await fetchAvailableTags();
        if (!isNewItem) {
          await fetchMenuItem();
        }
      } catch (err) {
        console.error('Veri getirme hatası:', err);
        setError('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isNewItem]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const q = query(
        collection(db, COLLECTIONS.CATEGORIES),
        orderBy('order', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData);
      
      // Eğer yeni bir öğe oluşturuluyorsa ve kategoriler varsa, ilk kategoriyi seç
      if (isNewItem && categoriesData.length > 0 && !formData.categoryId) {
        setFormData(prev => ({
          ...prev,
          categoryId: categoriesData[0].id
        }));
      }
      
      return categoriesData;
    } catch (error) {
      console.error('Kategorileri getirme hatası:', error);
      throw error;
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchAvailableTags = async () => {
    try {
      const q = query(collection(db, COLLECTIONS.MENU_ITEMS));
      const querySnapshot = await getDocs(q);
      
      // Tüm menü öğelerinden etiketleri topla
      const allTags = [];
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.tags && Array.isArray(data.tags)) {
          data.tags.forEach(tag => {
            if (!allTags.includes(tag)) {
              allTags.push(tag);
            }
          });
        }
      });
      
      setAvailableTags(allTags);
    } catch (error) {
      console.error('Etiketleri getirme hatası:', error);
    }
  };

  const fetchMenuItem = async () => {
    try {
      const docRef = doc(db, COLLECTIONS.MENU_ITEMS, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const menuItemData = docSnap.data();
        setFormData({
          name: menuItemData.name || '',
          description: menuItemData.description || '',
          price: menuItemData.price ? menuItemData.price.toString() : '',
          currency: menuItemData.currency || 'TRY',
          categoryId: menuItemData.categoryId || '',
          imageUrls: menuItemData.imageUrls || [],
          nutritionInfo: menuItemData.nutritionInfo || {},
          tags: menuItemData.tags || [],
          isAvailable: menuItemData.isAvailable !== false,
          isFeatured: menuItemData.isFeatured === true,
          order: menuItemData.order || 0
        });
        setImagePreviews(menuItemData.imageUrls || []);
      } else {
        setError('Menü öğesi bulunamadı');
      }
    } catch (error) {
      console.error('Menü öğesi getirme hatası:', error);
      setError('Menü öğesi yüklenirken bir hata oluştu');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Validasyon hatasını temizle
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      
      // Önizleme için URL'ler oluştur
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = async (index, isExisting = false) => {
    if (isExisting) {
      const imageUrl = formData.imageUrls[index];
      
      // Eğer kaydedilmiş bir görsel ise, önce URLs listesinden kaldır
      const newImageUrls = [...formData.imageUrls];
      newImageUrls.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        imageUrls: newImageUrls
      }));
      
      // Firebase Storage'dan silme işlemi (opsiyonel, form kaydedildiğinde de yapılabilir)
      try {
        // URL'den dosya yolunu çıkar
        const fileRef = ref(storage, imageUrl);
        await deleteObject(fileRef);
      } catch (error) {
        console.error('Görsel silme hatası:', error);
        // Silme hatası olsa bile UI'dan kaldırılmış olacak
      }
    } else {
      // Henüz yüklenmemiş bir görsel ise, sadece listeden kaldır
      const newImageFiles = [...imageFiles];
      newImageFiles.splice(index, 1);
      setImageFiles(newImageFiles);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const handleSelectTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Ürün adı gereklidir';
    }
    
    if (!formData.categoryId) {
      errors.categoryId = 'Kategori seçimi gereklidir';
    }
    
    if (!formData.price) {
      errors.price = 'Fiyat gereklidir';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      errors.price = 'Geçerli bir fiyat giriniz';
    }
    
    if (isNaN(parseInt(formData.order))) {
      errors.order = 'Geçerli bir sıra numarası giriniz';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return formData.imageUrls;
    
    const uploadPromises = imageFiles.map(async (file) => {
      // Resmi optimize et
      const optimizedFile = await optimizeImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8
      });
      
      const imagePath = `menu-items/${id !== 'new' ? id : Date.now()}_${file.name}`;
      const imageRef = ref(storage, imagePath);
      await uploadBytes(imageRef, optimizedFile);
      return await getDownloadURL(imageRef);
    });
    
    const newImageUrls = await Promise.all(uploadPromises);
    return [...formData.imageUrls, ...newImageUrls];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Görselleri yükle
      let finalImageUrls = formData.imageUrls;
      if (imageFiles.length > 0) {
        finalImageUrls = await uploadImages();
      }
      
      const menuItemData = {
        ...formData,
        imageUrls: finalImageUrls,
        price: parseFloat(formData.price),
        updatedAt: serverTimestamp()
      };
      
      if (isNewItem) {
        // Yeni menü öğesi oluştur
        const newDocRef = doc(collection(db, COLLECTIONS.MENU_ITEMS));
        menuItemData.createdAt = serverTimestamp();
        await setDoc(newDocRef, menuItemData);
      } else {
        // Mevcut menü öğesini güncelle
        await updateDoc(doc(db, COLLECTIONS.MENU_ITEMS, id), menuItemData);
      }
      
      router.push('/admin/menu-items');
    } catch (error) {
      console.error('Menü öğesi kaydetme hatası:', error);
      setError('Menü öğesi kaydedilirken bir hata oluştu');
      setSaving(false);
    }
  };

  if (loading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isNewItem ? 'Yeni Menü Öğesi Ekle' : 'Menü Öğesi Düzenle'}
        </h1>
        <Link
          href="/admin/menu-items"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Geri Dön
        </Link>
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

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="space-y-6">
          {/* Ürün Adı */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Ürün Adı *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full border ${
                validationErrors.name ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {validationErrors.name && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.name}</p>
            )}
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>

          {/* Fiyat ve Para Birimi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Fiyat *
              </label>
              <input
                type="number"
                step="0.01"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  validationErrors.price ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              />
              {validationErrors.price && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.price}</p>
              )}
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Para Birimi
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="TRY">TRY (₺)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
              Kategori *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={`mt-1 block w-full border ${
                validationErrors.categoryId ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            >
              <option value="">Kategori Seçin</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {validationErrors.categoryId && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.categoryId}</p>
            )}
          </div>

          {/* Sıralama */}
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700">
              Sıralama
            </label>
            <input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Düşük değerler menüde daha önce gösterilir.
            </p>
          </div>

          {/* Durum */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                Menüde Mevcut
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                Öne Çıkan Ürün
              </label>
            </div>
          </div>

          {/* Etiketler */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Etiketler
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                placeholder="Etiket ekleyin (örn: vejetaryen, glutensiz)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm"
              >
                Ekle
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-indigo-200 text-indigo-500 hover:bg-indigo-300 hover:text-indigo-600"
                  >
                    <svg
                      className="h-2 w-2"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 8 8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeWidth="1.5"
                        d="M1 1l6 6m0-6L1 7"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Resim Yükleme */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Ürün Resimleri</label>
            <div className="mt-2">
              <div className="flex flex-wrap gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, true)}
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
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
                ))}
                <label className="flex justify-center items-center h-24 w-24 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-xs text-gray-500">Resim yüklemek için tıklayın</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/menu-items')}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 