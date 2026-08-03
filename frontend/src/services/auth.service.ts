import api from "../lib/axios";

interface LoginFormData {
    username: string;
    password: string;
}

export const login = async (formData: LoginFormData) => {
    const response = await api.post("/auth/login", formData);
    return response.data;
};
