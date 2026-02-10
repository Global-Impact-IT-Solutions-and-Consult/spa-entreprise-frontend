import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User } from '@/services/auth.service';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: !!Cookies.get('accessToken'), // Initialize based on token existence

            login: (user) => {
                set({ user, isAuthenticated: true });
                // Cookie setting is handled in authService usually, but redundancy here or there is fine. 
                // We'll rely on authService for headers/cookies, store for UI state.
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
            },

            updateUser: (updatedUser) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...updatedUser } : null
                }));
            }
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // Persist user and auth status
        }
    )
);
