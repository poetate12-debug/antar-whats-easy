import { useState, useEffect, useCallback } from "react";
import { Cart, CartItem, Menu, Warung, Wilayah } from "@/types";

const CART_STORAGE_KEY = "antarrasa_cart";

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [cart]);

  const addToCart = useCallback(
    (menu: Menu, warung: Warung, wilayah: Wilayah, qty: number = 1) => {
      setCart((prevCart) => {
        // If cart is empty or different warung, create new cart
        if (!prevCart || prevCart.warungId !== warung.id) {
          const newItem: CartItem = {
            menuId: menu.id,
            nama: menu.nama,
            harga: menu.harga,
            qty,
            subtotal: menu.harga * qty,
          };
          const subtotal = newItem.subtotal;
          return {
            wilayahId: wilayah.id,
            wilayahNama: wilayah.nama,
            wilayahSlug: wilayah.slug,
            warungId: warung.id,
            warungNama: warung.nama,
            warungNoWa: warung.noWa,
            ongkir: wilayah.ongkir,
            items: [newItem],
            subtotal,
            total: subtotal + wilayah.ongkir,
          };
        }

        // Check if item already exists
        const existingIndex = prevCart.items.findIndex(
          (item) => item.menuId === menu.id
        );

        let newItems: CartItem[];
        if (existingIndex !== -1) {
          // Update existing item
          newItems = prevCart.items.map((item, index) => {
            if (index === existingIndex) {
              const newQty = item.qty + qty;
              return {
                ...item,
                qty: newQty,
                subtotal: item.harga * newQty,
              };
            }
            return item;
          });
        } else {
          // Add new item
          newItems = [
            ...prevCart.items,
            {
              menuId: menu.id,
              nama: menu.nama,
              harga: menu.harga,
              qty,
              subtotal: menu.harga * qty,
            },
          ];
        }

        const subtotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
        return {
          ...prevCart,
          items: newItems,
          subtotal,
          total: subtotal + prevCart.ongkir,
        };
      });
    },
    []
  );

  const updateQuantity = useCallback((menuId: string, qty: number) => {
    setCart((prevCart) => {
      if (!prevCart) return null;

      if (qty <= 0) {
        // Remove item
        const newItems = prevCart.items.filter(
          (item) => item.menuId !== menuId
        );
        if (newItems.length === 0) {
          return null; // Clear cart if no items
        }
        const subtotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
        return {
          ...prevCart,
          items: newItems,
          subtotal,
          total: subtotal + prevCart.ongkir,
        };
      }

      // Update quantity
      const newItems = prevCart.items.map((item) => {
        if (item.menuId === menuId) {
          return {
            ...item,
            qty,
            subtotal: item.harga * qty,
          };
        }
        return item;
      });

      const subtotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      return {
        ...prevCart,
        items: newItems,
        subtotal,
        total: subtotal + prevCart.ongkir,
      };
    });
  }, []);

  const removeFromCart = useCallback((menuId: string) => {
    updateQuantity(menuId, 0);
  }, [updateQuantity]);

  const clearCart = useCallback(() => {
    setCart(null);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const getItemQuantity = useCallback(
    (menuId: string): number => {
      if (!cart) return 0;
      const item = cart.items.find((item) => item.menuId === menuId);
      return item?.qty || 0;
    },
    [cart]
  );

  const totalItems = cart?.items.reduce((sum, item) => sum + item.qty, 0) || 0;

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    totalItems,
  };
};
