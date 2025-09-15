<script setup lang="ts">
import { RouterView, useRoute, useRouter, RouterLink } from "vue-router";
import { useAuth } from "@/stores/auth";
import { onMounted, computed } from "vue";
import gsap from "gsap";

const auth = useAuth();
const route = useRoute();
const router = useRouter();

// RBAC helpers
const role = computed(() => auth.user?.role ?? "");
const isAdmin = computed(() => role.value === "ADMIN");
const allow = (roles: string[]) => roles.includes(role.value);

onMounted(() => {
  if (auth.user) {
    gsap.from(".sidebar", { x: -200, opacity: 0, duration: 0.8 });
    gsap.from(".sidebar .nav-item", {
      x: -50,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      delay: 0.3,
    });
  }
});

function doLogout() {
  auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <!-- 1. Trang đăng nhập -->
  <div v-if="route.name === 'login'" class="vh-100">
    <RouterView />
  </div>

  <!-- 2. Các trang công khai (requiresAuth: false) -->
  <div v-else-if="!auth.user">
    <RouterView />
  </div>

  <!-- 3. Layout chính (các trang yêu cầu đăng nhập) -->
  <div v-else class="d-flex vh-100">
    <!-- Sidebar -->
    <aside
      class="sidebar d-flex flex-column bg-dark text-white"
      style="width: 260px"
    >
      <div class="p-3 border-bottom border-secondary fs-4 fw-bold">
        Hệ Chuyên Gia
      </div>

      <nav class="flex-grow-1 p-3 nav flex-column">
        <!-- Các mục chung cho ADMIN & DOCTOR -->
        <RouterLink
          v-if="allow(['ADMIN', 'DOCTOR'])"
          to="/"
          class="nav-item d-block px-3 py-2 rounded text-white text-decoration-none mb-2 router-link"
          >Trang chủ</RouterLink
        >

        <RouterLink
          v-if="allow(['ADMIN', 'DOCTOR'])"
          to="/benh-nhan"
          class="nav-item d-block px-3 py-2 rounded text-white text-decoration-none mb-2 router-link"
          >Quản lý bệnh nhân</RouterLink
        >

        <RouterLink
          v-if="allow(['ADMIN', 'DOCTOR'])"
          to="/chuan-doan"
          class="nav-item d-block px-3 py-2 rounded text-white text-decoration-none mb-2 router-link"
          >🩺 Chuẩn đoán</RouterLink
        >

        <RouterLink
          v-if="allow(['ADMIN', 'DOCTOR'])"
          to="/kien-thuc"
          class="nav-item d-block px-3 py-2 rounded text-white text-decoration-none mb-2 router-link"
          >📚 Quản lý tri thức y khoa</RouterLink
        >

        <!-- Chỉ ADMIN mới thấy -->
        <RouterLink
          v-if="isAdmin"
          to="/bac-si"
          class="nav-item d-block px-3 py-2 rounded text-white text-decoration-none mb-2 router-link"
          >👨‍⚕️ Quản lý bác sĩ</RouterLink
        >

        <RouterLink
          v-if="isAdmin"
          to="/admin"
          class="nav-item d-block px-3 py-2 rounded text-white text-decoration-none mb-2 router-link"
          >⚙️ Quản trị hệ thống</RouterLink
        >

        <RouterLink
          v-if="isAdmin"
          to="/thong-ke"
          class="nav-item d-block px-3 py-2 rounded text-white text-decoration-none mb-2 router-link"
          >📊 Thống kê & báo cáo</RouterLink
        >
      </nav>

      <!-- Footer -->
      <div class="p-3 border-top border-secondary">
        <div v-if="auth.user" class="mb-2">
          <p class="small mb-2">
            Xin chào,
            <b>{{ auth.user.name || auth.user.email }}</b>
            <span class="badge bg-secondary ms-2">{{ auth.user.role }}</span>
          </p>
          <button @click="doLogout" class="btn btn-danger btn-sm w-100">
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>

    <!-- Nội dung -->
    <main class="flex-grow-1 bg-light p-4 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.router-link-active {
  background-color: #495057;
}
.router-link:hover {
  background-color: #495057;
}
</style>
