import { defineStore } from "pinia";
import { http } from "@/lib/http";

type Role = "ADMIN" | "DOCTOR";
type User = { id: string; email: string; name?: string; role: Role };

export const useAuth = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    token:
      (typeof localStorage !== "undefined" && localStorage.getItem("token")) ||
      "",
  }),
  actions: {
    async login(email: string, password: string) {
      const { data } = await http.post("/api/Auth/Login", { email, password });
      this.token = data.token;
      localStorage.setItem("token", data.token);
      this.user = data.user;
    },
    logout() {
      this.user = null;
      this.token = "";
      localStorage.removeItem("token");
    },
    async fetchMe() {
      if (!this.token) return;
      try {
        const { data } = await http.get("/api/Auth/Me");
        this.user = { id: data.sub, email: data.email, role: data.role };
      } catch {
        this.logout();
      }
    },
  },
});
