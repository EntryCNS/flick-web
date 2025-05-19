import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { useTokenStore } from "@/stores/token";
import { API_URL } from "@/constants/api";

interface RefreshResponse {
  token: string;
  refreshToken: string;
}

interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: Error) => void;
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing: boolean = false;

let failedQueue: QueueItem[] = [];

const processQueue = (
  error: Error | null,
  token: string | null = null
): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const redirectToLogin = () => {
  useTokenStore.getState().clearTokens();
  window.location.href = "/login";
};

api.interceptors.request.use((config) => {
  const { token } = useTokenStore.getState();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<unknown> => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const { token, refreshToken } = useTokenStore.getState();

      if (!refreshToken) {
        redirectToLogin();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && typeof token === "string") {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("토큰 리프레시 시도:", {
          hasToken: !!token,
          hasRefreshToken: !!refreshToken,
        });

        const response = await axios.post<RefreshResponse>(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const { token: newToken, refreshToken: newRefreshToken } =
          response.data;

        if (!newToken || !newRefreshToken) {
          console.error("서버가 유효한 토큰을 반환하지 않음");
          redirectToLogin();
          return Promise.reject(new Error("Invalid token response"));
        }

        console.log("토큰 리프레시 성공:", {
          hasNewToken: !!newToken,
          hasNewRefreshToken: !!newRefreshToken,
        });

        useTokenStore.getState().setTokens(newToken, newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        processQueue(null, newToken);

        return axios(originalRequest);
      } catch (refreshError) {
        console.error("토큰 리프레시 실패:", refreshError);

        processQueue(refreshError as Error);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
