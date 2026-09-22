import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore.ts";
import api from "../lib/axios.ts";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, setUser, logout, isSessionExpired } =
        useAuthStore();
    const [checking, setChecking] = useState(!isAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            // The 1-hour window has actually elapsed — this is the only
            // thing allowed to log the user out here.
            if (isSessionExpired()) {
                logout();
                return;
            }

            // We already have a valid, unexpired session restored from
            // localStorage (this is what happens on every page refresh).
            // Refresh the user's data in the background, but a failure here
            // (flaky network, a brief server hiccup right after reload)
            // must NOT log the user out — only the 1-hour timer should do
            // that. Previously this called logout() on any failure, which
            // is why simply refreshing the page could kick the user out.
            api.get("/auth/me")
                .then((res) => setUser(res.data.user))
                .catch(() => {
                    /* keep the existing session; ignore transient errors */
                });
            return;
        }

        // No persisted session at all (first visit, or after a real
        // logout) — must verify with the server before allowing access.
        const restore = async () => {
            try {
                const res = await api.get("/auth/me");
                setUser(res.data.user); // restores full user including location
            } catch {
                logout();
            } finally {
                setChecking(false);
            }
        };
        restore();
    }, []);

    // still checking — show nothing (or a spinner)
    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" />;

    if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
        return <Navigate to="/login" />;
    }

    return children;
}

export default ProtectedRoute;
