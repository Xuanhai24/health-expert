import { http } from "@/lib/http";
export interface UserLite {
  userId: number;
  email: string;
  fullName: string;
  role: "ADMIN" | "DOCTOR";
}
export async function getUsers() {
  const { data } = await http.get("/Users");
  return data as UserLite[];
}
export async function setRole(userId: number, role: "ADMIN" | "DOCTOR") {
  await http.put(`/api/Users/${userId}/api/role`, { role });
}
