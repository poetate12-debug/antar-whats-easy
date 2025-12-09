import { Cart, CustomerInfo } from "@/types";

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export const generateWhatsAppMessage = (
  cart: Cart,
  customer: CustomerInfo
): string => {
  // Generate menu list
  const daftarMenu = cart.items
    .map(
      (item) =>
        `• ${item.nama} x${item.qty} = ${formatPrice(item.subtotal)}`
    )
    .join("\n");

  // Build message
  let message = `*PESANAN BARU*\n\n`;
  message += `📍 *Wilayah:* ${cart.wilayahNama}\n`;
  message += `🏪 *Warung:* ${cart.warungNama}\n\n`;
  message += `👤 *Nama:* ${customer.nama}\n`;
  message += `🏠 *Alamat:* ${customer.alamat}\n`;

  if (customer.catatan) {
    message += `📝 *Catatan:* ${customer.catatan}\n`;
  }

  message += `\n*Pesanan:*\n${daftarMenu}\n\n`;
  message += `💰 *Subtotal:* ${formatPrice(cart.subtotal)}\n`;
  message += `🚚 *Ongkir:* ${formatPrice(cart.ongkir)}\n`;
  message += `━━━━━━━━━━━━━━━━\n`;
  message += `💵 *TOTAL BAYAR:* ${formatPrice(cart.total)}`;

  return message;
};

export const generateWhatsAppUrl = (
  phoneNumber: string,
  message: string
): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

export const openWhatsApp = (cart: Cart, customer: CustomerInfo): void => {
  const message = generateWhatsAppMessage(cart, customer);
  const url = generateWhatsAppUrl(cart.warungNoWa, message);
  window.open(url, "_blank");
};
