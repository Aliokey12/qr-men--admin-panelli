import Image from 'next/image';

export function AboutSection() {
    return (
      <section id="about" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Hakkımızda</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Hatay Lezzetleri</h3>
              <p className="mb-4">
                2023 yılında kurduğumuz küçük dükkanımızda, Hatay'ın eşsiz lezzetlerini modern bir sunumla misafirlerimize sunuyoruz.
              </p>
              <p className="mb-4">
                Taze malzemeler ve geleneksel tariflerle hazırladığımız Antep ciğeri, kavurma ve özel tost çeşitlerimiz ile damak tadınıza hitap ediyoruz.
              </p>
              <p>
                Amacımız, Hatay mutfağının zengin lezzetlerini, kaliteli hizmet anlayışımızla birleştirerek sizlere unutulmaz bir deneyim yaşatmak.
              </p>
            </div>
            
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl bg-gradient-to-r from-amber-500 to-red-600 flex items-center justify-center">
              <div className="text-white text-center p-6">
                <h4 className="text-xl font-semibold mb-2">Hatay Lezzetleri</h4>
                <p className="text-white/80">Geleneksel lezzetler, modern sunum</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }