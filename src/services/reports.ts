import { http } from "@/lib/http";
export interface Overview {
  totalPatients: number;
  totalDoctors: number;
  diagnosesThisMonth: number;
  topDiseases: { name: string; count: number }[];
}
export async function getOverview(): Promise<Overview> {
  const { data } = await http.get("/api/Reports/overview");
  return data as Overview;
}
