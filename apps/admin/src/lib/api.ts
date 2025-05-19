import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { useTokenStore } from "@/stores/token";
import { API_URL } from "@/constants/api";

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

interface QueueItem {
  resolve: (token?: string) => void;
  reject: (error: Error) => void;
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let requestQueue: QueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  requestQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  requestQueue = [];
};

const redirectToLogin = () => {
  useTokenStore.getState().clearTokens();
  window.location.href = "/login";
};

api.interceptors.request.use((config) => {
  const { accessToken } = useTokenStore.getState();

  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError): Promise<unknown> => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const { refreshToken } = useTokenStore.getState();

    if (!refreshToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        requestQueue.push({ resolve, reject });
      }).then((newToken) => {
        if (originalRequest.headers && typeof newToken === "string") {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<RefreshResponse>(
        `${API_URL}/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const { accessToken: newToken, refreshToken: newRefreshToken } = data;

      if (!newToken || !newRefreshToken) {
        throw new Error("서버가 유효한 토큰을 반환하지 않음");
      }

      useTokenStore.getState().setTokens(newToken, newRefreshToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      processQueue(null, newToken);

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;