import { http } from "@/lib/http";

export interface Symptom {
  symptomId: number;
  name: string;
  code?: string;
}
export interface Disease {
  diseaseId: number;
  name: string;
  icd?: string;
}
export interface Rule {
  ruleId: number;
  symptomId: number;
  diseaseId: number;
  weight: number;
  description?: string;
}

export async function getSymptoms() {
  const { data } = await http.get("/Symptoms");
  return data as Symptom[];
}
export async function createSymptom(p: Omit<Symptom, "symptomId">) {
  const { data } = await http.post("/Symptoms", p);
  return data as Symptom;
}
export async function updateSymptom(id: number, p: Omit<Symptom, "symptomId">) {
  const { data } = await http.put(`/Symptoms/${id}`, p);
  return data as Symptom;
}
export async function deleteSymptom(id: number) {
  await http.delete(`/Symptoms/${id}`);
}

export async function getDiseases() {
  const { data } = await http.get("/Diseases");
  return data as Disease[];
}
export async function createDisease(p: Omit<Disease, "diseaseId">) {
  const { data } = await http.post("/Diseases", p);
  return data as Disease;
}
export async function updateDisease(id: number, p: Omit<Disease, "diseaseId">) {
  const { data } = await http.put(`/Diseases/${id}`, p);
  return data as Disease;
}
export async function deleteDisease(id: number) {
  await http.delete(`/Diseases/${id}`);
}

export async function getRules() {
  const { data } = await http.get("/Rules");
  return data as Rule[];
}
export async function createRule(p: Omit<Rule, "ruleId">) {
  const { data } = await http.post("/Rules", p);
  return data as Rule;
}
export async function updateRule(id: number, p: Omit<Rule, "ruleId">) {
  const { data } = await http.put(`/Rules/${id}`, p);
  return data as Rule;
}
export async function deleteRule(id: number) {
  await http.delete(`/Rules/${id}`);
}
