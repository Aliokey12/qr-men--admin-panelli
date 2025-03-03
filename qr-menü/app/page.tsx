import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { MenuCategory } from "@/components/menu-category";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      
      <section id="menu" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Menümüz</h2>
          <MenuCategory />
        </div>
      </section>
      
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
  );
}