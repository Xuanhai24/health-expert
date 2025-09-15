import { http } from "@/lib/http";

export interface Doctor {
  doctorId: number;
  fullName: string;
  email: string;
  phone?: string;
  specialty?: string;
}

export interface Paged<T> {
  items: T[]; total: number; page: number; pageSize: number;
}

export async function fetchDoctors(params: {
  q?: string; sort?: string; dir?: "asc"|"desc"; page?: number; pageSize?: number;
}): Promise<Paged<Doctor>> {
  const { data } = await http.get("/api/Doctors", { params });
  if (Array.isArray(data)) return { items: data, total: data.length, page: 1, pageSize: data.length };
  return data;
}

export async function createDoctor(payload: Omit<Doctor,"doctorId">) {
  const { data } = await http.post("/api/Doctors", payload); return data as Doctor;
}
export async function updateDoctor(id: number, payload: Omit<Doctor,"doctorId">) {
  const { data } = await http.put(`/api/Doctors/${id}`, payload); return data as Doctor;
}
export async function deleteDoctor(id: number) { await http.delete(`/api/Doctors/${id}`); }