<!--Sua lai giao dien chuẩn đoán bệnh
  Thêm chức năng tìm kiếm
-->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  getSymptomList,
  runDiagnosis,
  saveDiagnosis,
} from "@/services/diagnosis";
import {type Patient, searchByPatientId } from "@/services/patients";
import axios, { AxiosError } from "axios";

const availableSymptoms = ref<string[]>([]);
const selectedSymptoms = ref<string[]>([]);
const selectedAvailable = ref<string[]>([]);
const selectedChosen = ref<string[]>([]);
const diagnosisResults = ref<any[]>([]);

const patients = ref<Patient[]>([]);
const patientsHaveId = ref<Patient[]>([]);
const selectedPatient = ref<Patient | null>(null);

const searchInputErrorMessage = ref<string>("");
const selectedSymptomListErrorMessage = ref<string>("");

const patientIdReadOnlyInputErrorMessage = ref<string>("");
const symptomsInputErrorMessage = ref<string>("");
const diseasesInputErrorMessage = ref<string>("");
const medicinesInputErrorMessage = ref<string>("");
const diagnoseDateInputErrorMessage = ref<string>("");
const today = ref(new Date().toISOString().split('T')[0]);

onMounted(async () => {
    availableSymptoms.value = ["Đang tải danh sách triệu chứng..."];
    
    try{
      availableSymptoms.value = await getSymptomList();
    } catch (error) {
      if(axios.isAxiosError(error)) {
        availableSymptoms.value = [error.message];
      }
    }

    if(availableSymptoms.value.length === 0) {
      availableSymptoms.value = ["Không tìm thấy danh sách triệu chứng."];
    }
});

async function handleSearchByPatientId(event: Event) {
  searchInputErrorMessage.value = "";
  patientsHaveId.value = [];
  const form = event.target as HTMLFormElement;
  const input = form.querySelector('input[type="search"]') as HTMLInputElement;
  
  const id = parseInt(input.value);
  try{
    patientsHaveId.value = await searchByPatientId(id);
  } catch (error) {
    if(axios.isAxiosError(error)) {
      searchInputErrorMessage.value = error.message;
      console.log('Error message: ', error);
    }
  } 
  form.reset();
}

function handleSelect(p : Patient) {
  selectedPatient.value = p;
  patientsHaveId.value = [];
  (document.getElementById("patientId") as HTMLInputElement).value = p.patientId.toString();
  (document.getElementById("fullName") as HTMLInputElement).value = p.fullName;
  (document.getElementById("dob") as HTMLInputElement).value = p.dob;
  (document.getElementById("gender") as HTMLInputElement).value = p.gender;
}

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
    if(axios.isAxiosError(err)) {
      selectedSymptomListErrorMessage.value = err.message; 
    }
}
}


async function saveResults() {
  const payload = {
    patientId: Number(selectedPatient.value?.patientId),
    Symptoms: (document.querySelector<HTMLInputElement>("#patientSymptoms")?.value || "").trim(),
    Diseases: (document.querySelector<HTMLInputElement>("#patientDiseases")?.value || "").trim(),
    medicinesAdvice: (document.querySelector<HTMLInputElement>("#medicinesAdvice")?.value || "").trim(),
    doctorAdvice: (document.querySelector<HTMLTextAreaElement>("#doctorAdvice")?.value || "").trim(),
    diagnoseDate: (() => {
      const val = document.querySelector<HTMLInputElement>("#diagnoseDate")?.value;
      return val ? new Date(val).toISOString() : new Date().toISOString(); // fallback = now
    })(),
    doctorName: "",
  };

  try {
    if(confirm("Xác nhận lưu kết quả chẩn đoán?") === false) {
      return;
    }
    const res = await saveDiagnosis(payload);
    alert("Lưu kết quả chẩn đoán thành công!");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errors = error.message as unknown as Record<string, string[]>;
      diseasesInputErrorMessage.value = errors.Diseases[0];
      symptomsInputErrorMessage.value = errors.Symptoms[0];
      medicinesInputErrorMessage.value = errors.MedicinesAdvice[0];
    }
  }
}

