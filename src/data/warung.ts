import { Warung } from "@/types";

export const warungData: Warung[] = [
  // Cikedung
  {
    id: "1",
    wilayahId: "1",
    nama: "Warung Makan Bu Siti",
    alamat: "Jl. Raya Cikedung No. 123",
    jamBuka: "07:00 - 21:00",
    noWa: "6281234567890",
    deskripsi: "Warung makan keluarga dengan masakan rumahan yang lezat",
    isActive: true,
  },
  {
    id: "2",
    wilayahId: "1",
    nama: "Kedai Pak Joko",
    alamat: "Jl. Desa Cikedung Lor No. 45",
    jamBuka: "06:00 - 22:00",
    noWa: "6281234567891",
    deskripsi: "Spesialis nasi goreng dan mie goreng",
    isActive: true,
  },
  {
    id: "3",
    wilayahId: "1",
    nama: "Rumah Makan Sederhana",
    alamat: "Jl. Cikedung Kidul No. 78",
    jamBuka: "08:00 - 20:00",
    noWa: "6281234567892",
    deskripsi: "Masakan Sunda autentik dengan harga terjangkau",
    isActive: true,
  },
  
  // Terisi
  {
    id: "4",
    wilayahId: "2",
    nama: "Warung Teh Icih",
    alamat: "Jl. Raya Terisi No. 56",
    jamBuka: "06:00 - 21:00",
    noWa: "6281234567893",
    deskripsi: "Warung legendaris dengan soto ayam khas",
    isActive: true,
  },
  {
    id: "5",
    wilayahId: "2",
    nama: "Depot Makan Barokah",
    alamat: "Jl. Desa Terisi Kidul No. 12",
    jamBuka: "07:00 - 20:00",
    noWa: "6281234567894",
    deskripsi: "Aneka lauk pauk dan sayuran segar",
    isActive: true,
  },
  
  // Lelea
  {
    id: "6",
    wilayahId: "3",
    nama: "Warung Mas Budi",
    alamat: "Jl. Raya Lelea No. 34",
    jamBuka: "06:30 - 21:30",
    noWa: "6281234567895",
    deskripsi: "Ayam goreng crispy dan berbagai menu lezat",
    isActive: true,
  },
  {
    id: "7",
    wilayahId: "3",
    nama: "Kedai Sunda Asli",
    alamat: "Jl. Lelea Wetan No. 89",
    jamBuka: "07:00 - 20:00",
    noWa: "6281234567896",
    deskripsi: "Masakan Sunda tradisional dengan bumbu rempah",
    isActive: true,
  },
  
  // Losarang
  {
    id: "8",
    wilayahId: "4",
    nama: "Warung Seafood Pantai",
    alamat: "Jl. Pantai Losarang No. 1",
    jamBuka: "10:00 - 22:00",
    noWa: "6281234567897",
    deskripsi: "Seafood segar langsung dari nelayan lokal",
    isActive: true,
  },
  {
    id: "9",
    wilayahId: "4",
    nama: "Pondok Makan Losarang",
    alamat: "Jl. Raya Losarang No. 67",
    jamBuka: "06:00 - 20:00",
    noWa: "6281234567898",
    deskripsi: "Menu lengkap dengan harga bersahabat",
    isActive: true,
  },
  
  // Kroya
  {
    id: "10",
    wilayahId: "5",
    nama: "Warung Mbak Yuni",
    alamat: "Jl. Raya Kroya No. 23",
    jamBuka: "06:00 - 21:00",
    noWa: "6281234567899",
    deskripsi: "Pecel lele dan ayam penyet juara!",
    isActive: true,
  },
  
  // Gabuswetan
  {
    id: "11",
    wilayahId: "6",
    nama: "Rumah Makan Padang Minang",
    alamat: "Jl. Raya Gabuswetan No. 45",
    jamBuka: "07:00 - 21:00",
    noWa: "6281234567900",
    deskripsi: "Masakan Padang autentik dengan rendang empuk",
    isActive: true,
  },
  
  // Patrol
  {
    id: "12",
    wilayahId: "7",
    nama: "Warung Bakso Pak Kumis",
    alamat: "Jl. Patrol Lor No. 12",
    jamBuka: "08:00 - 20:00",
    noWa: "6281234567901",
    deskripsi: "Bakso jumbo dengan kuah kaldu sapi asli",
    isActive: true,
  },
  
  // Bongas
  {
    id: "13",
    wilayahId: "8",
    nama: "Kedai Mie Ayam Pak No",
    alamat: "Jl. Raya Bongas No. 78",
    jamBuka: "07:00 - 19:00",
    noWa: "6281234567902",
    deskripsi: "Mie ayam dan pangsit terenak di Bongas",
    isActive: true,
  },
];

export const getWarungByWilayahId = (wilayahId: string): Warung[] => {
  return warungData.filter((w) => w.wilayahId === wilayahId && w.isActive);
};

export const getWarungById = (id: string): Warung | undefined => {
  return warungData.find((w) => w.id === id);
};
