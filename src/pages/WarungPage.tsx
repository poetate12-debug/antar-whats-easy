import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MenuItemCard from "@/components/MenuItemCard";
import CartSidebar from "@/components/CartSidebar";
import NavHeader from "@/components/NavHeader";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { useCart } from "@/hooks/useCart";
import { Clock, MapPin, Truck, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Warung {
  id: string;
  nama: string;
  alamat: string;
  deskripsi: string | null;
  jam_buka: string | null;
  rating: number | null;
  total_reviews: number | null;
  foto_url: string | null;
  wilayah: {
    id: string;
    nama: string;
    slug: string;
    ongkir: number;
  };
}

interface Menu {
  id: string;
  nama: string;
  harga: number;
  deskripsi: string | null;
  foto_url: string | null;
  kategori: string | null;
  is_available: boolean;
}

const WarungPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [warung, setWarung] = useState<Warung | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    cart,
    addToCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    totalItems,
  } = useCart();

  useEffect(() => {
    const fetchWarung = async () => {
      if (!id) return;
      
      const { data: warungData, error: warungError } = await supabase
        .from('warungs')
        .select(`
          id,
          nama,
          alamat,
          deskripsi,
          jam_buka,
          rating,
          total_reviews,
          foto_url,
          wilayah:wilayahs(id, nama, slug, ongkir)
        `)
        .eq('id', id)
        .maybeSingle();

      if (warungError || !warungData) {
        setIsLoading(false);
        return;
      }

      setWarung(warungData as unknown as Warung);

      // Fetch menus
      const { data: menuData } = await supabase
        .from('menus')
        .select('*')
        .eq('warung_id', id)
        .eq('is_available', true)
        .order('kategori');

      if (menuData) {
        setMenus(menuData);
      }

      setIsLoading(false);
    };

    fetchWarung();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (menu: Menu) => {
    if (!warung) return;

    // Check if cart has items from different warung
    if (cart && cart.warungId !== warung.id) {
      const confirmSwitch = window.confirm(
        `Keranjang Anda berisi pesanan dari ${cart.warungNama}. Menambahkan menu dari warung lain akan mengosongkan keranjang. Lanjutkan?`
      );
      if (!confirmSwitch) return;
    }

    // Convert to cart-compatible format
    const menuForCart = {
      id: menu.id,
      warungId: warung.id,
      nama: menu.nama,
      harga: menu.harga,
      isAvailable: true,
    };
    const warungForCart = {
      id: warung.id,
      wilayahId: warung.wilayah.id,
      nama: warung.nama,
      alamat: warung.alamat,
      noWa: '',
      isActive: true,
    };
    const wilayahForCart = {
      id: warung.wilayah.id,
      nama: warung.wilayah.nama,
      slug: warung.wilayah.slug,
      ongkir: warung.wilayah.ongkir,
      isActive: true,
    };

    addToCart(menuForCart, warungForCart, wilayahForCart);
    toast({
      title: "Ditambahkan ke keranjang!",
      description: `${menu.nama} berhasil ditambahkan`,
    });
  };

  // Group menus by kategori
  const menusByKategori = menus.reduce((acc, menu) => {
    const kategori = menu.kategori || 'Lainnya';
    if (!acc[kategori]) acc[kategori] = [];
    acc[kategori].push(menu);
    return acc;
  }, {} as Record<string, Menu[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavHeader showBack backTo="/" cartCount={totalItems} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Skeleton className="h-64 rounded-2xl mb-8" />
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!warung) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader
        showBack
        backTo={`/wilayah/${warung.wilayah.slug}`}
        backLabel={warung.wilayah.nama}
        cartCount={totalItems}
      />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: "Beranda", href: "/" },
              { label: warung.wilayah.nama, href: `/wilayah/${warung.wilayah.slug}` },
              { label: warung.nama },
            ]}
          />

          {/* Warung Header */}
          <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-8 animate-fade-up">
            <div className="md:flex">
              <div className="md:w-1/3">
                {warung.foto_url ? (
                  <img
                    src={warung.foto_url}
                    alt={warung.nama}
                    className="w-full h-48 md:h-full object-cover min-h-[200px]"
                  />
                ) : (
                  <div className="w-full h-48 md:h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center min-h-[200px]">
                    <span className="text-6xl">🏪</span>
                  </div>
                )}
              </div>
              <div className="p-6 md:w-2/3">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {warung.nama}
                  </h1>
                  {warung.rating && (
                    <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">{warung.rating}</span>
                    </div>
                  )}
                </div>

                {/* Wilayah Badge */}
                <Badge variant="secondary" className="mb-3">
                  <MapPin className="w-3 h-3 mr-1" />
                  {warung.wilayah.nama}
                </Badge>

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
                  {warung.jam_buka && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {warung.jam_buka}
                    </p>
                  )}
                  <p className="text-accent font-medium flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Ongkir: {formatPrice(warung.wilayah.ongkir)}
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
                  ([kategori, kategoriMenus], catIndex) => (
                    <div key={kategori} className="mb-8">
                      <h3 className="text-lg font-semibold text-muted-foreground mb-4 pb-2 border-b border-border capitalize">
                        {kategori}
                      </h3>

                      <div className="space-y-4">
                        {kategoriMenus.map((menu, index) => (
                          <div
                            key={menu.id}
                            className="animate-fade-up"
                            style={{
                              animationDelay: `${(catIndex * 5 + index) * 30}ms`,
                            }}
                          >
                            <MenuItemCard
                              menu={{
                                id: menu.id,
                                warungId: warung.id,
                                nama: menu.nama,
                                harga: menu.harga,
                                deskripsi: menu.deskripsi || undefined,
                                foto: menu.foto_url || undefined,
                                isAvailable: menu.is_available,
                              }}
                              quantity={getItemQuantity(menu.id)}
                              onAdd={() => handleAddToCart(menu)}
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
            onClick={() => navigate("/checkout")}
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
