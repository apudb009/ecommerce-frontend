import { create } from 'zustand';
import { Cart } from '@/lib/types';
import api from '@/lib/api';

type CartState = {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/cart');
      set({ cart: data });
    } catch {
      set({ cart: null });
    } finally {
      set({ isLoading: false });
    }
  },
  clearCart: () => set({ cart: null }),
}));
