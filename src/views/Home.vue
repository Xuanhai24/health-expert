<script setup lang="ts">
import { onMounted } from "vue";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const cards = [
  { title: "Nhân viên", value: 14, bg: "bg-primary", icon: "bi-people-fill" },
  { title: "Bệnh nhân", value: 58, bg: "bg-success", icon: "bi-hospital-fill" },
  { title: "Chuẩn đoán", value: 32, bg: "bg-warning", icon: "bi-activity" },
  { title: "Báo cáo", value: 7, bg: "bg-danger", icon: "bi-clipboard-data" },
];

onMounted(() => {
  const ctx1 = document.getElementById("chart1") as HTMLCanvasElement;
  new Chart(ctx1, {
    type: "doughnut",
    data: {
      labels: ["Bác sĩ", "Bệnh nhân"],
      datasets: [
        {
          data: [10, 50],
          backgroundColor: ["#0d6efd", "#20c997"],
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });

  const ctx2 = document.getElementById("chart2") as HTMLCanvasElement;
  new Chart(ctx2, {
    type: "bar",
    data: {
      labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4"],
      datasets: [
        {
          label: "Số ca chẩn đoán",
          data: [20, 35, 40, 55],
          backgroundColor: "#fd7e14",
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
});
</script>

<template>
  <div>
    <h4 class="mb-4">Chào mừng bạn quay lại!</h4>

    <!-- Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-3 col-sm-6" v-for="card in cards" :key="card.title">
        <div :class="['card shadow-sm text-white p-3', card.bg]">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-1">{{ card.title }}</h6>
              <h3 class="fw-bold">{{ card.value }}</h3>
            </div>
            <i :class="['bi fs-1 opacity-25', card.icon]"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="row g-3">
      <div class="col-md-6">
        <div class="card shadow-sm p-3" style="height: 350px">
          <h6 class="mb-3">Cơ cấu hệ thống</h6>
          <div style="height: 250px">
            <canvas id="chart1"></canvas>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card shadow-sm p-3" style="height: 350px">
          <h6 class="mb-3">Thống kê chẩn đoán</h6>
          <div style="height: 250px">
            <canvas id="chart2"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 10px;
  transition: transform 0.2s ease-in-out;
}
.card:hover {
  transform: translateY(-4px);
}
</style>
