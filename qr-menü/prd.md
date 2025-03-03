# QR Menü Sistemi Ürün Gereksinim Belgesi

## 1. Genel Bakış
Mobil cihazlardan erişilebilen dinamik bir dijital menü sistemi ve bu menüyü yönetebilecek bir admin paneli. Restoran sahipleri menüyü admin panelinden güncelleyebilecek, müşteriler ise QR kod aracılığıyla güncel menüye ulaşabilecek.

## 2. Temel Özellikler

### 2.1 Müşteri Yüzü (QR Menü)
- ✅ QR kod ile açılan responsive tasarım
- 🍔 Kategori bazlı menü görüntüleme
- 📸 Ürün fotoğrafları ve açıklamaları
- 💲 Fiyat bilgileri ve para birimi desteği
- 🔍 Arama ve filtreleme özellikleri
- 🌍 Çoklu dil desteği (opsiyonel)

### 2.2 Admin Paneli
- 🔑 Kullanıcı girişi ve yetkilendirme
- 📝 Menü öğeleri CRUD işlemleri (Oluşturma/Okuma/Güncelleme/Silme)
- 🗂️ Kategori yönetimi
- 📈 Temel analitik (Görüntülenme sayısı vb.)
- 🖼️ Medya yönetimi (Resim yükleme/düzenleme)
- 🚀 Anlık güncelleme yayınlama

## 3. Teknik Mimari

### 3.1 Backend (Headless CMS Önerileri)
1. Firebase (Firestore + Storage + Auth)
2. Supabase (Open source alternatif)
3. Strapi (Self-hosted)

*Tercih sebebi: Backend bilgisi gerektirmeden hızlı kurulum*

### 3.2 Frontend
- React/Next.js (SSR desteği ile)
- Tailwind CSS (Hızlı styling)
- QR Code React (QR oluşturma)

### 3.3 Hosting
- Vercel (Next.js için optimize)
- Netlify (Alternatif)
- Firebase Hosting

## 4. Geliştirme Aşamaları

### Faz 1: Temel MVP
1. Admin giriş sayfası
2. Basit menü düzenleme arayüzü
3. QR oluşturucu
4. Statik menü görüntüleme sayfası

### Faz 2: Gelişmiş Özellikler
1. Gerçek zamanlı güncelleme
2. Çoklu dil desteği
3. Analitik panel
4. Medya yönetimi

## 5. Tasarım Önerileri
1. Figma ile prototipleme
2. Tailwind UI componentleri
3. Admin paneli için ready-made template (örn. AdminJS)
4. Müşteri arayüzü için mobile-first tasarım

## 6. Test Senaryoları
1. Cross-browser testleri
2. Mobil cihaz testleri
3. Yük testi (Anlık QR okunmaları)
4. Güvenlik testleri (Admin panel erişimi)

## 7. Potansiyel Zorluklar
1. Realtime veri senkronizasyonu
2. Medya optimizasyonu (resim boyutlandırma)
3. Yetkilendirme yönetimi
4. SEO optimizasyonu (SSR ile çözülebilir)

## 8. Zaman Çizelgesi (Tahmini)
- Faz 1: 2-3 hafta
- Faz 2: +1-2 hafta
- Test ve deploy: 1 hafta

## 9. Bakım Planı
1. Aylık yedekleme
2. Güvenlik güncellemeleri
3. Kullanıcı geri bildirimleri ile iyileştirmeler

## 10. Yapıldı ve Yapılacaklar

### Yapıldı
- [x] Next.js projesi kurulumu
- [x] Tailwind CSS entegrasyonu
- [x] Temel proje yapısı (app/, components/, lib/, styles/ klasörleri)
- [x] Geliştirme ortamı hazırlığı
- [x] Firebase entegrasyonu
- [x] Menü veri modelinin oluşturulması
- [x] Admin paneli giriş sayfası
- [x] Admin paneli layout yapısı
- [x] Admin dashboard sayfası
- [x] Admin paneli menü yönetim arayüzü
- [x] Kategori yönetim arayüzü
- [x] Ürün yönetim arayüzü
- [x] QR kod oluşturma ve indirme özelliği
- [x] Müşteri menü görüntüleme sayfası
- [x] Medya yükleme ve yönetim sistemi
- [x] Responsive tasarım uygulaması
- [x] Arama ve filtreleme özellikleri
- [x] Performans optimizasyonu
- [x] Kullanıcı yönetimi

## 11. Eksikler

### Firebase Yapılandırma Sorunları
- [x] `next.config.js` ve `next.config.ts` dosyaları arasında çakışma - Projede iki farklı Next.js yapılandırma dosyası bulunuyor. `next.config.js` dosyası `output: 'export'` kullanırken, `next.config.ts` dosyası `output: 'standalone'` kullanıyor. Bu çakışma build sürecinde hatalara neden olabilir. Tek bir yapılandırma dosyası kullanılmalı.
- [x] Firebase Storage'da büyük resim dosyaları için optimizasyon eksikliği - Büyük resim dosyaları performans sorunlarına neden olabilir. Yükleme öncesi resim boyutlandırma ve sıkıştırma işlemleri eklenmeli.

