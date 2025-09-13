import { computed } from "vue";
import { useAuth } from "@/stores/auth";

export function useRBAC() {
  const auth = useAuth();
  const role = computed(() => auth.user?.role ?? "");
  const isAdmin = computed(() => role.value === "ADMIN");
  const isDoctor = computed(() => role.value === "DOCTOR");
  const allow = (roles: string[]) => roles.includes(role.value);
  return { role, isAdmin, isDoctor, allow };
}
