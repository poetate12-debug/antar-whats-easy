import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { openWhatsApp, formatPrice } from "@/lib/whatsapp";
import { CustomerInfo } from "@/types";
import NavHeader from "@/components/NavHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2 } from "lucide-react";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, clearCart, totalItems } = useCart();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    nama: "",
    alamat: "",
    catatan: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavHeader showBack backTo="/" cartCount={0} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Keranjang Kosong
            </h1>
            <p className="text-muted-foreground mb-4">
              Silakan pilih menu terlebih dahulu
            </p>
            <Button onClick={() => navigate("/")}>Kembali ke Beranda</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerInfo.nama.trim()) {
      toast({
        title: "Error",
        description: "Nama harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!customerInfo.alamat.trim()) {
      toast({
        title: "Error",
        description: "Alamat harus diisi",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Open WhatsApp
    openWhatsApp(cart, customerInfo);

    // Clear cart after successful order
    toast({
      title: "Pesanan Dikirim!",
      description: "Anda akan diarahkan ke WhatsApp",
    });

    // Clear cart after a delay
    setTimeout(() => {
      clearCart();
      navigate("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader showBack backTo="/" backLabel="Kembali" cartCount={totalItems} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground mb-8 animate-fade-up">
            Checkout
          </h1>

          {/* Order Summary */}
          <div className="bg-card rounded-2xl shadow-card p-6 mb-6 animate-fade-up">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Ringkasan Pesanan
            </h2>

            <div className="text-sm text-muted-foreground mb-4 space-y-1">
              <p>
                <strong>Wilayah:</strong> {cart.wilayahNama}
              </p>
              <p>
                <strong>Warung:</strong> {cart.warungNama}
              </p>
            </div>

            <div className="divide-y divide-border">
              {cart.items.map((item) => (
                <div
                  key={item.menuId}
                  className="py-3 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-grow">
                    <p className="font-medium">{item.nama}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.harga)} x {item.qty}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() =>
                          updateQuantity(item.menuId, item.qty - 1)
                        }
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{item.qty}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() =>
                          updateQuantity(item.menuId, item.qty + 1)
                        }
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="font-medium w-24 text-right">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Ongkir ({cart.wilayahNama})</span>
                <span>{formatPrice(cart.ongkir)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-foreground pt-2 border-t border-border">
                <span>Total Bayar</span>
                <span className="text-primary">{formatPrice(cart.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl shadow-card p-6 animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            <h2 className="text-xl font-bold text-foreground mb-4">
              Data Pemesan
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="nama">Nama Lengkap *</Label>
                <Input
                  id="nama"
                  type="text"
                  value={customerInfo.nama}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, nama: e.target.value })
                  }
                  placeholder="Masukkan nama Anda"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="alamat">Alamat Lengkap *</Label>
                <Textarea
                  id="alamat"
                  value={customerInfo.alamat}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, alamat: e.target.value })
                  }
                  placeholder="Masukkan alamat lengkap untuk pengiriman"
                  required
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="catatan">Catatan (Opsional)</Label>
                <Textarea
                  id="catatan"
                  value={customerInfo.catatan}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      catatan: e.target.value,
                    })
                  }
                  placeholder="Contoh: Tidak pakai sambal, tolong hubungi dulu sebelum antar"
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-accent hover:bg-accent/90"
              size="lg"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {isSubmitting ? "Memproses..." : "Order via WhatsApp"}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
