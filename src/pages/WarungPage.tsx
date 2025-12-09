import { useParams } from "react-router-dom";
import { getWilayahBySlug } from "@/data/wilayah";
import { getWarungById } from "@/data/warung";
import { getMenusByKategori, getMenuById } from "@/data/menuWarung";
import MenuItemCard from "@/components/MenuItemCard";
import CartSidebar from "@/components/CartSidebar";
import NavHeader from "@/components/NavHeader";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/whatsapp";
import { Clock, MapPin, Truck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const WarungPage = () => {
  const { slug, warungId } = useParams<{ slug: string; warungId: string }>();
  const {
    cart,
    addToCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    totalItems,
  } = useCart();

  const wilayah = slug ? getWilayahBySlug(slug) : undefined;
  const warung = warungId ? getWarungById(warungId) : undefined;

  if (!wilayah || !warung) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavHeader showBack backTo="/" cartCount={totalItems} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Warung tidak ditemukan
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

  const menusByKategori = getMenusByKategori(warung.id);

  const handleAddToCart = (menuId: string) => {
    const menu = getMenuById(menuId);
    if (!menu) return;

    // Check if cart has items from different warung
    if (cart && cart.warungId !== warung.id) {
      const confirmSwitch = window.confirm(
        `Keranjang Anda berisi pesanan dari ${cart.warungNama}. Menambahkan menu dari warung lain akan mengosongkan keranjang. Lanjutkan?`
      );
      if (!confirmSwitch) return;
    }

    addToCart(menu, warung, wilayah);
    toast({
      title: "Ditambahkan ke keranjang!",
      description: `${menu.nama} berhasil ditambahkan`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader
        showBack
        backTo={`/wilayah/${slug}`}
        backLabel={wilayah.nama}
        cartCount={totalItems}
      />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: "Beranda", href: "/" },
              { label: wilayah.nama, href: `/wilayah/${slug}` },
              { label: warung.nama },
            ]}
          />

          {/* Warung Header */}
          <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-8 animate-fade-up">
            <div className="md:flex">
              <div className="md:w-1/3">
                <div className="w-full h-48 md:h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center min-h-[200px]">
                  <span className="text-6xl">🏪</span>
                </div>
              </div>
              <div className="p-6 md:w-2/3">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  {warung.nama}
                </h1>
                {warung.deskripsi && (
                  <p className="text-muted-foreground mb-4">
                    {warung.deskripsi}
                  </p>
                )}
                <div className="space-y-2">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {warung.alamat}
                  </p>
                  {warung.jamBuka && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {warung.jamBuka}
                    </p>
                  )}
                  <p className="text-accent font-medium flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Ongkir: {formatPrice(wilayah.ongkir)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:flex lg:gap-8">
            {/* Menu List */}
            <div className="lg:w-2/3">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Daftar Menu
              </h2>

              {Object.keys(menusByKategori).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Belum ada menu tersedia
                  </p>
                </div>
              ) : (
                Object.entries(menusByKategori).map(
                  ([kategori, menus], catIndex) => (
                    <div key={kategori} className="mb-8">
                      <h3 className="text-lg font-semibold text-muted-foreground mb-4 pb-2 border-b border-border">
                        {kategori}
                      </h3>

                      <div className="space-y-4">
                        {menus.map((menu, index) => (
                          <div
                            key={menu.id}
                            className="animate-fade-up"
                            style={{
                              animationDelay: `${(catIndex * 5 + index) * 30}ms`,
                            }}
                          >
                            <MenuItemCard
                              menu={menu}
                              quantity={getItemQuantity(menu.id)}
                              onAdd={() => handleAddToCart(menu.id)}
                              onIncrease={() =>
                                updateQuantity(
                                  menu.id,
                                  getItemQuantity(menu.id) + 1
                                )
                              }
                              onDecrease={() =>
                                updateQuantity(
                                  menu.id,
                                  getItemQuantity(menu.id) - 1
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )
              )}
            </div>

            {/* Cart Sidebar - Desktop */}
            <div className="hidden lg:block lg:w-1/3">
              <CartSidebar
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onClearCart={clearCart}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Cart Floating */}
      {cart && cart.items.length > 0 && (
        <div className="lg:hidden fixed bottom-20 left-4 right-4 z-40">
          <button
            onClick={() => (window.location.href = "/checkout")}
            className="w-full bg-accent text-accent-foreground font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-between"
          >
            <span>
              {totalItems} item • {formatPrice(cart.total)}
            </span>
            <span>Checkout →</span>
          </button>
        </div>
      )}

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default WarungPage;
