export interface Wilayah {
  id: string;
  nama: string;
  slug: string;
  ongkir: number;
  foto?: string;
  isActive: boolean;
  warungCount?: number;
}

export interface Warung {
  id: string;
  wilayahId: string;
  nama: string;
  alamat: string;
  jamBuka?: string;
  noWa: string;
  foto?: string;
  deskripsi?: string;
  isActive: boolean;
  menuCount?: number;
  rating?: number;
  totalTerjual?: number;
  menuPreview?: string[];
}

export interface Menu {
  id: string;
  warungId: string;
  nama: string;
  harga: number;
  deskripsi?: string;
  foto?: string;
  kategori?: string;
  isAvailable: boolean;
}

export interface CartItem {
  menuId: string;
  nama: string;
  harga: number;
  qty: number;
  subtotal: number;
}

export interface Cart {
  wilayahId: string;
  wilayahNama: string;
  wilayahSlug: string;
  warungId: string;
  warungNama: string;
  warungNoWa: string;
  ongkir: number;
  items: CartItem[];
  subtotal: number;
  total: number;
}

export interface CustomerInfo {
  nama: string;
  alamat: string;
  catatan?: string;
}
