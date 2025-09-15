<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { http } from "@/lib/http";
import { useAuth } from "@/stores/auth";

type Doctor = {
  doctorId: number;
  fullName: string;
  email: string;
  phone?: string;
  specialty?: string;
  password?: string; // dùng khi thêm mới
};

const auth = useAuth();
const rows = ref<Doctor[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const q = ref("");
const sort = ref<"fullName" | "email" | "phone" | "specialty">("fullName");
const dir = ref<"asc" | "desc">("asc");
const loading = ref(false);

const showModal = ref(false);
const editingId = ref<number | null>(null);
const form = reactive<Doctor>({
  doctorId: 0,
  fullName: "",
  email: "",
  phone: "",
  specialty: "",
  password: "",
});

const canAdmin = computed(() => auth.user?.role === "ADMIN");

async function load() {
  loading.value = true;
  try {
    const res = await http.get("/api/Doctors", {
      params: {
        q: q.value,
        sort: sort.value,
        dir: dir.value,
        page: page.value,
        pageSize: pageSize.value,
      },
    });
    const data = res.data;
    if (Array.isArray(data)) {
      rows.value = data;
      total.value = data.length;
    } else {
      rows.value = data.items ?? data.Items ?? [];
      total.value = data.total ?? data.Total ?? rows.value.length;
    }
  } finally {
    loading.value = false;
  }
}

function setSort(s: typeof sort.value) {
  if (sort.value === s) dir.value = dir.value === "asc" ? "desc" : "asc";
  else {
    sort.value = s;
    dir.value = "asc";
  }
  load();
}

function openNew() {
  editingId.value = null;
  Object.assign(form, {
    doctorId: 0,
    fullName: "",
    email: "",
    phone: "",
    specialty: "",
    password: "",
  });
  showModal.value = true;
}

function openEdit(row: Doctor) {
  editingId.value = row.doctorId;
  Object.assign(form, row);
  form.password = ""; // reset password khi sửa
  showModal.value = true;
}

async function save() {
  if (!canAdmin.value) return;
  if (editingId.value) {
    // cập nhật bác sĩ
    await http.put(`/api/Doctors/${editingId.value}`, {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      specialty: form.specialty,
    });
  } else {
    // thêm mới bác sĩ + user
    await http.post("/api/Doctors/create-with-user", {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      specialty: form.specialty,
      password: form.password,
    });
  }
  showModal.value = false;
  await load();
}

async function remove(id: number) {
  if (!canAdmin.value) return;
  if (!confirm("Xóa bác sĩ này?")) return;
  await http.delete(`/api/Doctors/${id}`);
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <h2 class="fw-bold mb-3">👨‍⚕️ Quản lý bác sĩ</h2>

    <div v-if="!canAdmin" class="alert alert-warning">
      Bạn không có quyền truy cập trang này.
    </div>

    <div class="d-flex gap-2 align-items-center mb-3">
      <input
        v-model="q"
        @keyup.enter="(page = 1), load()"
        class="form-control"
        placeholder="Tìm theo tên, email, số ĐT, chuyên khoa"
      />
      <button class="btn btn-outline-secondary" @click="(page = 1), load()">
        Tìm
      </button>
      <button
        class="btn btn-primary ms-auto"
        :disabled="!canAdmin"
        @click="openNew"
      >
        ➕ Thêm bác sĩ
      </button>
    </div>

    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th style="width: 60px">#</th>
            <th role="button" @click="setSort('fullName')">Họ tên</th>
            <th role="button" @click="setSort('email')">Email</th>
            <th role="button" @click="setSort('phone')">SĐT</th>
            <th role="button" @click="setSort('specialty')">Chuyên khoa</th>
            <th class="text-end" style="width: 160px">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center">Đang tải…</td>
          </tr>
          <tr v-for="(r, i) in rows" :key="r.doctorId">
            <td>{{ (page - 1) * pageSize + i + 1 }}</td>
            <td>{{ r.fullName }}</td>
            <td>{{ r.email }}</td>
            <td>{{ r.phone || "-" }}</td>
            <td>{{ r.specialty || "-" }}</td>
            <td class="text-end">
              <button
                class="btn btn-sm btn-outline-info me-1"
                :disabled="!canAdmin"
                @click="openEdit(r)"
              >
                Sửa
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                :disabled="!canAdmin"
                @click="remove(r.doctorId)"
              >
                Xóa
              </button>
            </td>
          </tr>
          <tr v-if="!loading && rows.length === 0">
            <td colspan="6" class="text-center">Không có dữ liệu</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="d-flex align-items-center gap-2">
      <span class="text-muted">Tổng: {{ total }}</span>
      <div class="ms-auto d-flex gap-2">
        <button
          class="btn btn-sm btn-outline-secondary"
          :disabled="page === 1"
          @click="page--, load()"
        >
          «
        </button>
        <span class="px-2">Trang {{ page }}</span>
        <button
          class="btn btn-sm btn-outline-secondary"
          :disabled="page * pageSize >= total"
          @click="page++, load()"
        >
          »
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div
      class="modal fade show"
      tabindex="-1"
      style="display: block"
      v-if="showModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingId ? "Sửa bác sĩ" : "Thêm bác sĩ" }}
            </h5>
            <button class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-2">
              <label class="form-label">Họ tên</label>
              <input v-model="form.fullName" class="form-control" />
            </div>
            <div class="mb-2">
              <label class="form-label">Email</label>
              <input v-model="form.email" class="form-control" type="email" />
            </div>
            <div class="mb-2">
              <label class="form-label">SĐT</label>
              <input v-model="form.phone" class="form-control" />
            </div>
            <div class="mb-2">
              <label class="form-label">Chuyên khoa</label>
              <input v-model="form.specialty" class="form-control" />
            </div>
            <div class="mb-2" v-if="!editingId">
              <label class="form-label">Mật khẩu</label>
              <input
                v-model="form.password"
                class="form-control"
                type="password"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-light" @click="showModal = false">
              Hủy
            </button>
            <button class="btn btn-primary" @click="save">Lưu</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal-backdrop fade show"></div>
  </div>
</template>
