import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/user";
import useCartStore from "./cartStore";
import api from "../lib/axios";

const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 hour

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loginTimestamp: number | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    isSessionExpired: () => boolean;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            loginTimestamp: null,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                    // Only start a NEW 1-hour clock on an actual fresh login
                    // (no user -> a user). Refreshing/revalidating an
                    // existing session with updated data must not reset it.
                    loginTimestamp: user
                        ? get().user
                            ? get().loginTimestamp
                            : Date.now()
                        : null,
                }),

            logout: () => {
                // Clear local state immediately so the UI reflects "logged
                // out" instantly, without waiting on a network round trip.
                set({ user: null, isAuthenticated: false, loginTimestamp: null });
                // Never let one account's cart survive into the next session.
                useCartStore.getState().clearCart();
                // Invalidate the session server-side too (best-effort, fire
                // and forget). Without this, the httpOnly auth cookie stays
                // valid after a client-side logout, so the next visit to a
                // protected route (e.g. clicking "Order Now") silently logs
                // the same old account back in via /auth/me.
                api.post("/auth/logout").catch(() => {});
            },

            isSessionExpired: () => {
                const { loginTimestamp } = get();
                if (!loginTimestamp) return false;
                return Date.now() - loginTimestamp > SESSION_DURATION_MS;
            },
        }),
        {
            name: "bym-auth",
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                loginTimestamp: state.loginTimestamp,
            }),
        },
    ),
);

export default useAuthStore;