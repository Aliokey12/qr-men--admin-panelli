// Menü veri modelleri

/**
 * Kategori modeli
 * @typedef {Object} Category
 * @property {string} id - Kategori ID
 * @property {string} name - Kategori adı
 * @property {string} description - Kategori açıklaması (opsiyonel)
 * @property {number} order - Sıralama değeri
 * @property {string} imageUrl - Kategori resmi URL (opsiyonel)
 * @property {boolean} isActive - Kategori aktif mi?
 * @property {Date} createdAt - Oluşturulma tarihi
 * @property {Date} updatedAt - Güncellenme tarihi
 */

/**
 * Menü öğesi modeli
 * @typedef {Object} MenuItem
 * @property {string} id - Menü öğesi ID
 * @property {string} name - Menü öğesi adı
 * @property {string} description - Menü öğesi açıklaması
 * @property {number} price - Fiyat
 * @property {string} currency - Para birimi (TRY, USD, EUR, vb.)
 * @property {string} categoryId - Bağlı olduğu kategori ID
 * @property {string[]} imageUrls - Resim URL'leri dizisi
 * @property {Object} nutritionInfo - Besin değerleri (opsiyonel)
 * @property {string[]} tags - Etiketler (opsiyonel - vejetaryen, glutensiz, vb.)
 * @property {boolean} isAvailable - Menüde mevcut mu?
 * @property {boolean} isFeatured - Öne çıkan ürün mü?
 * @property {number} order - Sıralama değeri
 * @property {Date} createdAt - Oluşturulma tarihi
 * @property {Date} updatedAt - Güncellenme tarihi
 */

/**
 * Kullanıcı modeli
 * @typedef {Object} User
 * @property {string} id - Kullanıcı ID
 * @property {string} email - E-posta adresi
 * @property {string} displayName - Görünen ad
 * @property {string} role - Rol (admin, editor, vb.)
 * @property {Date} createdAt - Oluşturulma tarihi
 * @property {Date} lastLogin - Son giriş tarihi
 */

// Firestore koleksiyon isimleri
export const COLLECTIONS = {
  CATEGORIES: 'categories',
  MENU_ITEMS: 'menuItems',
  USERS: 'users',
  SETTINGS: 'settings',
  ANALYTICS: 'analytics'
};

// Veri şemaları ve doğrulama fonksiyonları buraya eklenebilir
export const validateMenuItem = (menuItem) => {
  const errors = {};
  
  if (!menuItem.name || menuItem.name.trim() === '') {
    errors.name = 'Ürün adı zorunludur';
  }
  
  if (!menuItem.price || isNaN(menuItem.price) || menuItem.price <= 0) {
    errors.price = 'Geçerli bir fiyat girilmelidir';
  }
  
  if (!menuItem.categoryId) {
    errors.categoryId = 'Kategori seçilmelidir';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCategory = (category) => {
  const errors = {};
  
  if (!category.name || category.name.trim() === '') {
    errors.name = 'Kategori adı zorunludur';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 