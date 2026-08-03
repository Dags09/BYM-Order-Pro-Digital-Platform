import { create } from "zustand";
import type { User } from "../types/user";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,

    setUser: (user) =>
        set({
            user,
            isAuthenticated: !!user,
        }),

    logout: () =>
        set({
            user: null,
            isAuthenticated: false,
        }),
}));

export default useAuthStore;
