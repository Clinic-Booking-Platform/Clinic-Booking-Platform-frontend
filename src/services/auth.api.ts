import type { LoginRequest } from "@/types/auth"
import api from "./axios-clients"

export const login = async (data: LoginRequest) => {
    const res = await api.post("/login", data)
    return res.data.data;
}