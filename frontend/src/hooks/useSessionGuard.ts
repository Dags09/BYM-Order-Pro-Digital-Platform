import { useEffect } from "react";
import useAuthStore from "../store/authStore";
import api from "../lib/axios";

const CHECK_INTERVAL_MS = 60 * 1000; // re-check every minute

// Call this once, near the top of App — not inside ProtectedRoute — so it
// runs regardless of which page the person lands on.
export function useSessionGuard() {
    const {
        isAuthenticated,
        loginTimestamp,
        setUser,
        logout,
        isSessionExpired,
    } = useAuthStore();

    // On app load: if the persisted session is already past 1 hour, kill it
    // immediately without even asking the server. Otherwise, revalidate it
    // against /auth/me so a session invalidated server-side (or belonging to
    // a stale/incorrect cookie) doesn't silently stick around client-side.
    useEffect(() => {
        if (!isAuthenticated) return;

        if (isSessionExpired()) {
            logout();
            return;
        }

        api.get("/auth/me")
            .then((res) => setUser(res.data.user))
            .catch(() => logout());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // While the app stays open, auto-logout the moment the hour elapses.
    useEffect(() => {
        if (!isAuthenticated || !loginTimestamp) return;

        const interval = setInterval(() => {
            if (isSessionExpired()) {
                logout();
            }
        }, CHECK_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [isAuthenticated, loginTimestamp]);
}
