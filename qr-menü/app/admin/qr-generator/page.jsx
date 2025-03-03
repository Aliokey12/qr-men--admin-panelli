'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { saveAs } from 'file-saver';
import Link from 'next/link';

export default function QRGeneratorPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [qrSize, setQrSize] = useState(300);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [fgColor, setFgColor] = useState('#000000');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoSize, setLogoSize] = useState(50);
  const [includeText, setIncludeText] = useState(true);
  const [qrText, setQrText] = useState('Menümüzü görmek için QR kodu taratın');
  const [downloadFormat, setDownloadFormat] = useState('png');
  const [previewUrl, setPreviewUrl] = useState('');
  const qrRef = useRef(null);

  // Sayfa yüklendiğinde tarayıcı URL'sini al
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const baseUrl = `${url.protocol}//${url.host}/menu`;
      setBaseUrl(baseUrl);
      setPreviewUrl(baseUrl);
    }
  }, []);

  // QR kodunu indir
  const downloadQRCode = () => {
    if (!qrRef.current) return;

    if (downloadFormat === 'png') {
      const canvas = qrRef.current.querySelector('canvas');
      if (!canvas) return;

      // Yeni bir canvas oluştur (arka plan ve metin için)
      const newCanvas = document.createElement('canvas');
      const padding = 40; // Kenar boşluğu
      const textHeight = includeText ? 40 : 0; // Metin için yükseklik
      
      newCanvas.width = canvas.width + (padding * 2);
      newCanvas.height = canvas.height + (padding * 2) + textHeight;
      
      const ctx = newCanvas.getContext('2d');
      
      // Arka planı doldur
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
      
      // QR kodunu çiz
      ctx.drawImage(canvas, padding, padding);
      
      // Metin ekle
      if (includeText && qrText) {
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(qrText, newCanvas.width / 2, canvas.height + padding + 25);
      }
      
      // PNG olarak indir
      newCanvas.toBlob((blob) => {
        saveAs(blob, 'qr-menu-code.png');
      });
    } else if (downloadFormat === 'svg') {
      // SVG olarak indir
      const svgElement = qrRef.current.querySelector('svg');
      if (!svgElement) return;
      
      // SVG'yi klonla ve stil ekle
      const svgClone = svgElement.cloneNode(true);
      
      // Arka plan ekle
      svgClone.setAttribute('style', `background-color: ${bgColor};`);
      
      // Padding ekle
      const originalWidth = parseInt(svgClone.getAttribute('width'), 10);
      const originalHeight = parseInt(svgClone.getAttribute('height'), 10);
      const padding = 40;
      const textHeight = includeText ? 40 : 0;
      
      svgClone.setAttribute('width', originalWidth + (padding * 2));
      svgClone.setAttribute('height', originalHeight + (padding * 2) + textHeight);
      
      // İçeriği ortala
      const qrGroup = svgClone.querySelector('path').parentNode;
      qrGroup.setAttribute('transform', `translate(${padding}, ${padding})`);
      
      // Metin ekle
      if (includeText && qrText) {
        const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textElement.setAttribute('x', (originalWidth + (padding * 2)) / 2);
        textElement.setAttribute('y', originalHeight + padding + 25);
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('font-family', 'Arial');
        textElement.setAttribute('font-size', '16');
        textElement.setAttribute('fill', '#000000');
        textElement.textContent = qrText;
        svgClone.appendChild(textElement);
      }
      
      // SVG'yi string'e dönüştür
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      saveAs(svgBlob, 'qr-menu-code.svg');
    }
  };

  // URL'yi önizle
  const handlePreview = () => {
    setPreviewUrl(baseUrl);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">QR Kod Oluşturucu</h1>
        <Link
          href="/admin/dashboard"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Dashboard'a Dön
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sol Taraf - Ayarlar */}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-medium text-gray-900 border-b pb-2">QR Kod Ayarları</h2>
          
          {/* URL Ayarı */}
          <div>
            <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700">
              Menü URL
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="baseUrl"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={handlePreview}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Önizle
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Bu URL, QR kodu taratıldığında açılacak menü sayfasıdır.
            </p>
          </div>

          {/* QR Boyutu */}
          <div>
            <label htmlFor="qrSize" className="block text-sm font-medium text-gray-700">
              QR Kod Boyutu: {qrSize}px
            </label>
            <input
              type="range"
              id="qrSize"
              min="100"
              max="500"
              step="10"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="mt-1 block w-full"
            />
          </div>

          {/* Renkler */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bgColor" className="block text-sm font-medium text-gray-700">
                Arka Plan Rengi
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="color"
                  id="bgColor"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-8 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="ml-2 flex-1 min-w-0 block px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="fgColor" className="block text-sm font-medium text-gray-700">
                QR Kod Rengi
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="color"
                  id="fgColor"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-8 w-8 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="ml-2 flex-1 min-w-0 block px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Logo Ayarları */}
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
              Logo URL (opsiyonel)
            </label>
            <input
              type="text"
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {logoUrl && (
              <div className="mt-2">
                <label htmlFor="logoSize" className="block text-sm font-medium text-gray-700">
                  Logo Boyutu: {logoSize}px
                </label>
                <input
                  type="range"
                  id="logoSize"
                  min="20"
                  max="150"
                  step="5"
                  value={logoSize}
                  onChange={(e) => setLogoSize(Number(e.target.value))}
                  className="mt-1 block w-full"
                />
              </div>
            )}
          </div>

          {/* Metin Ayarları */}
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeText"
                checked={includeText}
                onChange={(e) => setIncludeText(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="includeText" className="ml-2 block text-sm text-gray-700">
                QR kodunun altına metin ekle
              </label>
            </div>
            {includeText && (
              <input
                type="text"
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                className="mt-2 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            )}
          </div>

          {/* İndirme Formatı */}
          <div>
            <label className="block text-sm font-medium text-gray-700">İndirme Formatı</label>
            <div className="mt-2 flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="png"
                  name="downloadFormat"
                  type="radio"
                  value="png"
                  checked={downloadFormat === 'png'}
                  onChange={(e) => setDownloadFormat(e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="png" className="ml-2 block text-sm text-gray-700">
                  PNG
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="svg"
                  name="downloadFormat"
                  type="radio"
                  value="svg"
                  checked={downloadFormat === 'svg'}
                  onChange={(e) => setDownloadFormat(e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="svg" className="ml-2 block text-sm text-gray-700">
                  SVG
                </label>
              </div>
            </div>
          </div>

          {/* İndirme Butonu */}
          <div>
            <button
              type="button"
              onClick={downloadQRCode}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              QR Kodu İndir
            </button>
          </div>
        </div>

        {/* Sağ Taraf - Önizleme */}
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center">
          <h2 className="text-lg font-medium text-gray-900 mb-6 self-start border-b pb-2 w-full">QR Kod Önizleme</h2>
          
          <div 
            ref={qrRef} 
            className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm border border-gray-200"
            style={{ backgroundColor: bgColor }}
          >
            {downloadFormat === 'svg' ? (
              <QRCodeSVG
                value={previewUrl}
                size={qrSize}
                bgColor={bgColor}
                fgColor={fgColor}
                level="H"
                includeMargin={true}
                imageSettings={
                  logoUrl
                    ? {
                        src: logoUrl,
                        excavate: true,
                        width: logoSize,
                        height: logoSize,
                        x: undefined,
                        y: undefined
                      }
                    : undefined
                }
              />
            ) : (
              <QRCodeCanvas
                value={previewUrl}
                size={qrSize}
                bgColor={bgColor}
                fgColor={fgColor}
                level="H"
                includeMargin={true}
                imageSettings={
                  logoUrl
                    ? {
                        src: logoUrl,
                        excavate: true,
                        width: logoSize,
                        height: logoSize,
                        x: undefined,
                        y: undefined
                      }
                    : undefined
                }
              />
            )}
            {includeText && qrText && (
              <p className="mt-4 text-center text-sm font-medium">{qrText}</p>
            )}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              QR kodu taratıldığında şu URL açılacak:
            </p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-sm text-indigo-600 hover:text-indigo-500"
            >
              {previewUrl}
            </a>
          </div>
        </div>
      </div>

      {/* Kullanım Talimatları */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Kullanım Talimatları</h2>
        <div className="prose prose-sm max-w-none">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Menü URL'sini kontrol edin veya özelleştirin.</li>
            <li>QR kodunun boyutunu, renklerini ve diğer özelliklerini ayarlayın.</li>
            <li>İsterseniz QR kodunun ortasına bir logo ekleyin.</li>
            <li>QR kodunun altına açıklayıcı bir metin ekleyebilirsiniz.</li>
            <li>Önizleme butonuna tıklayarak QR kodunu güncelleyin.</li>
            <li>İndirme formatını seçin (PNG veya SVG).</li>
            <li>"QR Kodu İndir" butonuna tıklayarak QR kodunu bilgisayarınıza kaydedin.</li>
            <li>İndirilen QR kodunu menülerinizde, masalarınızda veya promosyon materyallerinizde kullanabilirsiniz.</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 