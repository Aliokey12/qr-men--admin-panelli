export function AboutSection() {
    return (
      <section id="about" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Hakkımızda</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Hatay Lezzetleri</h3>
              <p className="mb-4">
                2023 yılında kurduğumuz küçük dükkanımızda, Hatay'in eşsiz lezzetlerini modern bir sunumla misafirlerimize sunuyoruz.
              </p>
              <p className="mb-4">
                Taze malzemeler ve geleneksel tariflerle hazırladığımız Antep ciğeri, kavurma ve özel tost çeşitlerimiz ile damak tadınıza hitap ediyoruz.
              </p>
              <p>
                Amacımız, Hatay mutfağının zengin lezzetlerini, kaliteli hizmet anlayışımızla birleştirerek sizlere unutulmaz bir deneyim yaşatmak.
              </p>
            </div>
            
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Restaurant interior" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }