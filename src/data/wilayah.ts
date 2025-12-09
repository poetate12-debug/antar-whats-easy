import { Wilayah } from "@/types";

export const wilayahData: Wilayah[] = [
  {
    id: "1",
    nama: "Cikedung",
    slug: "cikedung",
    ongkir: 5000,
    isActive: true,
  },
  {
    id: "2",
    nama: "Terisi",
    slug: "terisi",
    ongkir: 7000,
    isActive: true,
  },
  {
    id: "3",
    nama: "Lelea",
    slug: "lelea",
    ongkir: 6000,
    isActive: true,
  },
  {
    id: "4",
    nama: "Losarang",
    slug: "losarang",
    ongkir: 8000,
    isActive: true,
  },
  {
    id: "5",
    nama: "Kroya",
    slug: "kroya",
    ongkir: 10000,
    isActive: true,
  },
  {
    id: "6",
    nama: "Gabuswetan",
    slug: "gabuswetan",
    ongkir: 7500,
    isActive: true,
  },
  {
    id: "7",
    nama: "Patrol",
    slug: "patrol",
    ongkir: 9000,
    isActive: true,
  },
  {
    id: "8",
    nama: "Bongas",
    slug: "bongas",
    ongkir: 6500,
    isActive: true,
  },
];

export const getWilayahBySlug = (slug: string): Wilayah | undefined => {
  return wilayahData.find((w) => w.slug === slug);
};
