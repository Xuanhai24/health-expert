import { http } from "@/lib/http";

export async function getSymptomList(): Promise<string[]> {
  const { data } = await http.get("/api/chuan-doan-benh/danh-sach-trieu-chung");
  return data as string[];
}

// Interface mô tả kết quả trả về từ backend
export interface DiagnoseResult {
  name: string; // tên bệnh
  score: number; // độ tin cậy (0..1)
  matchedSymptoms: string[]; // triệu chứng khớp
  unmatchedSymptoms: string[]; // triệu chứng không khớp
}

// Hàm gọi API chuẩn đoán, trả về mảng
export async function runDiagnosis(
  symptoms: string[]
): Promise<DiagnoseResult[]> {
  const { data } = await http.post("/api/chuan-doan-benh/chuan-doan", symptoms);
  return data as DiagnoseResult[];
}

// Lưu lịch sử chẩn đoán
export async function saveDiagnosis(payload: {
  patientId: number;
  Symptoms: string;
  Diseases: string;
  medicinesAdvice: string;
  doctorAdvice: string;
  diagnoseDate: string;
  doctorName: string;
}) {
  return await http.post("/api/chuan-doan-benh/luu-ket-qua", payload);
}
