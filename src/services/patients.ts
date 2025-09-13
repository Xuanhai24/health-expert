import { http } from "@/lib/http";

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

export async function fetchPatients(params: {
  q?: string;
  sort?: string;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}): Promise<Paged<Patient>> {
  const { data } = await http.get("/api/Patients", { params });
  // fallback nếu backend trả mảng thay vì {items,total}
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, pageSize: data.length };
  }
  return data;
}

export async function createPatient(p: Omit<Patient, "patientId">) {
  const { data } = await http.post("/api/Patients", p);
  return data as Patient;
}

export async function updatePatient(id: number, p: Omit<Patient, "patientId">) {
  const { data } = await http.put(`/api/Patients/${id}`, p);
  return data as Patient;
}

export async function deletePatient(id: number) {
  await http.delete(`/api/Patients/${id}`);
}

export async function getPatient(id: number) {
  const { data } = await http.get(`/api/Patients/${id}`);
  return data as Patient;
}

export interface Diagnosis {
  diagnosisId: number;
  diagnosedAt: string; // ISO
  doctorName?: string; // map từ backend Doctor.FullName
  diseaseName?: string; // hoặc result/disease.title
  result?: string;
  confidence?: number;
}

export async function getPatientDiagnoses(id: number) {
  const { data } = await http.get(`/api/Patients/${id}/api/diagnoses`);
  // nắn dữ liệu phòng khi backend field hơi khác
  const mapOne = (x: any): Diagnosis => ({
    diagnosisId: x.diagnosisId ?? x.id ?? 0,
    diagnosedAt: x.diagnosedAt ?? x.createdAt ?? x.time ?? "",
    doctorName: x.doctorName ?? x.doctor?.fullName ?? x.doctor ?? "",
    diseaseName: x.diseaseName ?? x.result?.disease ?? x.result ?? "",
    result: x.result ?? x.summary ?? "",
    confidence: x.confidence ?? x.score ?? undefined,
  });
  return (Array.isArray(data) ? data.map(mapOne) : []).sort(
    (a, b) =>
      new Date(b.diagnosedAt).getTime() - new Date(a.diagnosedAt).getTime()
  );
}
