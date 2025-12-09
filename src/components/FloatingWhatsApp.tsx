import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "6281234567890"; // Ganti dengan nomor WhatsApp Anda

interface FloatingWhatsAppProps {
  cartMessage?: string;
}

const FloatingWhatsApp = ({ cartMessage }: FloatingWhatsAppProps) => {
  const handleClick = () => {
    const defaultMessage = "Halo, saya ingin memesan makanan!";
    const message = cartMessage || defaultMessage;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-whatsapp transition-all duration-300 hover:scale-110 hover:shadow-lg animate-bounce-slow"
      aria-label="Hubungi WhatsApp"
    >
      <MessageCircle className="h-8 w-8" />
    </button>
  );
};

export default FloatingWhatsApp;
