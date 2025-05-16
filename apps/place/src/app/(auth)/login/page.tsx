"use client";

import React, { useEffect, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { useTokenStore } from "@/stores/token";
import api from "@/lib/api";

const loginSchema = z.object({
  username: z.string().min(1, "아이디를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface ErrorResponse {
  code: string;
  message: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    setValue,
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
    mode: "onChange",
  });

  const usernameValue = watch("username");
  const passwordValue = watch("password");

  const isusernameValid = Boolean(usernameValue && usernameValue.length > 0);
  const isPasswordValid = Boolean(passwordValue && passwordValue.length > 0);

  useEffect(() => {
    useTokenStore.getState().clearToken();

    const registeredUsername = sessionStorage.getItem("registeredUsername");
    const savedUsername = localStorage.getItem("savedUsername");

    if (registeredUsername) {
      setValue("username", registeredUsername);
      setFocus("password");
    } else if (savedUsername) {
      setValue("username", savedUsername);
      setRememberMe(true);
      setFocus("password");
    } else {
      setFocus("username");
    }
  }, [setValue, setFocus]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.currentTarget.name === "username" && isusernameValid) {
        setFocus("password");
      } else if (e.currentTarget.name === "password") {
        handleSubmit(login)();
      }
    }
  };

  const login = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/login", data);

      if (response.data.accessToken) {
        if (rememberMe) {
          localStorage.setItem("savedUsername", data.username);
        } else {
          localStorage.removeItem("savedUsername");
        }

        useTokenStore.getState().setToken(response.data.accessToken);
        toast.success("로그인에 성공했습니다");
        router.push("/");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        const errorCode = axiosError.response?.data?.code;

        switch (errorCode) {
          case "BOOTH_NOT_FOUND":
            setError("username", {
              type: "manual",
              message: "존재하지 않는 아이디입니다",
            });
            setFocus("username");
            break;
          case "BOOTH_PASSWORD_NOT_MATCH":
            setError("password", {
              type: "manual",
              message: "비밀번호가 일치하지 않습니다",
            });
            setFocus("password");
            break;
          case "BOOTH_NOT_APPROVED":
            toast.error("아직 승인되지 않은 부스입니다");
            break;
          case "BOOTH_REJECTED":
            toast.error("거절된 부스입니다");
            break;
          case "BOOTH_INACTIVE":
            toast.error("금지된 부스입니다");
            break;
          default:
            toast.error("로그인에 실패했습니다");
            break;
        }
      } else {
        toast.error("로그인 중 오류가 발생했습니다");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white font-pretendard">
      <div className="w-[400px] px-3">
        <div className="flex items-center mb-4">
          <Image src="/logo.png" alt="Flick Place" width={36} height={36} />
          <span className="ml-2.5 text-lg font-extrabold text-[#212529]">
            flick place
          </span>
        </div>

        <h1 className="text-2xl font-bold text-[#333D4B] mb-5">부스 로그인</h1>

        <form onSubmit={handleSubmit(login)} className="mb-5">
          <div className="mb-4">
            <label className="block text-[15px] font-medium text-[#4E5968] mb-1">
              아이디
            </label>
            <input
              {...register("username")}
              placeholder="아이디를 입력하세요"
              className="w-full h-[48px] px-[18px] border border-[#DDE2E5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4990FF] focus:border-transparent"
              onKeyDown={handleKeyDown}
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-[15px] font-medium text-[#4E5968] mb-1">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="비밀번호를 입력하세요"
                className="w-full h-[48px] px-[18px] border border-[#DDE2E5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4990FF] focus:border-transparent"
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <Eye size={20} className="stroke-[1.5px]" />
                ) : (
                  <EyeOff size={20} className="stroke-[1.5px]" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center mb-4">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-[#4990FF] focus:ring-[#4990FF] border-gray-300 rounded"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-600"
            >
              아이디 저장
            </label>
          </div>

          <button
            type="submit"
            disabled={!isusernameValid || !isPasswordValid || isSubmitting}
            className="w-full h-[48px] bg-[#4990FF] text-white font-medium rounded-lg cursor-pointer disabled:bg-[#A5C9FF] disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>로그인 중...</span>
              </div>
            ) : (
              "로그인"
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-sm text-[#6B7280] cursor-pointer hover:text-[#4990FF] transition-colors"
          >
            부스 등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
