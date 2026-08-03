import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore.ts";
import api from "../lib/axios";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, setUser, logout } = useAuthStore();
    const [checking, setChecking] = useState(!isAuthenticated);

    useEffect(() => {
        if (isAuthenticated) return; // already have user, skip

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
