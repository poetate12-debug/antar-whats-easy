export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Nasi Goreng Spesial",
    description: "Nasi goreng dengan telur, ayam suwir, dan sayuran segar",
    price: 25000,
    category: "Nasi",
    image: "🍛"
  },
  {
    id: "2",
    name: "Mie Goreng Jawa",
    description: "Mie goreng dengan bumbu khas Jawa dan topping lengkap",
    price: 22000,
    category: "Mie",
    image: "🍜"
  },
  {
    id: "3",
    name: "Sate Ayam Madura",
    description: "10 tusuk sate ayam dengan bumbu kacang khas Madura",
    price: 30000,
    category: "Sate",
    image: "🍢"
  },
  {
    id: "4",
    name: "Bakso Sapi Jumbo",
    description: "Bakso sapi ukuran jumbo dengan kuah kaldu sapi gurih",
    price: 28000,
    category: "Bakso",
    image: "🥣"
  },
  {
    id: "5",
    name: "Ayam Geprek Sambal Bawang",
    description: "Ayam crispy geprek dengan sambal bawang pedas",
    price: 25000,
    category: "Ayam",
    image: "🍗"
  },
  {
    id: "6",
    name: "Es Teh Manis",
    description: "Teh manis segar dengan es batu",
    price: 5000,
    category: "Minuman",
    image: "🧋"
  },
  {
    id: "7",
    name: "Es Jeruk Segar",
    description: "Jus jeruk segar dengan es batu",
    price: 8000,
    category: "Minuman",
    image: "🍊"
  },
  {
    id: "8",
    name: "Nasi Ayam Bakar",
    description: "Nasi putih dengan ayam bakar bumbu kecap dan lalapan",
    price: 32000,
    category: "Nasi",
    image: "🍖"
  }
];

export const categories = ["Semua", "Nasi", "Mie", "Sate", "Bakso", "Ayam", "Minuman"];
