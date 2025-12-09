import { useState } from "react";
import { menuItems, categories, MenuItem } from "@/data/menu";
import MenuCard from "./MenuCard";
import { cn } from "@/lib/utils";

interface MenuSectionProps {
  onOrderItem: (item: MenuItem, quantity: number) => void;
}

const MenuSection = ({ onOrderItem }: MenuSectionProps) => {
  const [activeCategory, setActiveCategory] = useState("Semua");

  const filteredItems = activeCategory === "Semua"
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <section id="menu" className="py-20 bg-background">
      <div className="container px-4">
        <div className="mb-12 text-center">
          <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
            Menu Kami
          </span>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Pilihan Menu Lezat
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Berbagai pilihan makanan dan minuman yang siap menggoyang lidahmu. Pesan sekarang dan nikmati kelezatannya!
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300",
                activeCategory === category
                  ? "bg-primary text-primary-foreground shadow-button"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <MenuCard item={item} onAddToCart={onOrderItem} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
