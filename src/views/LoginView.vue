<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuth } from "@/stores/auth";
import { useRouter, useRoute } from "vue-router";
import gsap from "gsap";
import anime from "animejs";

const email = ref("admin@local");
const password = ref("Admin@123");
const loading = ref(false);
const err = ref("");
const auth = useAuth();
const router = useRouter();
const route = useRoute();

onMounted(() => {
  // Hiệu ứng khi load trang
  gsap.from(".login-page", { opacity: 0, duration: 1 });
  anime({
    targets: ".login-form",
    translateY: [100, 0],
    opacity: [0, 1],
    duration: 1200,
    easing: "easeOutExpo",
  });
});

async function submit() {
  err.value = "";
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    const to =
      (route.query.redirect as string) ||
      (auth.user?.role === "ADMIN" ? "/admin" : "/bac-si");
    router.replace(to);
  } catch (e: any) {
    err.value = e?.response?.data?.message || "Đăng nhập thất bại";

    // Hiệu ứng shake khi login sai
    anime({
      targets: ".login-form",
      translateX: [
        { value: -10, duration: 100 },
        { value: 10, duration: 100 },
        { value: -10, duration: 100 },
        { value: 10, duration: 100 },
        { value: 0, duration: 100 },
      ],
      easing: "easeInOutQuad",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="login-page d-flex align-items-center justify-content-center vh-100"
  >
    <!-- Overlay mờ -->
    <div class="overlay"></div>

    <!-- Form -->
    <div
      class="login-form card shadow-lg p-5 text-center"
      style="max-width: 420px; width: 100%"
    >
      <div class="mb-4">
        <i class="bi bi-person-circle fs-1 text-primary"></i>
        <h3 class="mt-2 fw-bold">Đăng nhập</h3>
        <p class="text-muted small">Vui lòng nhập thông tin của bạn</p>
      </div>

      <div v-if="err" class="alert alert-danger small py-2 mb-3">
        {{ err }}
      </div>

      <form @submit.prevent="submit">
        <div class="mb-3 text-start">
          <label class="form-label fw-semibold">Email</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-envelope-fill"></i>
            </span>
            <input
              v-model="email"
              type="email"
              class="form-control"
              placeholder="Nhập email"
              required
            />
          </div>
        </div>

        <div class="mb-3 text-start">
          <label class="form-label fw-semibold">Mật khẩu</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-lock-fill"></i>
            </span>
            <input
              v-model="password"
              type="password"
              class="form-control"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
        </div>

        <button
          :disabled="loading"
          type="submit"
          class="btn btn-primary w-100 fw-semibold py-2"
        >
          {{ loading ? "Đang đăng nhập..." : "Đăng nhập" }}
        </button>
      </form>

      <div class="text-center mt-3">
        <a href="#" class="small text-decoration-none">Quên mật khẩu?</a>
      </div>
      <div class="text-center mt-2">
        <router-link to="/dang-ky-bac-si" class="small text-decoration-none">
          Chưa có tài khoản? Đăng ký bác sĩ
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  background: url("/src/lib/gpo-bacsi.2.jpg") no-repeat center center/cover;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4); /* nền tối mờ */
  backdrop-filter: blur(3px); /* làm mờ background */
  z-index: 1;
}

.login-form {
  position: relative;
  z-index: 2;
  border-radius: 12px;
}
</style>
