import { create } from 'zustand';

type WishlistState = {
  items: Record<number, boolean>;
  setItem: (productId: number, inWishlist: boolean) => void;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>((set) => ({
  items: {},
  setItem: (productId, inWishlist) =>
    set((state) => ({
      items: { ...state.items, [productId]: inWishlist },
    })),
  clear: () => set({ items: {} }),
}));
