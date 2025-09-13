import { http } from "@/lib/http";

export async function getSymptomList(): Promise<string[]> {
  const { data } = await http.get("/api/chan-doan/danh-sach-trieu-chung");
  return data as string[];
}

export interface DiagnoseResult {
  disease?: string;
  confidence?: number; // 0..1
  explanation?: string;
}

export async function runDiagnosis(
  symptoms: string[]
): Promise<DiagnoseResult> {
  const { data } = await http.post("/api/chan-doan/thuc-hien", symptoms);
  return data as DiagnoseResult;
}

// Lưu lịch sử chẩn đoán
export async function saveDiagnosis(payload: {
  patientId: number;
  symptoms: string[];
  disease?: string;
  confidence?: number;
  result?: string; // text summary
}) {
  const { data } = await http.post("/api/Diagnoses", payload);
  return data;
}
