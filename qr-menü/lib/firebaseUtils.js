// Firebase ile etkileşim için yardımcı fonksiyonlar
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage } from './firebase';
import { COLLECTIONS } from './models';
import { optimizeImage } from './utils';

// ===== Kimlik Doğrulama İşlemleri =====

/**
 * Kullanıcı girişi yapar
 * @param {string} email - Kullanıcı e-posta adresi
 * @param {string} password - Kullanıcı şifresi
 * @returns {Promise<UserCredential>} - Kullanıcı kimlik bilgileri
 */
export const loginUser = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Giriş hatası:', error);
    throw error;
  }
};

/**
 * Kullanıcı çıkışı yapar
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    return await signOut(auth);
  } catch (error) {
    console.error('Çıkış hatası:', error);
    throw error;
  }
};

/**
 * Şifre sıfırlama e-postası gönderir
 * @param {string} email - Kullanıcı e-posta adresi
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    throw error;
  }
};

// ===== Kategori İşlemleri =====

/**
 * Yeni kategori ekler
 * @param {Object} categoryData - Kategori verileri
 * @returns {Promise<string>} - Eklenen kategorinin ID'si
 */
export const addCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Kategori ekleme hatası:', error);
    throw error;
  }
};

/**
 * Kategorileri getirir
 * @param {Object} options - Sorgu seçenekleri
 * @param {boolean} options.onlyActive - Sadece aktif kategorileri getir
 * @param {string} options.orderField - Sıralama alanı (varsayılan: 'order')
 * @param {string} options.orderDirection - Sıralama yönü ('asc' veya 'desc', varsayılan: 'asc')
 * @returns {Promise<Array>} - Kategoriler dizisi
 */
export const fetchCategories = async (options = {}) => {
  try {
    const { 
      onlyActive = false, 
      orderField = 'order', 
      orderDirection = 'asc',
      requireAuth = false
    } = options;
    
    // Firebase bağlantısını kontrol et
    if (!db) {
      console.error('Firestore bağlantısı bulunamadı');
      throw new Error('Veritabanı bağlantısı kurulamadı. Lütfen sayfayı yenileyin.');
    }
    
    // Kimlik doğrulama kontrolü - admin sayfaları için
    if (requireAuth && !auth.currentUser) {
      console.error('Oturum açılmamış');
      throw new Error('Bu işlemi gerçekleştirmek için giriş yapmanız gerekiyor.');
    }
    
    // Menü sayfası için kimlik doğrulama gerekmeden kategorileri getir
    let q = collection(db, COLLECTIONS.CATEGORIES);
    
    // Sorgu koşullarını oluştur
    const queryConstraints = [];
    
    if (onlyActive) {
      queryConstraints.push(where('isActive', '==', true));
    }
    
    queryConstraints.push(orderBy(orderField, orderDirection));
    
    // Sorguyu oluştur
    q = query(q, ...queryConstraints);
    
    try {
      // Önbellek kullanımını optimize et
      const querySnapshot = await getDocs(q);
      
      // Veri yoksa boş dizi döndür
      if (querySnapshot.empty) {
        console.log('Kategori bulunamadı');
        return [];
      }
      
      // Verileri dönüştür
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (firestoreError) {
      console.error('Firestore sorgu hatası:', firestoreError);
      
      // Yetki hatası kontrolü
      if (firestoreError.code === 'permission-denied') {
        if (window.location.pathname.includes('/admin')) {
          throw new Error('Kategorilere erişim izniniz yok. Lütfen giriş yapın veya yöneticinize başvurun.');
        } else {
          // Menü sayfası için sessizce boş dizi döndür
          console.warn('Yetki hatası, ancak menü sayfası için boş dizi döndürülüyor');
          return [];
        }
      }
      
      throw firestoreError;
    }
  } catch (error) {
    console.error('Kategorileri getirme hatası:', error);
    
    // Daha açıklayıcı hata mesajı
    if (error.code === 'permission-denied') {
      throw new Error('Kategorilere erişim izniniz yok. Lütfen giriş yapın veya yöneticinize başvurun.');
    } else if (error.code === 'unavailable') {
      throw new Error('Sunucu bağlantısı kurulamadı. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.');
    } else {
      throw new Error(error.message || 'Kategoriler yüklenirken bir hata oluştu.');
    }
  }
};

// ===== Menü Öğesi İşlemleri =====

/**
 * Yeni menü öğesi ekler
 * @param {Object} menuItemData - Menü öğesi verileri
 * @returns {Promise<string>} - Eklenen menü öğesinin ID'si
 */
export const addMenuItem = async (menuItemData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.MENU_ITEMS), {
      ...menuItemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Menü öğesi ekleme hatası:', error);
    throw error;
  }
};