</script>

<template>
  <div class="container py-4">
    <!-- Thông tin bệnh nhân -->
  <!-- Thông tin bệnh nhân -->
<div class="mb-4">
  <div class="card mb-4">
    <!-- Header -->
    <div class="card-header d-flex justify-content-between align-items-center">
      <p class="fw-bold mb-0">Thông tin bệnh nhân</p>
      <form class=" mb-0 position-relative" @submit.prevent="handleSearchByPatientId">
        <div class="d-flex"> 
          <input
            type="search"
            class="form-control form-control-sm me-2 w-auto"
            placeholder="Nhập Mã BN"
          />
          <input type="submit" class="btn btn-sm btn-primary" value="Tìm kiếm nhanh" />
        </div>
        <br>
        <span class="text-danger" v-if="searchInputErrorMessage">{{ searchInputErrorMessage }}</span>
         <ul
          v-if="patientsHaveId.length > 0"
          class="list-group position-absolute w-100 mt-1 shadow"
          style="z-index: 1000; top: 30px; left: 0; max-height: 200px; overflow-y: auto;">
          <!-- <li
              v-if="patientsHaveId.length === 0" class="list-group-item list-group-item-action cursor-pointer"
          >
              Không tìm thấy bệnh nhân nào.
            </li> -->
          <li
              v-for="p in patientsHaveId"
              :key="p.patientId"
              class="list-group-item list-group-item-action cursor-pointer"
              @click="handleSelect(p)"
            >
              {{ p.patientId }} - {{ p.fullName }} - {{ p.dob }} - {{ p.gender }}
            </li>
        </ul>
      </form>
    </div>

    <!-- Body -->
    <div class="card-body">
      <div class="row">
        <!-- Cột trái -->
        <div class="col-md-6">
          <div class="mb-3">
            <label for="patientId" class="form-label">Mã BN</label>
            <input id="patientId" type="text" class="form-control" readonly />
            <span class="text-danger" v-if="patientIdReadOnlyInputErrorMessage">{{ patientIdReadOnlyInputErrorMessage }}</span>
          </div>
          <div class="mb-3">
            <label for="fullName" class="form-label">Họ và tên</label>
            <input id="fullName" type="text" class="form-control" readonly />
          </div>
        </div>

        <!-- Cột phải -->
        <div class="col-md-6">
          <div class="mb-3">
            <label for="gender" class="form-label">Giới tính</label>
            <input id="gender" type="text" class="form-control" readonly />
          </div>
          <div class="mb-3">
            <label for="dob" class="form-label">Ngày sinh</label>
            <input id="dob" type="text" class="form-control" readonly />
          </div>
        </div>
      </div>
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
          <span v-if="selectedSymptomListErrorMessage" class="text-danger">{{ selectedSymptomListErrorMessage }}</span>
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
              <span v-if="symptomsInputErrorMessage" class="text-danger">{{ symptomsInputErrorMessage }}</span>
            </div>
            <div class="mb-3">
              <label class="form-label">Bệnh nhân bị mắc bệnh</label>
              <input type="text" id="patientDiseases" class="form-control" />
              <span v-if="diseasesInputErrorMessage" class="text-danger">{{ diseasesInputErrorMessage }}</span>
            </div>
            <div class="mb-3">
              <label class="form-label">Thuốc điều trị đề xuất</label>
              <input type="text" id="medicinesAdvice" class="form-control" />
              <span v-if="medicinesInputErrorMessage" class="text-danger">{{ medicinesInputErrorMessage }}</span>
            </div>
            <div class="mb-3">
              <label class="form-label">Chú thích</label>
              <textarea id="doctorAdvice" class="form-control"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Ngày chuẩn đoán</label>
              <input type="date" id="diagnoseDate" class="form-control" v-if="today" :value="today"/>
              <span v-if="diagnoseDateInputErrorMessage" class="text-danger">{{ diagnoseDateInputErrorMessage }}</span>
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