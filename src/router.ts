import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "@/stores/auth";

const routes = [
  // Trang chủ
  {
    path: "/",
    name: "home",
    component: () => import("@/views/Home.vue"),
    meta: { requiresAuth: true, roles: ["ADMIN", "DOCTOR"] },
  },

  // Đăng nhập
  {
    path: "/dang-nhap",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
  },
  //dk
  {
    path: "/dang-ky-bac-si",
    name: "register-doctor",
    component: () => import("@/views/RegisterDoctor.vue"),
    meta: { requiresAuth: false },
  },

  // Quản lý bệnh nhân
  {
    path: "/benh-nhan",
    name: "benhnhan",
    component: () => import("@/views/BenhNhan.vue"),
    meta: { requiresAuth: true, roles: ["ADMIN", "DOCTOR"] },
  },
  {
    path: "/benh-nhan/:id",
    name: "benhnhan-detail",
    component: () => import("@/views/PatientDetail.vue"),
    meta: { requiresAuth: true, roles: ["ADMIN", "DOCTOR"] },
  },

  // Quản lý bác sĩ
  {
    path: "/bac-si",
    name: "bacsi",
    component: () => import("@/views/Doctor.vue"),
    meta: { requiresAuth: true, roles: ["ADMIN"] },
  },

  // Quản trị hệ thống
  {
    path: "/admin",
    name: "admin",
    component: () => import("@/views/Admin.vue"),
    meta: { requiresAuth: true, roles: ["ADMIN"] },
  },

  // Chuẩn đoán
  {
    path: "/chuan-doan",
    name: "chuan-doan",
    component: () => import("@/views/Chuandoan.vue"),
    meta: { requiresAuth: true, roles: ["ADMIN", "DOCTOR"] },
  },

  // Quản lý tri thức
  {
    path: "/kien-thuc",
    name: "kien-thuc",
    component: () => import("@/views/KienThuc.vue"),
    meta: { requiresAuth: true, roles: ["ADMIN", "DOCTOR"] },
  },

  // Thống kê
  {
    path: "/thong-ke",
    name: "thong-ke",
    component: () => import("@/views/ThongKe.vue"),
    meta: { requiresAuth: true, roles: ["ADMIN"] },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuth();

  // Nếu có token mà chưa có user thì fetch
  if (!auth.user && localStorage.getItem("token")) {
    await auth.fetchMe();
  }

  if ((to.meta as any)?.requiresAuth) {
    if (!auth.user) {
      return { name: "login", query: { redirect: to.fullPath } };
    }

    const allowed = (to.meta as any).roles as string[] | undefined;
    if (allowed?.length && !allowed.includes(auth.user.role)) {
      return { name: "home" }; // fallback về trang chủ
    }
  }
});

export default router;
