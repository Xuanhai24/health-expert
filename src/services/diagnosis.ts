import { http } from "@/lib/http";
import axios, { AxiosError } from "axios";

export async function getSymptomList(): Promise<string[]> {
  try {
    const { data } = await http.get("/api/chuan-doan-benh/danh-sach-trieu-chung");
    return data as string[];
  } catch (error) {
    if(axios.isAxiosError(error)) {
      throw new AxiosError(error.response?.data);
    }
  }
  return [];
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
  try{
    const { data } = await http.post("/api/chuan-doan-benh/chuan-doan", symptoms);
    return data as DiagnoseResult[];
  } catch (error) {
    if(axios.isAxiosError(error)) {
      throw new AxiosError(error.response?.data);
    }
    return [];
  }
}

// Lưu lịch sử chẩn đoán
export async function saveDiagnosis(payload: {
  patientId?: number | string;
  Symptoms?: string;
  Diseases?: string;
  medicinesAdvice?: string;
  doctorAdvice?: string;
  diagnoseDate?: string;
  doctorName?: string;
}) {
  try{
    const res = await http.post("/api/chuan-doan-benh/luu-ket-qua", payload);
    return res.status;
  } catch (error) {
    if(axios.isAxiosError(error)) {
      throw new AxiosError(error.response?.data?.errors);
    }
  }
}
