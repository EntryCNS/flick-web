"use client";

import React, { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { API_URL } from "@/constants/api";

const boothSchema = z.object({
  name: z.string().min(1, "부스 이름을 입력해주세요"),
  description: z.string().optional(),
  username: z.string().min(1, "아이디를 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

type BoothFormData = z.infer<typeof boothSchema>;

interface ErrorResponse {
  code: string;
  message: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"info" | "username" | "password">("info");
  const [isCheckingId, setIsCheckingId] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    trigger,
    setFocus,
  } = useForm<BoothFormData>({
    resolver: zodResolver(boothSchema),
    defaultValues: {
      name: "",
      description: "",
      username: "",
      password: "",
    },
    mode: "onChange",
  });

  const nameValue = watch("name");
  const usernameValue = watch("username");
  const passwordValue = watch("password");

  const isNameValid = Boolean(nameValue);
  const isUsernameValid = Boolean(usernameValue && usernameValue.length > 0);
  const isPasswordValid = Boolean(passwordValue && passwordValue.length >= 6);

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (step === "info" && isNameValid) {
        goToNextStep();
      } else if (step === "username" && isUsernameValid && !isCheckingId) {
        goToNextStep();
      } else if (step === "password" && isPasswordValid && !isSubmitting) {
        handleSubmit(registerBooth)();
      }
    }
  };

  const goToNextStep = async () => {
    if (step === "info") {
      const isInfoValid = await trigger("name");
      if (isInfoValid) {
        setStep("username");
        setTimeout(() => setFocus("username"), 0);
      }
    } else if (step === "username") {
      const isUsernameValid = await trigger("username");
      if (isUsernameValid) {
        const isAvailable = await checkUsername();
        if (isAvailable) {
          setStep("password");
          setTimeout(() => setFocus("password"), 0);
        }
      }
    }
  };

  const goToPrevStep = () => {
    if (step === "username") {
      setStep("info");
      setTimeout(() => setFocus("name"), 0);
    } else if (step === "password") {
      setStep("username");
      setTimeout(() => setFocus("username"), 0);
    }
  };

  const checkUsername = async () => {
    if (!usernameValue) return false;

    setIsCheckingId(true);
    try {
      const response = await axios.get(`${API_URL}/booths/check`, {
        params: { username: usernameValue },
      });

      if (response.data.exists) {
        setError("username", {
          type: "manual",
          message: "이미 사용중인 아이디입니다",
        });
        return false;
      }
      return true;
    } catch {
      toast.error("아이디 확인에 실패했습니다");
      return false;
    } finally {
      setIsCheckingId(false);
    }
  };

  const registerBooth = async (data: BoothFormData) => {
    try {
      await axios.post(`${API_URL}/auth/register`, data);
      toast.success("부스가 성공적으로 등록되었습니다");

      sessionStorage.setItem("registeredUsername", data.username);

      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        const errorCode = axiosError.response?.data?.code;

        if (errorCode === "LOGIN_ID_ALREADY_EXISTS") {
          setError("username", {
            type: "manual",
            message: "이미 사용중인 아이디입니다",
          });
          setStep("username");
          setTimeout(() => setFocus("username"), 0);
        } else {
          toast.error("부스 등록에 실패했습니다");
        }
      } else {
        toast.error("부스 등록에 실패했습니다");
      }
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

        <h1 className="text-2xl font-bold text-[#333D4B] mb-5">부스 등록</h1>

        {step === "info" && (
          <div>
            <div className="mb-4">
              <label className="block text-[15px] font-medium text-[#4E5968] mb-1">
                부스 이름
              </label>
              <input
                {...register("name")}
                placeholder="부스 이름을 입력하세요"
                className="w-full h-[48px] px-[18px] border border-[#DDE2E5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4990FF] focus:border-transparent"
                onKeyDown={handleKeyDown}
                autoFocus
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-[15px] font-medium text-[#4E5968] mb-1">
                부스 설명
              </label>
              <p className="text-xs text-[#6B7280] mb-1">선택사항입니다</p>
              <textarea
                {...register("description")}
                placeholder="부스 설명을 입력하세요"
                className="w-full h-[100px] px-[18px] py-[12px] border border-[#DDE2E5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4990FF] focus:border-transparent resize-none"
                onKeyDown={handleKeyDown}
              />
            </div>

            <button
              type="button"
              onClick={goToNextStep}
              disabled={!isNameValid}
              className="w-full h-[48px] bg-[#4990FF] text-white font-medium rounded-lg mb-5 cursor-pointer disabled:bg-[#A5C9FF] disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}

        {step === "username" && (
          <div>
            <div className="mb-4">
              <label className="block text-[15px] font-medium text-[#4E5968] mb-1">
                아이디
              </label>
              <input
                {...register("username")}
                placeholder="사용할 아이디를 입력하세요"
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

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={goToPrevStep}
                className="w-[180px] h-[48px] border border-[#DDE2E5] text-[#4E5968] font-medium rounded-lg mb-5 cursor-pointer"
              >
                이전
              </button>

              <button
                type="button"
                onClick={goToNextStep}
                disabled={!isUsernameValid || isCheckingId}
                className="w-[180px] h-[48px] bg-[#4990FF] text-white font-medium rounded-lg mb-5 cursor-pointer disabled:bg-[#A5C9FF] disabled:cursor-not-allowed"
              >
                {isCheckingId ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>확인 중...</span>
                  </div>
                ) : (
                  "다음"
                )}
              </button>
            </div>
          </div>
        )}

        {step === "password" && (
          <div>
            <div className="mb-4">
              <label className="block text-[15px] font-medium text-[#4E5968] mb-1">
                비밀번호
              </label>
              <p className="text-xs text-[#6B7280] mb-1">
                최소 6자 이상 입력해주세요
              </p>
              <input
                type="password"
                {...register("password")}
                placeholder="비밀번호를 입력하세요"
                className="w-full h-[48px] px-[18px] border border-[#DDE2E5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4990FF] focus:border-transparent"
                onKeyDown={handleKeyDown}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={goToPrevStep}
                className="w-[180px] h-[48px] border border-[#DDE2E5] text-[#4E5968] font-medium rounded-lg mb-5 cursor-pointer"
              >
                이전
              </button>

              <button
                type="button"
                onClick={handleSubmit(registerBooth)}
                disabled={!isPasswordValid || isSubmitting}
                className="w-[180px] h-[48px] bg-[#4990FF] text-white font-medium rounded-lg mb-5 cursor-pointer disabled:bg-[#A5C9FF] disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>등록 중...</span>
                  </div>
                ) : (
                  "등록하기"
                )}
              </button>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm text-[#4990FF] cursor-pointer hover:text-[#3a7fd6] transition-colors"
          >
            이미 부스가 있으신가요? 로그인하기
          </button>
        </div>
      </div>
    </div>
  );
}
