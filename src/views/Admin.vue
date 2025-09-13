<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { http } from "@/lib/http";
import { useAuth } from "@/stores/auth";

type UserRow = {
  userId: number;
  email: string;
  fullName?: string;
  role: "ADMIN" | "DOCTOR";
};

const auth = useAuth();
const rows = ref<UserRow[]>([]);
const loading = ref(false);

const canAdmin = computed(() => auth.user?.role === "ADMIN");

async function load() {
  loading.value = true;
  try {
    const r = await http.get("/Users");
    rows.value = r.data;
  } finally {
    loading.value = false;
  }
}

async function changeRole(u: UserRow, role: "ADMIN" | "DOCTOR") {
  if (!canAdmin.value) return;
  await http.put(`/Users/${u.userId}/role`, { role });
  u.role = role;
}

onMounted(load);
</script>

<template>
  <div>
    <h2 class="fw-bold mb-3">⚙️ Quản trị hệ thống</h2>

    <div v-if="!canAdmin" class="alert alert-warning">
      Bạn không có quyền truy cập trang này.
    </div>

    <div class="card shadow-sm">
      <div class="card-body p-0">
        <table class="table table-hover mb-0 align-middle">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Role</th>
              <th class="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-3">Đang tải…</td>
            </tr>
            <tr v-for="(u, i) in rows" :key="u.userId">
              <td>{{ i + 1 }}</td>
              <td>{{ u.fullName || "-" }}</td>
              <td>{{ u.email }}</td>
              <td>
                <span
                  class="badge"
                  :class="u.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'"
                  >{{ u.role }}</span
                >
              </td>
              <td class="text-end">
                <div class="btn-group">
                  <button
                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    Đổi role
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <a
                        class="dropdown-item"
                        href="#"
                        @click.prevent="changeRole(u, 'ADMIN')"
                        >ADMIN</a
                      >
                    </li>
                    <li>
                      <a
                        class="dropdown-item"
                        href="#"
                        @click.prevent="changeRole(u, 'DOCTOR')"
                        >DOCTOR</a
                      >
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && rows.length === 0">
              <td colspan="5" class="text-center py-3">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
