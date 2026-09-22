import axios from "axios";
import useAuthStore from "../store/authStore";

const getAccessToken = () => {
    const cookies = document.cookie.split(";");
    const accessTokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("accessToken="),
    );
    return accessTokenCookie ? accessTokenCookie.split("=")[1] : null;
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh") &&
            !originalRequest.url?.includes("/auth/login") &&
            !originalRequest.url?.includes("/auth/logout")
        ) {
            originalRequest._retry = true;
            try {
                await api.post("/auth/refresh");
                return api(originalRequest);
            } catch {
                // The refresh token itself is invalid — this is a real,
                // server-confirmed logout, not just our client-side 1-hour
                // timeout. Go through the shared action so local state and
                // the cart are cleared the same way as any other logout.
                useAuthStore.getState().logout();
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    },
);

export default api;
