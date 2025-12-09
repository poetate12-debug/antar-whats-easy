import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import MenuSection from "@/components/MenuSection";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { MenuItem } from "@/data/menu";
import { toast } from "@/hooks/use-toast";

const WHATSAPP_NUMBER = "6281234567890"; // Ganti dengan nomor WhatsApp Anda

const Index = () => {
  const [cartMessage, setCartMessage] = useState("");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleOrderItem = (item: MenuItem, quantity: number) => {
    const totalPrice = item.price * quantity;
    const message = `Halo, saya ingin memesan:\n\n📦 *${item.name}*\n📝 ${item.description}\n🔢 Jumlah: ${quantity}\n💰 Total: ${formatPrice(totalPrice)}\n\nMohon konfirmasi ketersediaan dan waktu pengiriman. Terima kasih!`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    
    toast({
      title: "Pesanan Dikirim ke WhatsApp! 🎉",
      description: `${quantity}x ${item.name} - ${formatPrice(totalPrice)}`,
    });
    
    setCartMessage(message);
  };

  return (
    <main className="min-h-screen">
      <HeroSection />
      <MenuSection onOrderItem={handleOrderItem} />
      <Footer />
      <FloatingWhatsApp cartMessage={cartMessage} />
    </main>
  );
};

export default Index;
