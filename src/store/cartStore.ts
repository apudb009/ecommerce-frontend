import { create } from 'zustand';
import { Cart } from '@/lib/types';
import api from '@/lib/api';

type CartState = {
  cart: Cart | null;
  isLoading: boolean;
  hasLoaded: boolean;
  fetchCart: () => Promise<void>;
  clearCart: () => void;
  updateCart: (cart: Cart) => void;
};

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  hasLoaded: false,
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/cart');
      set({ cart: data });
    } catch {
      set({ cart: null });
    } finally {
      set({ isLoading: false, hasLoaded: true });
    }
  },
  clearCart: () => set({ cart: null, hasLoaded: false }),
  updateCart: (cart) => set({ cart }),
}));
