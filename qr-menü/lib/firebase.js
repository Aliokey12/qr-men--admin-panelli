// Firebase yapılandırması
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase yapılandırma bilgileri
// NOT: Bu bilgileri kendi Firebase projenizden almanız gerekiyor
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Firebase uygulamasını başlat
let app;
let db;
let auth;
let storage;
let authInitialized = false;
let dbInitialized = false;

// Firebase'i yalnızca istemci tarafında başlat
if (typeof window !== 'undefined') {
  try {
    // Firebase uygulamasını başlat
    app = initializeApp(firebaseConfig);
    
    // Firestore ayarlarını yapılandır
    const firestoreSettings = {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
      cacheSizeBytes: 1048576 * 100 // 100 MB cache size
    };
    
    // Firestore'u özel ayarlarla başlat
    db = initializeFirestore(app, firestoreSettings);
    dbInitialized = true;
    
    // Çevrimdışı veri desteğini etkinleştir
    try {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Çevrimdışı depolama birden fazla sekme açık olduğu için etkinleştirilemedi');
        } else if (err.code === 'unimplemented') {
          console.warn('Tarayıcınız çevrimdışı depolamayı desteklemiyor');
        }
      });
    } catch (persistenceError) {
      console.warn('Çevrimdışı depolama etkinleştirilemedi:', persistenceError);
    }
    
    // Auth ve Storage servislerini başlat
    auth = getAuth(app);
    authInitialized = true;
    
    // Auth durumunu izle
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Kullanıcı oturum açtı:', user.uid);
      } else {
        console.log('Kullanıcı oturum açmadı');
      }
    });
    
    storage = getStorage(app);
    
    console.log('Firebase başarıyla başlatıldı');
  } catch (error) {
    console.error('Firebase başlatma hatası:', error);
    
    // Hata durumunda kullanıcıya bilgi ver
    if (typeof document !== 'undefined') {
      // Sadece tarayıcı ortamında çalıştır
      setTimeout(() => {
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.bottom = '20px';
        errorDiv.style.right = '20px';
        errorDiv.style.backgroundColor = '#f8d7da';
        errorDiv.style.color = '#721c24';
        errorDiv.style.padding = '10px 15px';
        errorDiv.style.borderRadius = '4px';
        errorDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        errorDiv.style.zIndex = '9999';
        errorDiv.textContent = 'Firebase bağlantısı kurulamadı. Lütfen sayfayı yenileyin.';
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
          errorDiv.remove();
        }, 5000);
      }, 1000);
    }
  }
}

// Firebase servislerinin durumunu kontrol et
const isFirebaseInitialized = () => {
  return app && db && auth && storage;
};

const isAuthInitialized = () => {
  return authInitialized;
};

const isDbInitialized = () => {
  return dbInitialized;
};

export { app, db, auth, storage, isFirebaseInitialized, isAuthInitialized, isDbInitialized };
export default app; 