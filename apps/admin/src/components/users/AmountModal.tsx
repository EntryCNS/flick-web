"use client";

import { useState } from "react";
import { User, School, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

interface UserType {
  id: number;
  name: string;
  grade?: number;
  room?: number;
  number?: number;
  role: UserRole;
  balance: number;
}

interface AmountModalProps {
  user: UserType;
  onClose: () => void;
}

const AMOUNT_PRESETS = [1000, 3000, 5000, 10000, 30000, 50000] as const;

export function AmountModal({ user, onClose }: AmountModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (amount: number) => {
      return await api.post(`/users/${user.id}/charge`, { amount });
    },
    onSuccess: () => {
      toast.success(
        `${user.name}님에게 ${amount.toLocaleString()}원이 충전되었습니다`
      );
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: () => {
      toast.error("충전에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const handleAmountSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (amount <= 0) {
      toast.error("충전 금액은 1원 이상이어야 합니다");
      return;
    }
    mutate(amount);
  };

  const handlePresetClick = (preset: number) => {
    setAmount((prev) => prev + preset);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value ? Number(value) : 0);
  };

  return (
    <div className="w-[480px] bg-white p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4990FF]/10">
            <span className="text-lg font-medium text-[#4990FF]">
              {user.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {user.role === "STUDENT" &&
                user.grade &&
                user.room &&
                user.number && (
                  <span>{`${user.grade}학년 ${user.room}반 ${user.number}번`}</span>
                )}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  user.role === "STUDENT"
                    ? "bg-[#4990FF]/10 text-[#4990FF]"
                    : user.role === "TEACHER"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-purple-50 text-purple-600"
                )}
              >
                {user.role === "STUDENT" ? (
                  <User className="h-3 w-3" />
                ) : user.role === "TEACHER" ? (
                  <User className="h-3 w-3" />
                ) : (
                  <School className="h-3 w-3" />
                )}
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="text-sm text-gray-600">현재 잔액</span>
            <p className="mt-1 text-2xl font-medium text-[#4990FF]">
              {user.balance.toLocaleString()}원
            </p>
          </div>

          <form onSubmit={handleAmountSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="text-sm font-medium text-gray-700"
              >
                충전 금액
              </label>
              <input
                id="amount"
                type="number"
                value={amount || ""}
                onChange={handleInputChange}
                className="w-full h-12 px-3 text-lg rounded-lg bg-white border border-gray-200 
                          focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF]"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">
                빠른 금액 선택
              </div>
              <div className="grid grid-cols-3 gap-2">
                {AMOUNT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={cn(
                      "h-10 rounded-lg text-sm font-medium transition-colors",
                      "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    +{preset.toLocaleString()}원
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending || amount <= 0}
                className={cn(
                  "flex min-w-[100px] items-center justify-center rounded-lg px-4 py-2",
                  "bg-[#4990FF] text-sm font-medium text-white",
                  "hover:bg-[#4990FF]/90 disabled:bg-gray-200 disabled:text-gray-500",
                  "transition-colors"
                )}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    처리 중
                  </span>
                ) : (
                  "충전하기"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
