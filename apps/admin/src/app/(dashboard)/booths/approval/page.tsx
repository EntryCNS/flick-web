"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Store } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

type LocalDateTime = string | number[];

interface BoothType {
  id: string;
  name: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  totalSales: number;
  createdAt: LocalDateTime;
  updatedAt: LocalDateTime;
}

const formatDateTime = (datetime: LocalDateTime) => {
  if (Array.isArray(datetime)) {
    const [year, month, day, hour, minute] = datetime;
    const date = new Date(+year, +month - 1, +day, +hour, +minute);
    return {
      date: format(date, 'MM.dd', { locale: ko }),
      time: format(date, 'HH:mm', { locale: ko })
    };
  }
  const date = new Date(datetime);
  return {
    date: format(date, 'MM.dd', { locale: ko }),
    time: format(date, 'HH:mm', { locale: ko })
  };
};

export default function BoothApprovalPage() {
  const queryClient = useQueryClient();

  const { data: pendingBooths, isLoading } = useQuery<BoothType[]>({
    queryKey: ["pendingBooths"],
    queryFn: async () => {
      const response = await api.get("/booths");
      return response.data.filter((booth: BoothType) => booth.status === "PENDING");
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/booths/${id}/approve`),
    onSuccess: () => {
      toast.success("부스가 승인되었습니다");
      queryClient.invalidateQueries({ queryKey: ["pendingBooths"] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/booths/${id}/reject`),
    onSuccess: () => {
      toast.success("부스가 거부되었습니다");
      queryClient.invalidateQueries({ queryKey: ["pendingBooths"] });
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-5 py-7">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-xl font-medium text-gray-900">부스 승인</h1>
          <div className="flex items-center h-7 px-2 bg-[#4990FF]/10 rounded">
            <span className="text-xs font-medium text-[#4990FF]">
              {pendingBooths?.length || 0}건 대기
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-[116px] bg-gray-100 rounded-lg" />
                </div>
              ))}
            </div>
          ) : !pendingBooths?.length ? (
            <div className="py-24 text-center text-gray-500">
              <Store className="w-8 h-8 mx-auto text-gray-400" />
              <p className="mt-4">승인 대기중인 부스가 없습니다</p>
            </div>
          ) : (
            pendingBooths.map((booth) => {
              const datetime = formatDateTime(booth.createdAt);
              return (
                <div
                  key={booth.id}
                  className="p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-500">#{booth.id}</span>
                          <h2 className="text-base font-medium text-gray-900 truncate">
                            {booth.name}
                          </h2>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {booth.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end text-sm">
                        <time className="text-gray-900">{datetime.date}</time>
                        <time className="text-xs text-gray-500 mt-0.5">{datetime.time}</time>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approveMutation.mutate(booth.id)}
                        disabled={approveMutation.isPending}
                        className="h-9 px-4 bg-[#4990FF] text-white text-sm font-medium rounded-lg hover:bg-[#4990FF]/90 disabled:bg-gray-100 disabled:text-gray-500 transition-colors flex items-center"
                      >
                        <CheckCircle className="mr-1.5 h-4 w-4" />
                        승인
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(booth.id)}
                        disabled={rejectMutation.isPending}
                        className="h-9 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors flex items-center"
                      >
                        <XCircle className="mr-1.5 h-4 w-4" />
                        거절
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}