"use client";

import { Loader2, Store, ArrowUp, ArrowDown } from "lucide-react";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

interface BoothType {
  id: string;
  name: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  totalSales: number;
  createdAt: string;
  updatedAt: string[];
}

type SortField = "id" | "totalSales";
type SortOrder = "asc" | "desc";

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

const sortBooths = (booths: BoothType[], { field, order }: SortConfig): BoothType[] => {
  return [...booths].sort((a, b) => {
    if (field === "id") {
      const idA = parseInt(a.id);
      const idB = parseInt(b.id);
      return order === "asc" ? idA - idB : idB - idA;
    } else {
      return order === "asc" ? a.totalSales - b.totalSales : b.totalSales - a.totalSales;
    }
  });
};

export default function BoothsPage() {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "id",
    order: "asc"
  });

  const { data: booths, isLoading } = useQuery<BoothType[]>({
    queryKey: ["booths"],
    queryFn: async () => {
      const { data } = await api.get("/booths");
      return data;
    }
  });

  const handleSortClick = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc"
    }));
  };

  const sortedBooths = useMemo(() => {
    if (!booths) return [];
    return sortBooths(booths, sortConfig);
  }, [booths, sortConfig]);

  const formatDate = (year: string, month: string, day: string) => {
    return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  };

  const formatTime = (hour: string, minute: string, second: string) => {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  const renderSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.order === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">부스 목록</h1>
          <p className="text-gray-500 mt-1">
            현재 운영중인 부스의 목록을 확인할 수 있습니다
          </p>
        </div>
        <div className="flex items-center h-8 px-3 bg-[#4990FF]/10 rounded-lg">
          <span className="text-sm font-medium text-[#4990FF]">
            총 {booths?.length || 0}개 부스
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
                  <button
                    onClick={() => handleSortClick("id")}
                    className="inline-flex items-center gap-1 hover:text-[#4990FF] transition-colors"
                  >
                    ID
                    {renderSortIcon("id")}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
                  부스 이름
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
                  <button
                    onClick={() => handleSortClick("totalSales")}
                    className="inline-flex items-center gap-1 hover:text-[#4990FF] transition-colors"
                  >
                    총 매출
                    {renderSortIcon("totalSales")}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
                  수정일
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Loader2 size={36} className="mx-auto text-gray-400 animate-spin" />
                  </td>
                </tr>
              ) : !sortedBooths.length ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Store className="h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-sm font-medium text-gray-900">등록된 부스 없음</h3>
                      <p className="mt-1 text-sm text-gray-500">아직 등록된 부스가 없습니다</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedBooths.map((booth) => (
                  <tr 
                    key={booth.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {booth.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {booth.name}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {booth.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-sm font-medium",
                        sortConfig.field === "totalSales" ? "text-[#4990FF]" : "text-gray-900"
                      )}>
                        {formatCurrency(booth.totalSales)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">
                          {formatDate(booth.updatedAt[0], booth.updatedAt[1], booth.updatedAt[2])}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {formatTime(booth.updatedAt[3], booth.updatedAt[4], booth.updatedAt[5])}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}