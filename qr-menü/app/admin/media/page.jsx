'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  listAll, 
  deleteObject 
} from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { optimizeImages } from '@/lib/utils';
import Image from 'next/image';

// İzin verilen dosya türleri
const ALLOWED_FILE_TYPES = {
  'image/jpeg': true,
  'image/png': true, 
  'image/gif': true,
  'image/webp': true,
  'image/svg+xml': true,
  'application/pdf': true,
  'video/mp4': true,
  'audio/mpeg': true,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true, // docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true, // xlsx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': true, // pptx
  'text/plain': true,
  'application/zip': true
};

// Maksimum dosya boyutu (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function MediaManagerPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolder, setCurrentFolder] = useState('');
  const [folderList, setFolderList] = useState(['', 'menu-items', 'categories']);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const fileInputRef = useRef(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const folderRef = ref(storage, currentFolder);
      const result = await listAll(folderRef);
      
      const filesData = await Promise.all(
        result.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const name = item.name;
          const fullPath = item.fullPath;
          const extension = name.split('.').pop().toLowerCase();
          
          const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
          
          return {
            name,
            url,
            fullPath,
            isImage,
            extension,
            selected: false,
          };
        })
      );
      
      setFiles(filesData);
    } catch (err) {
      console.error('Dosyaları getirme hatası:', err);
      setError('Dosyaları yüklerken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [currentFolder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, currentFolder]);

  const handleFileUpload = useCallback(async (e) => {
    const uploadFiles = e.target.files;
    if (!uploadFiles || uploadFiles.length === 0) return;
    
    // Dosya doğrulama
    const invalidFiles = [];
    const oversizedFiles = [];
    const validFiles = [];
    
    Array.from(uploadFiles).forEach(file => {
      // Dosya türü kontrolü
      if (!ALLOWED_FILE_TYPES[file.type]) {
        invalidFiles.push(file.name);
      }
      // Dosya boyutu kontrolü
      else if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file.name);
      }
      else {
        validFiles.push(file);
      }
    });
    
    // Hata mesajları
    if (invalidFiles.length > 0) {
      setError(`Desteklenmeyen dosya türleri: ${invalidFiles.join(', ')}`);
      return;
    }
    
    if (oversizedFiles.length > 0) {
      setError(`Dosya boyutu çok büyük (maksimum 10MB): ${oversizedFiles.join(', ')}`);
      return;
    }
    
    if (validFiles.length === 0) {
      setError('Yüklenecek geçerli dosya bulunamadı.');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      const totalFiles = validFiles.length;
      let completedFiles = 0;
      let failedFiles = [];
      
      // Resimleri optimize et
      const optimizedFiles = await optimizeImages(validFiles, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.8
      });
      
      for (const file of optimizedFiles) {
        try {
          const fileName = file.name;
          const filePath = currentFolder ? `${currentFolder}/${fileName}` : fileName;
          const fileRef = ref(storage, filePath);
          
          await uploadBytes(fileRef, file);
          completedFiles++;
          setUploadProgress(Math.round((completedFiles / totalFiles) * 100));
        } catch (fileError) {
          console.error(`Dosya yükleme hatası (${file.name}):`, fileError);
          failedFiles.push(file.name);
        }
      }
      
      await fetchFiles();
      setUploadProgress(0);
      
      // Başarılı ve başarısız yükleme bilgisi
      if (failedFiles.length > 0) {
        setError(`${completedFiles} dosya başarıyla yüklendi, ${failedFiles.length} dosya yüklenemedi: ${failedFiles.join(', ')}`);
      }
    } catch (err) {
      console.error('Dosya yükleme hatası:', err);
      setError(`Dosya yüklenirken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setUploading(false);
    }
  }, [currentFolder, fetchFiles]);

  const handleDeleteFile = useCallback(async (filePath) => {
    try {
      setLoading(true);
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      await fetchFiles();
    } catch (err) {
      console.error('Dosya silme hatası:', err);
      setError('Dosya silinirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  }, [fetchFiles]);

  const confirmDeleteFile = useCallback((file) => {
    setConfirmDelete(file);
  }, []);

  const toggleSelectFile = useCallback((filePath) => {
    setSelectedFiles(prev => 
      prev.includes(filePath)
        ? prev.filter(path => path !== filePath)
        : [...prev, filePath]
    );
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      setLoading(true);
      
      for (const filePath of selectedFiles) {
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef);
      }
      
      setSelectedFiles([]);
      await fetchFiles();
    } catch (err) {
      console.error('Dosya silme hatası:', err);
      setError('Dosyalar silinirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [selectedFiles, fetchFiles]);

  const filteredFiles = useMemo(() => {
    return files.filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [files, searchTerm]);

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName || newFolderName.trim() === '') {
      setError('Klasör adı boş olamaz');
      return;
    }

    // Klasör adında geçersiz karakterler olup olmadığını kontrol et
    const invalidChars = /[#$.\[\]\/]/;
    if (invalidChars.test(newFolderName)) {
      setError('Klasör adı #, $, ., [, ], / karakterlerini içeremez');
      return;
    }

    try {
      setLoading(true);
      
      // Klasörü folderList'e ekle
      if (!folderList.includes(newFolderName)) {
        setFolderList(prev => [...prev, newFolderName]);
      }
      
      // Yeni klasöre geç
      setCurrentFolder(newFolderName);
      
      // Formu temizle
      setNewFolderName('');
      setShowNewFolderInput(false);
      
    } catch (err) {
      console.error('Klasör oluşturma hatası:', err);
      setError('Klasör oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [newFolderName, folderList]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Medya Yönetimi</h1>
        <Link
          href="/admin/dashboard"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Dashboard'a Dön
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

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <label htmlFor="folder" className="block text-sm font-medium text-gray-700">
              Klasör:
            </label>
            <select
              id="folder"
              value={currentFolder}
              onChange={(e) => setCurrentFolder(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              disabled={loading || uploading}
            >
              <option value="">Ana Klasör</option>
              {folderList.filter(f => f !== '').map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
            
            {!showNewFolderInput ? (
              <button
                type="button"
                onClick={() => setShowNewFolderInput(true)}
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Yeni Klasör
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Klasör adı"
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleCreateFolder}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Oluştur
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewFolderInput(false);
                    setNewFolderName('');
                  }}
                  className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  İptal
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
              id="file-upload"
              disabled={uploading}
              accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.mp4,.mp3,.docx,.xlsx,.pptx,.txt,.zip"
            />
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                uploading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {uploading ? `Yükleniyor (${uploadProgress}%)` : 'Dosya Yükle'}
            </label>
            
            {selectedFiles.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {selectedFiles.length} Dosyayı Sil
              </button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Dosya ara..."
              className="block w-full pr-10 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredFiles.length === 0 ? (
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">Dosya bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              {currentFolder
                ? 'Bu klasörde dosya yok veya arama kriterlerinize uygun dosya bulunamadı.'
                : 'Lütfen önce bir klasör seçin.'}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={files.length > 0 && files.every(file => file.selected)}
                  onChange={toggleSelectFile}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} dosya seçildi`
                    : 'Tümünü Seç'}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                Toplam {filteredFiles.length} dosya
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.fullPath}
                  className={`relative group border rounded-lg overflow-hidden ${
                    selectedFiles.includes(file.fullPath) ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.fullPath)}
                      onChange={() => toggleSelectFile(file.fullPath)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  {file.isImage ? (
                    <div className="aspect-w-1 aspect-h-1 w-full">
                      <Image
                        src={file.url}
                        alt={file.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        unoptimized={true}
                      />
                    </div>
                  ) : (
                    <div className="aspect-w-1 aspect-h-1 w-full bg-gray-100 flex items-center justify-center">
                      <svg
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  )}
                  
                  <div className="p-2 bg-white">
                    <p className="text-xs text-gray-900 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {file.extension.toUpperCase()}
                    </p>
                  </div>
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                        title="Görüntüle"
                      >
                        <svg
                          className="h-5 w-5 text-gray-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
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
                      </a>
                      <button
                        type="button"
                        onClick={() => confirmDeleteFile(file)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                        title="Sil"
                      >
                        <svg
                          className="h-5 w-5 text-red-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Dosya Silme Onayı
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">{confirmDelete.name}</span> dosyasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFile(confirmDelete.fullPath)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Kullanım Talimatları</h2>
        <div className="prose prose-sm max-w-none">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Önce bir klasör seçin (menu-items veya categories).</li>
            <li>"Dosya Yükle" butonuna tıklayarak bilgisayarınızdan resim seçin.</li>
            <li>Yüklenen dosyalar otomatik olarak listelenecektir.</li>
            <li>Dosyaları görüntülemek için dosya kartının üzerine gelin ve göz simgesine tıklayın.</li>
            <li>Dosyaları silmek için çöp kutusu simgesine tıklayın ve onaylayın.</li>
            <li>Birden fazla dosyayı seçmek için kutucukları işaretleyin ve "X Dosyayı Sil" butonuna tıklayın.</li>
            <li>Dosyaları aramak için üst kısımdaki arama kutusunu kullanın.</li>
          </ol>
          <p className="mt-4 text-sm text-gray-500">
            Not: Yüklenen dosyalar, menü öğeleri ve kategoriler için kullanılabilir. Yüklediğiniz dosyaların URL'lerini kopyalayıp ilgili alanlarda kullanabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
} 