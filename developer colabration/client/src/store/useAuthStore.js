import { create } from "zustand";
import axios from "axios";

export const useAuthStore = create((set) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  login: async (email, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("user", JSON.stringify(res.data));
      set({ user: res.data });
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  },
  register: async (username, email, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", { username, email, password });
      localStorage.setItem("user", JSON.stringify(res.data));
      set({ user: res.data });
    } catch (error) {
      throw error.response?.data?.message || "Registration failed";
    }
  },
  logout: () => {
    localStorage.removeItem("user");
    set({ user: null });
  },
}));

