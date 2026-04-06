// src/store/favorites.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FavoritesState = {
  serviceIds: string[];
  businessIds: string[];
  setServiceIds: (ids: string[]) => void;
  setBusinessIds: (ids: string[]) => void;
  addService: (id: string) => void;
  removeService: (id: string) => void;
  addBusiness: (id: string) => void;
  removeBusiness: (id: string) => void;
  clear: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      serviceIds: [],
      businessIds: [],
      setServiceIds: (ids) => set({ serviceIds: ids }),
      setBusinessIds: (ids) => set({ businessIds: ids }),
      addService: (id) => set((state) => ({
        serviceIds: state.serviceIds.includes(id) ? state.serviceIds : [...state.serviceIds, id]
      })),
      removeService: (id) => set((state) => ({
        serviceIds: state.serviceIds.filter((i) => i !== id)
      })),
      addBusiness: (id) => set((state) => ({
        businessIds: state.businessIds.includes(id) ? state.businessIds : [...state.businessIds, id]
      })),
      removeBusiness: (id) => set((state) => ({
        businessIds: state.businessIds.filter((i) => i !== id)
      })),
      clear: () => set({ serviceIds: [], businessIds: [] }),
    }),
    { name: 'favorites-storage' }
  )
);
