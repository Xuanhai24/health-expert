<script setup lang="ts">
import { ref, watch } from "vue";
import {
  fetchPatients,
  createPatient,
  updatePatient,
  deletePatient,
  type Patient,
} from "@/services/patients";
import { useRouter } from "vue-router";

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

const showModal = ref(false);
const isEdit = ref(false);
const form = ref<Omit<Patient, "patientId">>({
  fullName: "",
  dob: "",
  gender: "Nam",
});
const editId = ref<number | null>(null);

let t: any;
watch(q, () => {
  clearTimeout(t);
  t = setTimeout(load, 400);
});

async function load() {
  loading.value = true;
  err.value = "";
  try {
    const res = await fetchPatients({
      q: q.value,
      sort: sort.value,
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
  try {
    if (isEdit.value && editId.value != null) {
      await updatePatient(editId.value, form.value);
    } else {
      await createPatient(form.value);
    }
    showModal.value = false;
    await load();
  } catch (e) {
    alert("Không lưu được!");
  }
}

async function remove(p: Patient) {
  if (!confirm(`Xóa bệnh nhân ${p.fullName}?`)) return;
  try {
    await deletePatient(p.patientId);
    await load();
  } catch (e) {
    alert("Không xóa được!");
  }
}

load();
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>🧑‍⚕️ Quản lý bệnh nhân</h2>
      <button class="btn btn-primary btn-sm" @click="openCreate">
        + Thêm bệnh nhân
      </button>
    </div>

    <div v-if="err" class="alert alert-danger">{{ err }}</div>

    <div class="card">
      <div class="card-body p-0">
        <table class="table table-striped mb-0">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Họ tên</th>
              <th>Ngày sinh</th>
              <th>Giới tính</th>
              <th class="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in rows" :key="p.patientId">
              <td>{{ i + 1 }}</td>
              <td>
                <a
                  href=""
                  @click.prevent="router.push(`/benh-nhan/${p.patientId}`)"
                >
                  {{ p.fullName }}
                </a>
              </td>
              <td>{{ p.dob?.slice(0, 10) }}</td>
              <td>{{ p.gender }}</td>
              <td class="text-end">
                <button
                  class="btn btn-sm btn-outline-secondary me-1"
                  @click="openEdit(p)"
                >
                  Sửa
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="remove(p)"
                >
                  Xóa
                </button>
              </td>
            </tr>
            <tr v-if="!loading && rows.length === 0">
              <td colspan="5" class="text-center py-3">Chưa có bệnh nhân</td>
            </tr>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-3">⏳ Đang tải...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      style="background: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? "Sửa" : "Thêm" }} bệnh nhân</h5>
            <button
              type="button"
              class="btn-close"
              @click="showModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Họ tên</label>
              <input type="text" v-model="form.fullName" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Ngày sinh</label>
              <input type="date" v-model="form.dob" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Giới tính</label>
              <select v-model="form.gender" class="form-select">
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showModal = false"
            >
              Đóng
            </button>
            <button type="button" class="btn btn-primary" @click="save">
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
