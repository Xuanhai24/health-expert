<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { http } from "@/lib/http";

const email = ref("");
const fullName = ref("");
const password = ref("");
const confirm = ref("");
const loading = ref(false);
const err = ref("");
const router = useRouter();

async function submit() {
  err.value = "";
  if (password.value !== confirm.value) {
    err.value = "Mật khẩu xác nhận không khớp";
    return;
  }
  loading.value = true;
  try {
    const res = await http.post("api/Auth/register-doctor", {
      email: email.value,
      fullName: fullName.value,
      password: password.value,
    });
    // Lưu token và chuyển vào trang bác sĩ
    localStorage.setItem("token", res.data.token);
    // nếu bạn có store auth, có thể gọi fetchMe() tại đây
    router.replace("/bac-si");
  } catch (e: any) {
    err.value = e?.response?.data ?? "Đăng ký thất bại";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="register-page d-flex align-items-center justify-content-center vh-100"
  >
    <div class="card shadow-lg p-4" style="max-width: 480px; width: 100%">
      <h3 class="fw-bold mb-3 text-primary text-center">Đăng ký Bác sĩ</h3>

      <div v-if="err" class="alert alert-danger py-2 small mb-3">{{ err }}</div>

      <form @submit.prevent="submit">
        <div class="mb-3">
          <label class="form-label">Họ tên</label>
          <input
            v-model="fullName"
            type="text"
            class="form-control"
            placeholder="VD: Bác sĩ Nguyễn Văn A"
            required
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input
            v-model="email"
            type="email"
            class="form-control"
            placeholder="admin@local"
            required
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Mật khẩu</label>
          <input
            v-model="password"
            type="password"
            class="form-control"
            placeholder="Tối thiểu 6 ký tự"
            required
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Xác nhận mật khẩu</label>
          <input
            v-model="confirm"
            type="password"
            class="form-control"
            required
          />
        </div>

        <button :disabled="loading" class="btn btn-success w-100">
          {{ loading ? "Đang đăng ký..." : "Đăng ký" }}
        </button>

        <div class="text-center mt-3">
          <router-link to="/login" class="small"
            >Đã có tài khoản? Đăng nhập</router-link
          >
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  background: #f7fbff;
}
</style>
