import { create } from 'zustand';
import type { CartResponse } from '../types';

interface CartState {
  cart: CartResponse | null;
  setCart: (cart: CartResponse | null) => void;
  itemsCount: number;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  itemsCount: 0,
  setCart: (cart) => set({ cart, itemsCount: cart?.itemsCount ?? 0 }),
}));
