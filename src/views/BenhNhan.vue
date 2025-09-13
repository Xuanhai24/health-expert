<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import gsap from "gsap";
import {
  fetchPatients,
  createPatient,
  updatePatient,
  deletePatient,
  type Patient,
} from "@/services/patients";
import { useRouter } from "vue-router";

// state
const router = useRouter();
const rows = ref<Patient[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(8);
const q = ref("");
const sort = ref<keyof Patient>("fullName");
const dir = ref<"asc" | "desc">("asc");
const loading = ref(false);
const err = ref("");

// modal state
const showModal = ref(false);
const isEdit = ref(false);
const form = ref<Omit<Patient, "patientId">>({
  fullName: "",
  dob: "",
  gender: "Nam",
});
const editId = ref<number | null>(null);

// debounce search
let t: any;
watch(q, () => {
  clearTimeout(t);
  t = setTimeout(() => {
    page.value = 1;
    load();
  }, 350);
});

async function load() {
  loading.value = true;
  err.value = "";
  try {
    const res = await fetchPatients({
      q: q.value || undefined,
      sort: sort.value as string,
      dir: dir.value,
      page: page.value,
      pageSize: pageSize.value,
    });
    rows.value = res.items;
    total.value = res.total;
  } catch (e: any) {
    err.value = e?.response?.data ?? "Không tải được danh sách bệnh nhân";
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  isEdit.value = false;
  editId.value = null;
  form.value = { fullName: "", dob: "", gender: "Nam" };
  showModal.value = true;
}

function openEdit(p: Patient) {
  isEdit.value = true;
  editId.value = p.patientId;
  form.value = {
    fullName: p.fullName,
    dob: p.dob?.slice(0, 10) ?? "",
    gender: p.gender,
  };
  showModal.value = true;
}

async function save() {
  if (!form.value.fullName?.trim()) return alert("Nhập họ tên");
  if (!form.value.dob) return alert("Chọn ngày sinh");
  loading.value = true;
  try {
    if (isEdit.value && editId.value) {
      await updatePatient(editId.value, {
        ...form.value,
        patientId: editId.value, // 👈 bắt buộc thêm
      } as any);
    } else {
      await createPatient(form.value);
    }
    showModal.value = false;
    await load();
  } catch (e: any) {
    const pd = e?.response?.data;
    alert(pd?.title || pd?.detail || pd || "Lưu thất bại");
    console.error(pd || e);
  } finally {
    loading.value = false;
  }
}

async function remove(id: number) {
  if (!confirm("Xoá bệnh nhân này?")) return;
  loading.value = true;
  try {
    await deletePatient(id);
    await load();
  } catch (e: any) {
    alert(e?.response?.data ?? "Xoá thất bại");
  } finally {
    loading.value = false;
  }
}

function toggleSort(field: keyof Patient) {
  if (sort.value === field) {
    dir.value = dir.value === "asc" ? "desc" : "asc";
  } else {
    sort.value = field;
    dir.value = "asc";
  }
  page.value = 1;
  load();
}

const totalPages = computed(() =>
  Math.max(1, Math.ceil(total.value / pageSize.value))
);

function goDetail(p: Patient) {
  router.push({ name: "benhnhan-detail", params: { id: p.patientId } });
}

onMounted(async () => {
  await load();
  gsap.from(".benhnhan-container", { y: 30, opacity: 0, duration: 0.6 });
});
</script>

<template>
  <div class="benhnhan-container">
    <div class="d-flex align-items-center mb-3">
      <h2 class="fw-bold me-auto text-primary">🧑‍⚕️ Quản lý bệnh nhân</h2>
      <div class="input-group me-2" style="width: 320px">
        <span class="input-group-text">🔎</span>
        <input
          v-model="q"
          class="form-control"
          placeholder="Tìm theo họ tên, ..."
        />
      </div>
      <button class="btn btn-success" @click="openCreate">
        ➕ Thêm bệnh nhân
      </button>
    </div>

    <div v-if="err" class="alert alert-danger">{{ err }}</div>

    <div class="card shadow-sm">
      <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 60px">#</th>
              <th @click="toggleSort('fullName')" role="button">
                Họ tên <small>({{ sort === "fullName" ? dir : "" }})</small>
              </th>
              <th @click="toggleSort('dob')" role="button">
                Ngày sinh <small>({{ sort === "dob" ? dir : "" }})</small>
              </th>
              <th @click="toggleSort('gender')" role="button">
                Giới tính <small>({{ sort === "gender" ? dir : "" }})</small>
              </th>
              <th class="text-center" style="width: 220px">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-4">⏳ Đang tải...</td>
            </tr>
            <tr v-for="(p, i) in rows" :key="p.patientId">
              <td>{{ (page - 1) * pageSize + i + 1 }}</td>
              <td>
                <a href="" @click.prevent="goDetail(p)">{{ p.fullName }}</a>
              </td>
              <td>{{ p.dob?.slice(0, 10) }}</td>
              <td>
                <span
                  class="badge"
                  :class="p.gender === 'Nam' ? 'bg-primary' : 'bg-pink'"
                  >{{ p.gender }}</span
                >
              </td>
              <td class="text-center">
                <button
                  class="btn btn-outline-info btn-sm me-1"
                  @click="openEdit(p)"
                >
                  ✏️ Sửa
                </button>
                <button
                  class="btn btn-outline-danger btn-sm"
                  @click="remove(p.patientId)"
                >
                  🗑 Xoá
                </button>
              </td>
            </tr>
            <tr v-if="!loading && rows.length === 0">
              <td colspan="5" class="text-center py-4">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- pagination -->
      <div
        class="card-footer d-flex justify-content-between align-items-center"
      >
        <div>
          Tổng: <b>{{ total }}</b>
        </div>
        <div class="d-flex align-items-center gap-2">
          <select
            v-model.number="pageSize"
            class="form-select form-select-sm"
            style="width: 90px"
            @change="
              page = 1;
              load();
            "
          >
            <option :value="5">5</option>
            <option :value="8">8</option>
            <option :value="12">12</option>
          </select>
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="page <= 1"
            @click="
              page--;
              load();
            "
          >
            «
          </button>
          <span class="mx-1 small">Trang {{ page }} / {{ totalPages }}</span>
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="page >= totalPages"
            @click="
              page++;
              load();
            "
          >
            »
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-card">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h5 class="m-0">{{ isEdit ? "Sửa bệnh nhân" : "Thêm bệnh nhân" }}</h5>
          <button class="btn btn-sm btn-light" @click="showModal = false">
            ✖
          </button>
        </div>

        <div class="mb-3">
          <label class="form-label">Họ tên</label>
          <input
            v-model="form.fullName"
            type="text"
            class="form-control"
            placeholder="VD: Nguyễn Văn A"
          />
        </div>
        <div class="row g-2">
          <div class="col-6">
            <label class="form-label">Ngày sinh</label>
            <input v-model="form.dob" type="date" class="form-control" />
          </div>
          <div class="col-6">
            <label class="form-label">Giới tính</label>
            <select v-model="form.gender" class="form-select">
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
        </div>

        <div class="d-flex justify-content-end mt-3">
          <button class="btn btn-secondary me-2" @click="showModal = false">
            Huỷ
          </button>
          <button class="btn btn-primary" :disabled="loading" @click="save">
            {{ loading ? "Đang lưu..." : "Lưu" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.badge.bg-pink {
  background-color: #e83e8c !important;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-card {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
</style>
