import axios from "axios";
import { useTokenStore } from "@/stores/token";
import { API_URL } from "@/constants/api";
import { toast } from "sonner";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useTokenStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
      useTokenStore.getState().clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
