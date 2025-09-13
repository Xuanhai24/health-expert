<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  getSymptoms,
  createSymptom,
  updateSymptom,
  deleteSymptom,
  getDiseases,
  createDisease,
  updateDisease,
  deleteDisease,
  getRules,
  createRule,
  updateRule,
  deleteRule,
  type Symptom,
  type Disease,
  type Rule,
} from "@/services/knowledge";

const tab = ref<"sym" | "dis" | "rule">("sym");

// data
const symptoms = ref<Symptom[]>([]);
const diseases = ref<Disease[]>([]);
const rules = ref<Rule[]>([]);

const loading = ref(false);
const err = ref("");

// modal states (reuse simple modal)
const show = ref(false);
const mode = ref<"create" | "edit">("create");
const editId = ref<number | null>(null);
const symForm = ref<Omit<Symptom, "symptomId">>({ name: "", code: "" });
const disForm = ref<Omit<Disease, "diseaseId">>({ name: "", icd: "" });
const ruleForm = ref<Omit<Rule, "ruleId">>({
  symptomId: 0,
  diseaseId: 0,
  weight: 1,
  description: "",
});

async function loadAll() {
  loading.value = true;
  err.value = "";
  try {
    const [s, d, r] = await Promise.all([
      getSymptoms(),
      getDiseases(),
      getRules(),
    ]);
    symptoms.value = s;
    diseases.value = d;
    rules.value = r;
  } catch (e: any) {
    err.value = e?.response?.data ?? "Không tải được tri thức";
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  mode.value = "create";
  editId.value = null;
  if (tab.value === "sym") symForm.value = { name: "", code: "" };
  if (tab.value === "dis") disForm.value = { name: "", icd: "" };
  if (tab.value === "rule")
    ruleForm.value = {
      symptomId: symptoms.value[0]?.symptomId ?? 0,
      diseaseId: diseases.value[0]?.diseaseId ?? 0,
      weight: 1,
      description: "",
    };
  show.value = true;
}
function openEdit(item: any) {
  mode.value = "edit";
  if (tab.value === "sym") {
    editId.value = item.symptomId;
    symForm.value = { name: item.name, code: item.code };
  }
  if (tab.value === "dis") {
    editId.value = item.diseaseId;
    disForm.value = { name: item.name, icd: item.icd };
  }
  if (tab.value === "rule") {
    editId.value = item.ruleId;
    ruleForm.value = {
      symptomId: item.symptomId,
      diseaseId: item.diseaseId,
      weight: item.weight,
      description: item.description,
    };
  }
  show.value = true;
}

async function save() {
  loading.value = true;
  try {
    if (tab.value === "sym") {
      if (mode.value === "edit" && editId.value)
        await updateSymptom(editId.value, symForm.value);
      else await createSymptom(symForm.value);
    } else if (tab.value === "dis") {
      if (mode.value === "edit" && editId.value)
        await updateDisease(editId.value, disForm.value);
      else await createDisease(disForm.value);
    } else {
      if (mode.value === "edit" && editId.value)
        await updateRule(editId.value, ruleForm.value);
      else await createRule(ruleForm.value);
    }
    show.value = false;
    await loadAll();
  } catch (e: any) {
    alert(e?.response?.data ?? "Lưu thất bại");
  } finally {
    loading.value = false;
  }
}

async function remove(item: any) {
  if (!confirm("Xoá mục này?")) return;
  loading.value = true;
  try {
    if (tab.value === "sym") await deleteSymptom(item.symptomId);
    else if (tab.value === "dis") await deleteDisease(item.diseaseId);
    else await deleteRule(item.ruleId);
    await loadAll();
  } catch (e: any) {
    alert(e?.response?.data ?? "Xoá thất bại");
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);
</script>

<template>
  <div>
    <h2 class="fw-bold text-primary mb-3">📚 Quản lý tri thức y khoa</h2>
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: tab === 'sym' }"
          @click="tab = 'sym'"
        >
          Triệu chứng
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: tab === 'dis' }"
          @click="tab = 'dis'"
        >
          Bệnh
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: tab === 'rule' }"
          @click="tab = 'rule'"
        >
          Luật suy diễn
        </button>
      </li>
    </ul>

    <div class="d-flex mb-2">
      <button class="btn btn-success ms-auto" @click="openCreate">
        ➕ Thêm
      </button>
    </div>
    <div v-if="err" class="alert alert-danger">{{ err }}</div>

    <!-- Symptom table -->
    <div v-if="tab === 'sym'" class="card">
      <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 60px">#</th>
              <th>Tên</th>
              <th>Mã</th>
              <th class="text-end" style="width: 180px">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(s, i) in symptoms" :key="s.symptomId">
              <td>{{ i + 1 }}</td>
              <td>{{ s.name }}</td>
              <td>{{ s.code || "—" }}</td>
              <td class="text-end">
                <button
                  class="btn btn-outline-info btn-sm me-1"
                  @click="openEdit(s)"
                >
                  ✏️
                </button>
                <button
                  class="btn btn-outline-danger btn-sm"
                  @click="remove(s)"
                >
                  🗑
                </button>
              </td>
            </tr>
            <tr v-if="!symptoms.length">
              <td colspan="4" class="text-center py-4">Trống</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Disease table -->
    <div v-else-if="tab === 'dis'" class="card">
      <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 60px">#</th>
              <th>Tên</th>
              <th>ICD</th>
              <th class="text-end" style="width: 180px">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d, i) in diseases" :key="d.diseaseId">
              <td>{{ i + 1 }}</td>
              <td>{{ d.name }}</td>
              <td>{{ d.icd || "—" }}</td>
              <td class="text-end">
                <button
                  class="btn btn-outline-info btn-sm me-1"
                  @click="openEdit(d)"
                >
                  ✏️
                </button>
                <button
                  class="btn btn-outline-danger btn-sm"
                  @click="remove(d)"
                >
                  🗑
                </button>
              </td>
            </tr>
            <tr v-if="!diseases.length">
              <td colspan="4" class="text-center py-4">Trống</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Rule table -->
    <div v-else class="card">
      <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 60px">#</th>
              <th>Triệu chứng</th>
              <th>Bệnh</th>
              <th>Trọng số</th>
              <th>Mô tả</th>
              <th class="text-end" style="width: 180px">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in rules" :key="r.ruleId">
              <td>{{ i + 1 }}</td>
              <td>
                {{
                  symptoms.find((s) => s.symptomId === r.symptomId)?.name ||
                  r.symptomId
                }}
              </td>
              <td>
                {{
                  diseases.find((d) => d.diseaseId === r.diseaseId)?.name ||
                  r.diseaseId
                }}
              </td>
              <td>{{ r.weight }}</td>
              <td>{{ r.description || "—" }}</td>
              <td class="text-end">
                <button
                  class="btn btn-outline-info btn-sm me-1"
                  @click="openEdit(r)"
                >
                  ✏️
                </button>
                <button
                  class="btn btn-outline-danger btn-sm"
                  @click="remove(r)"
                >
                  🗑
                </button>
              </td>
            </tr>
            <tr v-if="!rules.length">
              <td colspan="6" class="text-center py-4">Trống</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="show" class="modal-backdrop">
      <div class="modal-card" style="max-width: 560px">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h5 class="m-0">
            {{ mode === "create" ? "Thêm " : "Sửa " }}
            {{
              tab === "sym" ? "triệu chứng" : tab === "dis" ? "bệnh" : "luật"
            }}
          </h5>
          <button class="btn btn-sm btn-light" @click="show = false">✖</button>
        </div>

        <template v-if="tab === 'sym'">
          <div class="mb-2">
            <label class="form-label">Tên</label
            ><input v-model="symForm.name" class="form-control" />
          </div>
          <div class="mb-2">
            <label class="form-label">Mã</label
            ><input v-model="symForm.code" class="form-control" />
          </div>
        </template>

        <template v-else-if="tab === 'dis'">
          <div class="mb-2">
            <label class="form-label">Tên</label
            ><input v-model="disForm.name" class="form-control" />
          </div>
          <div class="mb-2">
            <label class="form-label">ICD</label
            ><input v-model="disForm.icd" class="form-control" />
          </div>
        </template>

        <template v-else>
          <div class="row g-2">
            <div class="col-6">
              <label class="form-label">Triệu chứng</label>
              <select v-model.number="ruleForm.symptomId" class="form-select">
                <option
                  v-for="s in symptoms"
                  :key="s.symptomId"
                  :value="s.symptomId"
                >
                  {{ s.name }}
                </option>
              </select>
            </div>
            <div class="col-6">
              <label class="form-label">Bệnh</label>
              <select v-model.number="ruleForm.diseaseId" class="form-select">
                <option
                  v-for="d in diseases"
                  :key="d.diseaseId"
                  :value="d.diseaseId"
                >
                  {{ d.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-6">
              <label class="form-label">Trọng số</label>
              <input
                type="number"
                step="0.1"
                v-model.number="ruleForm.weight"
                class="form-control"
              />
            </div>
            <div class="col-6">
              <label class="form-label">Mô tả</label>
              <input v-model="ruleForm.description" class="form-control" />
            </div>
          </div>
        </template>

        <div class="d-flex justify-content-end mt-3">
          <button class="btn btn-secondary me-2" @click="show = false">
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
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
</style>
