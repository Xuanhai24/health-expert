<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  getSymptomList,
  runDiagnosis,
  saveDiagnosis,
} from "@/services/diagnosis";
import { fetchPatients, type Patient } from "@/services/patients";

const availableSymptoms = ref<string[]>([]);
const selectedSymptoms = ref<string[]>([]);
const selectedAvailable = ref<string[]>([]);
const selectedChosen = ref<string[]>([]);
const diagnosisResults = ref<any[]>([]);

const patients = ref<Patient[]>([]);
const selectedPatient = ref<Patient | null>(null);

onMounted(async () => {
  try {
    availableSymptoms.value = ["Đang tải danh sách triệu chứng..."];
    availableSymptoms.value = await getSymptomList();
  } catch (err) {
    console.error(err);
  }

  try {
    const res = await fetchPatients({ page: 1, pageSize: 100 });
    patients.value = res.items;
  } catch (err) {
    console.error("Không tải được danh sách bệnh nhân", err);
  }
});

function addSymptoms() {
  selectedSymptoms.value.push(...selectedAvailable.value);
  availableSymptoms.value = availableSymptoms.value.filter(
    (s) => !selectedAvailable.value.includes(s)
  );
  selectedAvailable.value = [];
}

function removeSymptoms() {
  availableSymptoms.value.push(...selectedChosen.value);
  selectedSymptoms.value = selectedSymptoms.value.filter(
    (s) => !selectedChosen.value.includes(s)
  );
  selectedChosen.value = [];
}

async function diagnose() {
  try {
    diagnosisResults.value = await runDiagnosis(selectedSymptoms.value);
  } catch (err) {
    console.error(err);
  }
}

async function saveResults() {
  if (!selectedPatient.value) {
    alert("Vui lòng chọn bệnh nhân trước khi lưu!");
    return;
  }

  const payload = {
    patientId: selectedPatient.value.patientId,
    Symptoms: (document.getElementById("patientSymptoms") as HTMLInputElement)
      .value,
    Diseases: (document.getElementById("patientDiseases") as HTMLInputElement)
      .value,
    medicinesAdvice: (
      document.getElementById("medicinesAdvice") as HTMLInputElement
    ).value,
    doctorAdvice: (
      document.getElementById("doctorAdvice") as HTMLTextAreaElement
    ).value,
    diagnoseDate: (document.getElementById("diagnoseDate") as HTMLInputElement)
      .value,
    doctorName: "", // backend sẽ tự gán
  };

  try {
    const res = await saveDiagnosis(payload);
    if (res.status === 200 || res.status === 204) {
      alert("Kết quả đã được lưu thành công!");
    }
  } catch (error) {
    console.error("Error saving results:", error);
    alert("Đã xảy ra lỗi khi lưu kết quả.");
  }
}
</script>

<template>
  <div class="container py-4">
    <!-- Thông tin bệnh nhân -->
    <div class="card mb-4">
      <div class="card-header fw-bold">Thông tin bệnh nhân</div>
      <div class="card-body">
        <div class="mb-3">
          <label for="patientSelect" class="form-label">Chọn bệnh nhân</label>
          <select
            id="patientSelect"
            class="form-select"
            v-model="selectedPatient"
          >
            <option disabled value="">-- Chọn bệnh nhân --</option>
            <option v-for="p in patients" :key="p.patientId" :value="p">
              {{ p.patientId }} - {{ p.fullName }} - {{ p.gender }}
            </option>
          </select>
        </div>
        <div v-if="selectedPatient" class="alert alert-secondary">
          <p><b>Họ tên:</b> {{ selectedPatient.fullName }}</p>
          <p><b>Giới tính:</b> {{ selectedPatient.gender }}</p>
          <p><b>Ngày sinh:</b> {{ selectedPatient.dob }}</p>
        </div>
      </div>
    </div>

    <!-- Chọn triệu chứng -->
    <div class="card mb-4">
      <div class="card-header fw-bold">Chọn triệu chứng</div>
      <div class="card-body row">
        <div class="col-md-5">
          <label class="form-label">Danh sách triệu chứng</label>
          <select
            class="form-select"
            size="10"
            multiple
            v-model="selectedAvailable"
          >
            <option v-for="s in availableSymptoms" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </div>
        <div
          class="col-md-2 d-flex flex-column justify-content-center align-items-center gap-2"
        >
          <button
            class="btn btn-outline-primary"
            type="button"
            @click="addSymptoms"
          >
            &gt;&gt;
          </button>
          <button
            class="btn btn-outline-danger"
            type="button"
            @click="removeSymptoms"
          >
            &lt;&lt;
          </button>
        </div>
        <div class="col-md-5">
          <label class="form-label">Triệu chứng đã chọn</label>
          <select
            class="form-select"
            size="10"
            multiple
            v-model="selectedChosen"
          >
            <option v-for="s in selectedSymptoms" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="mb-4 text-end">
      <button class="btn btn-success me-2" type="button" @click="diagnose">
        Chuẩn đoán
      </button>
      <button class="btn btn-primary" type="button" @click="saveResults">
        Lưu kết quả
      </button>
    </div>

    <!-- Kết quả -->
    <div class="row">
      <div class="col-lg-7 mb-4">
        <div class="card h-100">
          <div class="card-header fw-bold">Kết quả chẩn đoán đề nghị</div>
          <div class="card-body p-0">
            <table class="table table-striped mb-0">
              <thead class="table-light">
                <tr>
                  <th>Tên bệnh</th>
                  <th>Xác suất</th>
                  <th>Triệu chứng khớp</th>
                  <th>Triệu chứng không khớp</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in diagnosisResults" :key="item.name">
                  <td>{{ item.name }}</td>
                  <td>{{ (item.score * 100).toFixed(2) }}%</td>
                  <td>{{ item.matchedSymptoms.join(", ") }}</td>
                  <td>{{ item.unmatchedSymptoms.join(", ") }}</td>
                </tr>
                <tr v-if="!diagnosisResults.length">
                  <td colspan="4" class="text-center py-3">Chưa có kết quả</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-lg-5 mb-4">
        <div class="card h-100">
          <div class="card-header fw-bold">Kết luận</div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Bệnh nhân có triệu chứng</label>
              <input type="text" id="patientSymptoms" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Bệnh nhân bị mắc bệnh</label>
              <input type="text" id="patientDiseases" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Thuốc điều trị đề xuất</label>
              <input type="text" id="medicinesAdvice" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Chú thích</label>
              <textarea id="doctorAdvice" class="form-control"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Ngày chuẩn đoán</label>
              <input type="date" id="diagnoseDate" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Người thực hiện chuẩn đoán</label>
              <input
                type="text"
                id="doctorName"
                class="form-control"
                disabled
                value="(lấy từ tài khoản bác sĩ)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