/**
 * Menü öğelerini getirir
 * @param {Object} options - Sorgu seçenekleri
 * @param {boolean} options.onlyAvailable - Sadece mevcut öğeleri getir
 * @param {boolean} options.onlyFeatured - Sadece öne çıkan öğeleri getir
 * @param {string} options.categoryId - Belirli bir kategoriye ait öğeleri getir
 * @param {string} options.orderField - Sıralama alanı (varsayılan: 'order')
 * @param {string} options.orderDirection - Sıralama yönü ('asc' veya 'desc', varsayılan: 'asc')
 * @param {boolean} options.formatDates - Tarih alanlarını formatla
 * @returns {Promise<Array>} - Menü öğeleri dizisi
 */
export const fetchMenuItems = async (options = {}) => {
  try {
    const { 
      onlyAvailable = false, 
      onlyFeatured = false, 
      categoryId = null, 
      orderField = 'order', 
      orderDirection = 'asc',
      formatDates = false
    } = options;
    
    let q = collection(db, COLLECTIONS.MENU_ITEMS);
    
    // Sorgu koşullarını oluştur
    const queryConstraints = [];
    
    if (onlyAvailable) {
      queryConstraints.push(where('isAvailable', '==', true));
    }
    
    if (onlyFeatured) {
      queryConstraints.push(where('isFeatured', '==', true));
    }
    
    if (categoryId) {
      queryConstraints.push(where('categoryId', '==', categoryId));
    }
    
    queryConstraints.push(orderBy(orderField, orderDirection));
    
    // Sorguyu oluştur
    q = query(q, ...queryConstraints);
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const item = {
        id: doc.id,
        ...data
      };
      
      // Tarih alanlarını formatla
      if (formatDates) {
        if (data.createdAt) {
          item.createdAt = data.createdAt.toDate().toLocaleString();
        }
        if (data.updatedAt) {
          item.updatedAt = data.updatedAt.toDate().toLocaleString();
        }
      }
      
      return item;
    });
  } catch (error) {
    console.error('Menü öğelerini getirme hatası:', error);
    throw error;
  }
};

/**
 * Kategoriye göre menü öğelerini getirir
 * @param {string} categoryId - Kategori ID
 * @returns {Promise<Array>} - Menü öğeleri dizisi
 */
export const getMenuItemsByCategory = async (categoryId) => {
  return fetchMenuItems({ 
    categoryId, 
    onlyAvailable: true, 
    orderField: 'order', 
    orderDirection: 'asc' 
  });
};

// ===== Dosya Yükleme İşlemleri =====

/**
 * Resim dosyasını Firebase Storage'a yükler
 * @param {File} file - Yüklenecek dosya
 * @param {string} path - Yükleme yolu
 * @param {Object} options - Optimizasyon seçenekleri
 * @param {number} options.maxWidth - Maksimum genişlik (piksel)
 * @param {number} options.maxHeight - Maksimum yükseklik (piksel)
 * @param {number} options.quality - JPEG kalitesi (0-1 arası)
 * @returns {Promise<string>} - Yüklenen dosyanın URL'i
 */
export const uploadImage = async (file, path, options = {}) => {
  try {
    // Resmi optimize et
    const optimizedFile = await optimizeImage(file, options);
    
    // Firebase Storage'a yükle
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, optimizedFile);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    throw error;
  }
}; 