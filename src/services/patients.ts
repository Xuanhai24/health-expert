// src/services/patients.ts
import { http } from "@/lib/http";

// ================== Bệnh nhân ==================
export interface Patient {
  patientId: number;
  fullName: string;
  dob: string; // ISO yyyy-MM-dd
  gender: "Nam" | "Nữ";
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Lấy danh sách bệnh nhân (có tìm kiếm, phân trang, sắp xếp)
export async function fetchPatients(params: {
  q?: string;
  sort?: string;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}): Promise<Paged<Patient>> {
  const { data } = await http.get("/api/Patients", { params });
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, pageSize: data.length };
  }
  return data;
}

// Tạo bệnh nhân mới
export async function createPatient(p: Omit<Patient, "patientId">) {
  const payload = {
    ...p,
    dob: p.dob ? p.dob.slice(0, 10) : "", // chuẩn yyyy-MM-dd
  };
  const { data } = await http.post("/api/Patients", payload);
  return data as Patient;
}

// Cập nhật bệnh nhân
export async function updatePatient(id: number, p: Omit<Patient, "patientId">) {
  const payload = {
    ...p,
    patientId: id, // Backend có thể cần Id
    dob: p.dob ? p.dob.slice(0, 10) : "", // chuẩn yyyy-MM-dd
  };
  const { data } = await http.put(`/api/Patients/${id}`, payload);
  return data as Patient;
}

// Xóa bệnh nhân
export async function deletePatient(id: number) {
  await http.delete(`/api/Patients/${id}`);
}

// Lấy chi tiết bệnh nhân
export async function getPatient(id: number) {
  const { data } = await http.get(`/api/Patients/${id}`);
  return data as Patient;
}

// ================== Chẩn đoán ==================
export interface Diagnosis {
  diagnosisId: number;
  diagnosedAt: string; // ISO datetime
  doctorName?: string;
  diseaseName?: string;
  result?: string;
  confidence?: number;
}

// Lấy lịch sử chẩn đoán của bệnh nhân
export async function getPatientDiagnoses(id: number) {
  const { data } = await http.get(`/api/chuan-doan-benh/benh-nhan/${id}`);

  const mapOne = (x: any): Diagnosis => ({
    diagnosisId: x.diagnosisId ?? x.id ?? 0,
    diagnosedAt: x.diagnoseDate ?? x.diagnosedAt ?? "",
    doctorName: x.doctorName ?? x.doctor?.fullName ?? "",
    diseaseName: x.diseaseName ?? x.diseases ?? "",
    result: x.result ?? x.summary ?? "",
    confidence: x.confidence ?? x.score ?? undefined,
  });

  return (Array.isArray(data) ? data.map(mapOne) : []).sort(
    (a, b) =>
      new Date(b.diagnosedAt).getTime() - new Date(a.diagnosedAt).getTime()
  );
}
