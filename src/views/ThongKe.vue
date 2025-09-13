<script setup lang="ts">
import { ref, onMounted } from "vue";
import { http } from "@/lib/http";
import dayjs from "dayjs";

type Counts = {
  totalPatients: number;
  totalDoctors: number;
  diagnosesThisMonth: number;
};

const counts = ref<Counts>({
  totalPatients: 0,
  totalDoctors: 0,
  diagnosesThisMonth: 0,
});
const from = ref(dayjs().add(-29, "day").format("YYYY-MM-DD"));
const to = ref(dayjs().format("YYYY-MM-DD"));
const byDate = ref<{ date: string; count: number }[]>([]);
const loading = ref(false);

async function loadCounts() {
  // nếu backend có /api/Reports/overview thì xài luôn, còn không dùng /counts
  try {
    const r = await http.get("/Reports/overview");
    counts.value = r.data;
  } catch {
    const r = await http.get("/Reports/counts");
    counts.value = r.data;
  }
}
async function loadByDate() {
  const r = await http.get("/Reports/diagnoses-by-date", {
    params: { from: from.value, to: to.value },
  });
  byDate.value = r.data;
}
async function reload() {
  loading.value = true;
  try {
    await Promise.all([loadCounts(), loadByDate()]);
  } finally {
    loading.value = false;
  }
}
onMounted(reload);
</script>

<template>
  <div>
    <h2 class="fw-bold mb-3">📊 Thống kê & báo cáo</h2>

    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="text-muted">Tổng bệnh nhân</div>
            <div class="fs-3 fw-bold">{{ counts.totalPatients }}</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="text-muted">Tổng bác sĩ</div>
            <div class="fs-3 fw-bold">{{ counts.totalDoctors }}</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="text-muted">Ca chẩn đoán (tháng này)</div>
            <div class="fs-3 fw-bold">{{ counts.diagnosesThisMonth }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-header d-flex align-items-center gap-2">
        <b>Biểu bảng số ca chẩn đoán theo ngày</b>
        <input
          type="date"
          v-model="from"
          class="form-control form-control-sm ms-auto"
          style="max-width: 160px"
        />
        <span>→</span>
        <input
          type="date"
          v-model="to"
          class="form-control form-control-sm"
          style="max-width: 160px"
        />
        <button class="btn btn-sm btn-outline-secondary ms-2" @click="reload">
          Lọc
        </button>
      </div>
      <div class="card-body p-0">
        <table class="table table-striped mb-0">
          <thead class="table-light">
            <tr>
              <th>Ngày</th>
              <th class="text-end">Số ca</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="2" class="text-center py-3">Đang tải…</td>
            </tr>
            <tr v-for="r in byDate" :key="r.date">
              <td>{{ r.date }}</td>
              <td class="text-end">{{ r.count }}</td>
            </tr>
            <tr v-if="!loading && byDate.length === 0">
              <td colspan="2" class="text-center py-3">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
