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

// 로그인 페이지로 리다이렉트하는 함수
const redirectToLogin = () => {
  useTokenStore.getState().clearTokens();
  window.location.href = "/login";
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
      // 현재 토큰 상태 확인
      const { token, refreshToken } = useTokenStore.getState();
      
      // 리프레시 토큰이 없으면 즉시 로그인 페이지로 리다이렉트
      if (!refreshToken) {
        redirectToLogin();
        return Promise.reject(error);
      }
      
      // 이미 리프레시 중이면 큐에 요청 추가
      if (isRefreshing) {
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

      try {
        console.log("토큰 리프레시 시도:", { hasToken: !!token, hasRefreshToken: !!refreshToken });
        
        // 리프레시 토큰으로 새 액세스 토큰 요청
        const response = await axios.post<RefreshResponse>(
          `${API_URL}/auth/refresh`, 
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );
        
        const { token: newToken, refreshToken: newRefreshToken } = response.data;
        
        // 서버에서 유효한 토큰을 반환했는지 확인
        if (!newToken || !newRefreshToken) {
          console.error("서버가 유효한 토큰을 반환하지 않음");
          redirectToLogin();
          return Promise.reject(new Error("Invalid token response"));
        }
        
        console.log("토큰 리프레시 성공:", { hasNewToken: !!newToken, hasNewRefreshToken: !!newRefreshToken });
        
        // 새 토큰 저장
        useTokenStore.getState().setTokens(newToken, newRefreshToken);
        
        // 인증 헤더 업데이트
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        
        // 대기 중인 요청 처리
        processQueue(null, newToken);
        
        // 원래 요청 재시도
        return axios(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패 로그
        console.error("토큰 리프레시 실패:", refreshError);
        
        // 리프레시 실패 시 로그아웃 및 로그인 페이지로 리다이렉트
        processQueue(refreshError as Error);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // 다른 종류의 에러는 그대로 반환
    return Promise.reject(error);
  }
);

export default api;