### Medya Yönetim Sistemi Sorunları
- [x] Medya yükleme sırasında hata işleme eksikliği - `app/admin/media/page.jsx` dosyasında yükleme hataları için yeterli hata işleme mekanizması bulunmuyor. Kullanıcıya daha açıklayıcı hata mesajları gösterilmeli.
- [x] Dosya türü doğrulama eksikliği - Yüklenen dosyaların türü client-side'da doğrulanmıyor, sadece Firebase güvenlik kurallarına güveniliyor. Client-side doğrulama eklenmeli.

### QR Kod Oluşturma Sorunları
- [x] Logo ekleme özelliği
- [x] SVG indirme stil sorunları

### Performans Sorunları
- [x] Next.js export yapılandırması
- [x] Büyük resim dosyaları için optimizasyon
- [x] Build sürecinde izin hataları

### Güvenlik Eksikleri
- [x] Admin paneli için yetersiz erişim kontrolü
- [x] Firebase Authentication için güvenlik kuralları eksikliği
- [x] Firestore için güvenlik kuralları eksikliği
- [x] Storage için güvenlik kuralları eksikliği

## Teknik Detaylar

### Kullanılan Teknolojiler
- Next.js 14
- Firebase (Authentication, Firestore, Storage)
- Tailwind CSS
- React
- JavaScript/TypeScript

### Firebase Kullanım Alanları
- **Firebase Authentication**: Kullanıcı kimlik doğrulama ve yetkilendirme işlemleri için kullanılmaktadır.
  - Kullanıcı girişi (Email/Şifre)
  - Kullanıcı kaydı
  - Kullanıcı çıkışı
  - Şifre sıfırlama
  - Kullanıcı rol yönetimi (admin)

- **Firebase Firestore**: Veritabanı olarak kullanılmaktadır.
  - Kategoriler koleksiyonu
  - Menü öğeleri koleksiyonu
  - Kullanıcılar koleksiyonu
  - Ayarlar koleksiyonu
  - Gerçek zamanlı veri senkronizasyonu
  - Sorgu filtreleme ve sıralama

- **Firebase Storage**: Medya dosyalarının depolanması için kullanılmaktadır.
  - Kategori görselleri
  - Menü öğesi görselleri
  - Logo ve diğer medya dosyaları
  - Klasör yapısı yönetimi
  - Dosya yükleme ve silme işlemleri

- **Firebase Security Rules**: Güvenlik kuralları ile veri erişim kontrolü sağlanmaktadır.
  - Firestore koleksiyonları için okuma/yazma izinleri
  - Storage için dosya erişim izinleri
  - Kullanıcı rolüne göre erişim kısıtlamaları

- **Firebase Hosting**: Uygulama dağıtımı için kullanılabilir (opsiyonel).
  - Statik dosya sunumu
  - SSL sertifikası
  - CDN dağıtımı

### Mimari
- `/app` - Next.js App Router yapısı
- `/app/admin` - Admin paneli
- `/app/menu` - Menü görüntüleme sayfası
- `/lib` - Yardımcı fonksiyonlar ve Firebase yapılandırması
- `/components` - Yeniden kullanılabilir bileşenler
- `/public` - Statik dosyalar

### Veri Modeli
- **Kategoriler**: id, name, description, image
- **Menü Öğeleri**: id, name, description, price, image, category, ingredients, tags
- **Kullanıcılar**: id, email, role, name, createdAt, updatedAt
- **Ayarlar**: restaurantName, logo, theme, contact

## Güvenlik Kuralları

Firebase güvenlik kuralları `firebase-rules.txt` dosyasında tanımlanmıştır. Bu kurallar:

1. Firestore veritabanı için okuma/yazma izinlerini
2. Storage için dosya yükleme ve silme izinlerini
3. Authentication için kullanıcı erişim kontrollerini

içermektedir.

## Erişim Kontrolü

Admin paneline erişim, Firebase Authentication ile korunmaktadır. Sadece yetkilendirilmiş kullanıcılar admin paneline erişebilir. Kullanıcı yönetimi sayfası ile yeni kullanıcılar eklenebilir, mevcut kullanıcılar düzenlenebilir veya silinebilir.

## 12. Hata Veren Yerler ve Düzeltilmesi Gereken Sorunlar

### Firebase Yapılandırma Sorunları
- [x] `next.config.js` ve `next.config.ts` dosyaları arasında çakışma - Projede iki farklı Next.js yapılandırma dosyası bulunuyor. `next.config.js` dosyası `output: 'export'` kullanırken, `next.config.ts` dosyası `output: 'standalone'` kullanıyor. Bu çakışma build sürecinde hatalara neden olabilir. Tek bir yapılandırma dosyası kullanılmalı.
- [x] Firebase Storage'da büyük resim dosyaları için optimizasyon eksikliği - Büyük resim dosyaları performans sorunlarına neden olabilir. Yükleme öncesi resim boyutlandırma ve sıkıştırma işlemleri eklenmeli.

