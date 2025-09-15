<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, RouterLink } from "vue-router";
import {
  getPatient,
  getPatientDiagnoses,
  type Patient,
  type Diagnosis,
} from "@/services/patients";
const route = useRoute();
const id = Number(route.params.id);
const patient = ref<Patient | null>(null);
const diags = ref<Diagnosis[]>([]);
const loading = ref(false);
const err = ref("");
onMounted(async () => {
  loading.value = true;
  err.value = "";
  try {
    patient.value = await getPatient(id);
    diags.value = await getPatientDiagnoses(id);
  } catch (e: any) {
    err.value = e?.response?.data ?? "Không tải được dữ liệu";
  } finally {
    loading.value = false;
  }
});
const age = computed(() => {
  if (!patient.value?.dob) return "";
  const d = new Date(patient.value.dob);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
});
</script>
<template>
  <div>
    <div class="d-flex align-items-center mb-3">
      <RouterLink to="/benh-nhan" class="btn btn-light me-2"
        >← Danh sách</RouterLink
      >
      <h3 class="m-0">Hồ sơ bệnh nhân</h3>
    </div>
    <div v-if="err" class="alert alert-danger">{{ err }}</div>
    <div v-else>
      <!-- Thông tin bệnh nhân -->
      <div class="card mb-3">
        <div class="card-body">
          <h4 class="mb-1">{{ patient?.fullName }}</h4>
          <div class="text-muted">
            <span class="me-3">👤 {{ patient?.gender }}</span>
            <span class="me-3"
              >🎂 {{ patient?.dob?.slice(0, 10) }} ({{ age }} tuổi)</span
            >
            <span>#ID: {{ patient?.patientId }}</span>
          </div>
        </div>
      </div>
      <!-- Lịch sử chẩn đoán -->
      <div class="card">
        <div
          class="card-header d-flex align-items-center justify-content-between"
        >
          <b>🩺 Lịch sử chẩn đoán</b>
        </div>
        <div class="card-body p-0">
          <table class="table table-striped align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 60px">#</th>
                <th>Thời gian</th>
                <th>Bác sĩ</th>
                <th>Bệnh/Chẩn đoán</th>
                <th class="text-end">Độ tin cậy</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="text-center py-4">⏳ Đang tải...</td>
              </tr>
              <tr v-for="(d, i) in diags" :key="d.diagnosisId">
                <td>{{ i + 1 }}</td>
                <td>{{ new Date(d.diagnosedAt).toLocaleString() }}</td>
                <td>{{ d.doctorName || "—" }}</td>
                <td>{{ d.diseaseName || d.result || "—" }}</td>
                <td class="text-end">
                  <span v-if="d.confidence != null"
                    >{{ (d.confidence * 100).toFixed(0) }}%</span
                  >
                  <span v-else>—</span>
                </td>
              </tr>
              <tr v-if="!loading && diags.length === 0">
                <td colspan="5" class="text-center py-4">Chưa có chẩn đoán</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
