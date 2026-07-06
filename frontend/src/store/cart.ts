"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DesignConfig } from "@/lib/types";

export interface CartItem {
  key: string; // unique key: productId+size or design id
  productId?: string;
  designId?: string;
  name: string;
  nameBn?: string | null;
  image?: string | null;
  price: number;
  quantity: number;
  size?: string;
  customization?: DesignConfig;
  isCustom: boolean;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.key === item.key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === item.key ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),
      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      setQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "nz-cart" }
  )
);

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);
