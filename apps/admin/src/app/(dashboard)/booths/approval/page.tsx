"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Store, Calendar } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BoothType {
  id: string;
  name: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  totalSales: number;
  createdAt: string; // ISO 날짜 문자열
  updatedAt: string;
}

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

  const formatDate = (year: string, month: string, day: string) => {
    return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  };

  const formatTime = (hour: string, minute: string, second: string) => {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">부스 승인 요청</h1>
          <p className="mt-1 text-gray-500">새로운 부스 요청을 확인하고 승인하세요</p>
        </div>
        <div className="flex items-center h-8 px-3 bg-[#4990FF]/10 rounded-lg">
          <span className="text-sm font-medium text-[#4990FF]">
            {pendingBooths?.length || 0}건 대기중
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-gray-50 rounded-lg h-[200px] animate-pulse" />
          ))}
        </div>
      ) : !pendingBooths?.length ? (
        <div className="bg-gray-50 rounded-lg py-16">
          <div className="text-center">
            <Store className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">승인 대기중인 부스 없음</h3>
            <p className="mt-1 text-sm text-gray-500">현재 승인 대기중인 부스가 없습니다</p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {pendingBooths.map(booth => (
            <div 
              key={booth.id} 
              className="group bg-white border-1 rounded-lg overflow-hidden transition-all hover:bg-gray-50"
            >
              <div className="p-6 space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {booth.name}
                    </h3>
                    <div className="flex flex-col items-end text-sm text-gray-500 flex-shrink-0">
                      <div className="flex items-center">
                        <Calendar className="mr-1.5 h-4 w-4" />
                        {formatDate(booth.createdAt[0], booth.createdAt[1], booth.createdAt[2])}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatTime(booth.createdAt[3], booth.createdAt[4], booth.createdAt[5])}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {booth.description}
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <button
                    onClick={() => approveMutation.mutate(booth.id)}
                    disabled={approveMutation.isPending}
                    className={cn(
                      "flex items-center justify-center h-10 px-4 rounded-lg text-sm font-medium transition-colors",
                      "bg-[#4990FF] text-white hover:bg-[#4990FF]/90",
                      "disabled:bg-gray-100 disabled:text-gray-500"
                    )}
                  >
                    <CheckCircle className="mr-1.5 h-4 w-4" />
                    승인
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate(booth.id)}
                    disabled={rejectMutation.isPending}
                    className={cn(
                      "flex items-center justify-center h-10 px-4 rounded-lg text-sm font-medium transition-colors",
                      "bg-gray-50 text-gray-700 hover:bg-gray-100",
                      "disabled:bg-gray-50 disabled:text-gray-400"
                    )}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    거절
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}