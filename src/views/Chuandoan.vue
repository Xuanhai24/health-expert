<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  getSymptomList,
  runDiagnosis,
  saveDiagnosis,
} from "@/services/diagnosis";
import { fetchPatients, type Patient } from "@/services/patients";

const patients = ref<Patient[]>([]);
const patientId = ref<number | null>(null);

const allSymptoms = ref<string[]>([]);
const filter = ref("");
const selected = ref<string[]>([]);

const loading = ref(false);
const err = ref("");

const result = ref<{
  disease?: string;
  confidence?: number;
  explanation?: string;
} | null>(null);

const shownSymptoms = computed(() =>
  allSymptoms.value.filter((s) =>
    s.toLowerCase().includes(filter.value.toLowerCase())
  )
);

async function loadPatients() {
  const res = await fetchPatients({ page: 1, pageSize: 1000 });
  patients.value = res.items;
}

async function diagnose() {
  err.value = "";
  result.value = null;
  if (!patientId.value) {
    err.value = "Chọn bệnh nhân";
    return;
  }
  if (selected.value.length === 0) {
    err.value = "Chọn ít nhất 1 triệu chứng";
    return;
  }
  loading.value = true;
  try {
    const r = await runDiagnosis(selected.value);
    result.value = r;
  } catch (e: any) {
    err.value = e?.response?.data ?? "Chẩn đoán thất bại";
  } finally {
    loading.value = false;
  }
}

async function save() {
  if (!patientId.value || !result.value) return;
  loading.value = true;
  try {
    await saveDiagnosis({
      patientId: patientId.value,
      symptoms: selected.value,
      disease: result.value.disease,
      confidence: result.value.confidence,
      result: result.value.explanation ?? result.value.disease,
    });
    alert("Đã lưu lịch sử chẩn đoán");
  } catch (e: any) {
    alert(e?.response?.data ?? "Lưu thất bại");
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const [symptoms] = await Promise.all([getSymptomList(), loadPatients()]);
  allSymptoms.value = symptoms;
});
</script>

<template>
  <div>
    <h2 class="fw-bold text-primary mb-3">🩺 Chẩn đoán</h2>

    <div class="card mb-3">
      <div class="card-body row g-3">
        <div class="col-md-4">
          <label class="form-label">Bệnh nhân</label>
          <select v-model.number="patientId" class="form-select">
            <option :value="null" disabled>-- Chọn bệnh nhân --</option>
            <option
              v-for="p in patients"
              :key="p.patientId"
              :value="p.patientId"
            >
              {{ p.fullName }} ({{ p.dob?.slice(0, 10) }})
            </option>
          </select>
        </div>
        <div class="col-md-8">
          <label class="form-label">Lọc triệu chứng</label>
          <input
            v-model="filter"
            class="form-control"
            placeholder="Nhập từ khoá..."
          />
        </div>
        <div class="col-12">
          <div
            class="border rounded p-2"
            style="max-height: 280px; overflow: auto"
          >
            <div class="form-check" v-for="s in shownSymptoms" :key="s">
              <input
                class="form-check-input"
                type="checkbox"
                :id="s"
                :value="s"
                v-model="selected"
              />
              <label class="form-check-label" :for="s">{{ s }}</label>
            </div>
          </div>
          <div class="small text-muted mt-1">
            Đã chọn: {{ selected.length }}
          </div>
        </div>
        <div class="col-12 d-flex gap-2">
          <button class="btn btn-primary" :disabled="loading" @click="diagnose">
            {{ loading ? "Đang chẩn đoán..." : "Chẩn đoán" }}
          </button>
          <button
            class="btn btn-success"
            :disabled="!result || loading"
            @click="save"
          >
            💾 Lưu kết quả
          </button>
        </div>
      </div>
    </div>

    <div v-if="err" class="alert alert-danger">{{ err }}</div>

    <div v-if="result" class="card border-success">
      <div class="card-body">
        <h5 class="text-success">Kết quả</h5>
        <p class="mb-1"><b>Bệnh nghi ngờ:</b> {{ result.disease || "—" }}</p>
        <p class="mb-1">
          <b>Độ tin cậy:</b>
          <span v-if="result.confidence != null"
            >{{ (result.confidence * 100).toFixed(0) }}%</span
          ><span v-else>—</span>
        </p>
        <p class="mb-0"><b>Giải thích:</b> {{ result.explanation || "—" }}</p>
      </div>
    </div>
  </div>
</template>