### Medya Yönetim Sistemi Sorunları
- [x] Medya yükleme sırasında hata işleme eksikliği - `app/admin/media/page.jsx` dosyasında yükleme hataları için yeterli hata işleme mekanizması bulunmuyor. Kullanıcıya daha açıklayıcı hata mesajları gösterilmeli.
- [x] Dosya türü doğrulama eksikliği - Yüklenen dosyaların türü client-side'da doğrulanmıyor, sadece Firebase güvenlik kurallarına güveniliyor. Client-side doğrulama eklenmeli.

### QR Kod Oluşturma Sorunları
- [x] Logo ekleme özelliği
- [x] SVG indirme stil sorunları

### Performans Sorunları
- [x] Next.js export yapılandırması
- [x] Büyük resim dosyaları için optimizasyon
- [x] Build sürecinde izin hataları

### Güvenlik Eksikleri
- [x] Admin paneli için yetersiz erişim kontrolü
- [x] Firebase Authentication için güvenlik kuralları eksikliği
- [x] Firestore için güvenlik kuralları eksikliği
- [x] Storage için güvenlik kuralları eksikliği

## Teknik Detaylar

### Kullanılan Teknolojiler
- Next.js 14
- Firebase (Authentication, Firestore, Storage)
- Tailwind CSS
- React
- JavaScript/TypeScript

### Firebase Kullanım Alanları
- **Firebase Authentication**: Kullanıcı kimlik doğrulama ve yetkilendirme işlemleri için kullanılmaktadır.
  - Kullanıcı girişi (Email/Şifre)
  - Kullanıcı kaydı
  - Kullanıcı çıkışı
  - Şifre sıfırlama
  - Kullanıcı rol yönetimi (admin)

- **Firebase Firestore**: Veritabanı olarak kullanılmaktadır.
  - Kategoriler koleksiyonu
  - Menü öğeleri koleksiyonu
  - Kullanıcılar koleksiyonu
  - Ayarlar koleksiyonu
  - Gerçek zamanlı veri senkronizasyonu
  - Sorgu filtreleme ve sıralama

- **Firebase Storage**: Medya dosyalarının depolanması için kullanılmaktadır.
  - Kategori görselleri
  - Menü öğesi görselleri
  - Logo ve diğer medya dosyaları
  - Klasör yapısı yönetimi
  - Dosya yükleme ve silme işlemleri

- **Firebase Security Rules**: Güvenlik kuralları ile veri erişim kontrolü sağlanmaktadır.
  - Firestore koleksiyonları için okuma/yazma izinleri
  - Storage için dosya erişim izinleri
  - Kullanıcı rolüne göre erişim kısıtlamaları

- **Firebase Hosting**: Uygulama dağıtımı için kullanılabilir (opsiyonel).
  - Statik dosya sunumu
  - SSL sertifikası
  - CDN dağıtımı

### Mimari
- `/app` - Next.js App Router yapısı
- `/app/admin` - Admin paneli
- `/app/menu` - Menü görüntüleme sayfası
- `/lib` - Yardımcı fonksiyonlar ve Firebase yapılandırması
- `/components` - Yeniden kullanılabilir bileşenler
- `/public` - Statik dosyalar

### Veri Modeli
- **Kategoriler**: id, name, description, image
- **Menü Öğeleri**: id, name, description, price, image, category, ingredients, tags
- **Kullanıcılar**: id, email, role, name, createdAt, updatedAt
- **Ayarlar**: restaurantName, logo, theme, contact

## Güvenlik Kuralları

Firebase güvenlik kuralları `firebase-rules.txt` dosyasında tanımlanmıştır. Bu kurallar:

1. Firestore veritabanı için okuma/yazma izinlerini
2. Storage için dosya yükleme ve silme izinlerini
3. Authentication için kullanıcı erişim kontrollerini

içermektedir.

## Erişim Kontrolü

Admin paneline erişim, Firebase Authentication ile korunmaktadır. Sadece yetkilendirilmiş kullanıcılar admin paneline erişebilir. Kullanıcı yönetimi sayfası ile yeni kullanıcılar eklenebilir, mevcut kullanıcılar düzenlenebilir veya silinebilir.

## 13. Öncelikli Düzeltilmesi Gereken Sorunlar

1. [x] Next.js yapılandırma dosyaları çakışması (`next.config.js` ve `next.config.ts`)
2. [x] Büyük resim dosyaları için optimizasyon eksikliği
3. [x] Medya yükleme sırasında hata işleme eksikliği
4. [x] Client-side veri doğrulama eksikliği
5. [x] Gereksiz re-render'lar ve performans sorunları
