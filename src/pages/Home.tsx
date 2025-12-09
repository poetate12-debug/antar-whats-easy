import { useNavigate } from "react-router-dom";
import { wilayahData } from "@/data/wilayah";
import { getWarungByWilayahId } from "@/data/warung";
import WilayahCard from "@/components/WilayahCard";
import NavHeader from "@/components/NavHeader";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { useCart } from "@/hooks/useCart";

const Home = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader cartCount={totalItems} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Pesan Makanan, <span className="text-primary">Antar Cepat!</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Pilih wilayah Anda untuk melihat warung-warung makan terdekat
            </p>
          </div>

          {/* Wilayah Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wilayahData
              .filter((w) => w.isActive)
              .map((wilayah, index) => {
                const warungCount = getWarungByWilayahId(wilayah.id).length;
                return (
                  <div
                    key={wilayah.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <WilayahCard
                      wilayah={wilayah}
                      warungCount={warungCount}
                      onClick={() => navigate(`/wilayah/${wilayah.slug}`)}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Home;
