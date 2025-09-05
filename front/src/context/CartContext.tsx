"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartContextType, Cart, CartItem } from "@/types";

// Create the cart context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Initial cart state
const initialCartState: Cart = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
};

// Cart provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(initialCartState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("irac_cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Convert addedAt strings back to Date objects
        const itemsWithDates = parsedCart.items?.map((item: CartItem) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        })) || [];

        setCart({
          ...parsedCart,
          items: itemsWithDates,
        });
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        localStorage.removeItem("irac_cart");
      }
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (cart !== initialCartState) {
      localStorage.setItem("irac_cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Calculate cart totals
  const calculateCartTotals = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => {
      const price = item.discounted_price ?? item.price;
      return sum + (price * item.quantity);
    }, 0);

    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return { total, itemCount };
  };

  // Add item to cart
  const addToCart = (newItem: Omit<CartItem, "quantity" | "addedAt">) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(item => item.id === newItem.id);

      let updatedItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Item already exists, increase quantity
        updatedItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // New item, add to cart
        const cartItem: CartItem = {
          ...newItem,
          quantity: 1,
          addedAt: new Date(),
        };
        updatedItems = [...prevCart.items, cartItem];
      }

      const { total, itemCount } = calculateCartTotals(updatedItems);

      return {
        ...prevCart,
        items: updatedItems,
        total,
        itemCount,
      };
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(item => item.id !== itemId);
      const { total, itemCount } = calculateCartTotals(updatedItems);

      return {
        ...prevCart,
        items: updatedItems,
        total,
        itemCount,
      };
    });
  };

  // Update item quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart => {
      const updatedItems = prevCart.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );

      const { total, itemCount } = calculateCartTotals(updatedItems);

      return {
        ...prevCart,
        items: updatedItems,
        total,
        itemCount,
      };
    });
  };

  // Clear entire cart
  const clearCart = () => {
    setCart(prevCart => ({
      ...initialCartState,
      isOpen: prevCart.isOpen, // Keep cart open/closed state
    }));
    localStorage.removeItem("irac_cart");
  };

  // Toggle cart visibility
  const toggleCart = () => {
    setCart(prevCart => ({
      ...prevCart,
      isOpen: !prevCart.isOpen,
    }));
  };

  // Close cart
  const closeCart = () => {
    setCart(prevCart => ({
      ...prevCart,
      isOpen: false,
    }));
  };

  // Open cart
  const openCart = () => {
    setCart(prevCart => ({
      ...prevCart,
      isOpen: true,
    }));
  };

  // Context value
  const contextValue: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    closeCart,
    openCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Export context for advanced usage
export { CartContext };
