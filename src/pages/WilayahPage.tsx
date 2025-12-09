import { useParams, useNavigate } from "react-router-dom";
import { getWilayahBySlug } from "@/data/wilayah";
import { getWarungByWilayahId } from "@/data/warung";
import { getMenuByWarungId } from "@/data/menuWarung";
import WarungCard from "@/components/WarungCard";
import NavHeader from "@/components/NavHeader";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/whatsapp";

const WilayahPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const wilayah = slug ? getWilayahBySlug(slug) : undefined;

  if (!wilayah) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavHeader showBack backTo="/" cartCount={totalItems} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Wilayah tidak ditemukan
            </h1>
            <p className="text-muted-foreground">
              Silakan kembali ke halaman utama
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const warungs = getWarungByWilayahId(wilayah.id);

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader showBack backTo="/" backLabel="Kembali" cartCount={totalItems} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: "Beranda", href: "/" },
              { label: wilayah.nama },
            ]}
          />

          {/* Header */}
          <div className="mb-8 animate-fade-up">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Warung di{" "}
              <span className="text-primary">{wilayah.nama}</span>
            </h1>
            <p className="text-muted-foreground">
              Ongkir untuk wilayah ini:{" "}
              <span className="font-semibold text-accent">
                {formatPrice(wilayah.ongkir)}
              </span>
            </p>
          </div>

          {/* Warung Grid */}
          {warungs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Belum ada warung di wilayah ini
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {warungs.map((warung, index) => {
                const menuCount = getMenuByWarungId(warung.id).length;
                return (
                  <div
                    key={warung.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <WarungCard
                      warung={warung}
                      menuCount={menuCount}
                      onClick={() =>
                        navigate(`/wilayah/${slug}/warung/${warung.id}`)
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default WilayahPage;
