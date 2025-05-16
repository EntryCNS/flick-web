import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { useTokenStore } from "@/stores/token";
import { API_URL } from "@/constants/api";

// 리프레시 응답 타입 정의
interface RefreshResponse {
  token: string;
  refreshToken: string;
}

// 요청 큐를 위한 인터페이스
interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 토큰 리프레시 중인지 확인하는 변수
let isRefreshing: boolean = false;
// 리프레시 중 대기 중인 요청들
let failedQueue: QueueItem[] = [];

// 요청 실패 큐를 처리하는 함수
const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// 요청 인터셉터 설정
api.interceptors.request.use((config) => {
  const { token } = useTokenStore.getState();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 응답 인터셉터 설정
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<unknown> => {
    // 원래 요청 설정 (타입 단언 사용)
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 리프레시 중이면 큐에 요청 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && typeof token === 'string') {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axios(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      // 리프레시 시작
      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken } = useTokenStore.getState();
      
      // 리프레시 토큰이 없으면 로그인 페이지로 리다이렉트
      if (!refreshToken) {
        useTokenStore.getState().clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // 리프레시 토큰으로 새 액세스 토큰 요청
        const response = await axios.post<RefreshResponse>(`${API_URL}/auth/refresh`, {
          refreshToken
        });
        
        const { token: newToken, refreshToken: newRefreshToken } = response.data;
        
        // 새 토큰 저장
        useTokenStore.getState().setTokens(newToken, newRefreshToken);
        
        // 인증 헤더 업데이트
        if (api.defaults.headers.common) {
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        }
        
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }
        
        // 대기 중인 요청 처리
        processQueue(null, newToken);
        
        // 원래 요청 재시도
        return axios(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패 시 로그아웃
        processQueue(refreshError as Error);
        useTokenStore.getState().clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;