"use client";

import { useMemo, useState } from "react";
import { Loader2, Store, ChevronDown, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import api from "@/lib/api";

type LocalDateTime = string | number[];

interface BoothType {
  id: string;
  name: string;
  description: string;
  totalSales: number;
  createdAt: LocalDateTime;
  updatedAt: LocalDateTime;
}

type SortOption = {
  field: "id" | "totalSales" | "name";
  order: "asc" | "desc";
  label: string;
};

const sortOptions: SortOption[] = [
  { field: "id", order: "asc", label: "번호 오름차순" },
  { field: "id", order: "desc", label: "번호 내림차순" },
  { field: "totalSales", order: "desc", label: "매출 높은 순" },
  { field: "totalSales", order: "asc", label: "매출 낮은 순" },
  { field: "name", order: "asc", label: "이름 오름차순" },
  { field: "name", order: "desc", label: "이름 내림차순" },
];

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

const sortBooths = (booths: BoothType[], sortOption: SortOption): BoothType[] => {
  return [...booths].sort((a, b) => {
    if (sortOption.field === "id") {
      const idA = parseInt(a.id);
      const idB = parseInt(b.id);
      return sortOption.order === "asc" ? idA - idB : idB - idA;
    } else if (sortOption.field === "name") {
      return sortOption.order === "asc" 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else {
      return sortOption.order === "asc" ? a.totalSales - b.totalSales : b.totalSales - a.totalSales;
    }
  });
};

export default function BoothsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: booths, isLoading } = useQuery<BoothType[]>({
    queryKey: ["booths"],
    queryFn: async () => {
      const { data } = await api.get("/booths");
      return data;
    }
  });

  const filteredAndSortedBooths = useMemo(() => {
    if (!booths) return [];
    
    return sortBooths(
      booths.filter(booth => 
        !searchQuery.trim() || 
        booth.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        booth.description.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ),
      selectedSort
    );
  }, [booths, selectedSort, searchQuery]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-gray-900">부스 관리</h1>
            <div className="flex items-center h-7 px-2 bg-[#4990FF]/10 rounded">
              <span className="text-xs font-medium text-[#4990FF]">
                총 {booths?.length || 0}개 부스
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="부스명으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 h-9 pl-9 pr-4 rounded-lg text-sm bg-white border border-gray-200 
                          focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="h-9 px-3 pr-8 rounded-lg text-sm bg-white border border-gray-200 
                          focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF] 
                          font-medium text-gray-700"
              >
                {selectedSort.label}
              </button>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden z-10">
                  {sortOptions.map((option) => (
                    <button
                      key={`${option.field}-${option.order}`}
                      onClick={() => {
                        setSelectedSort(option);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors",
                        selectedSort === option ? "text-[#4990FF] font-medium" : "text-gray-700"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">번호</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">부스명</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500">총 매출</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500">등록일시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 w-12 bg-gray-100 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-40 bg-gray-100 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-gray-100 rounded ml-auto" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-gray-100 rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : !filteredAndSortedBooths.length ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-24 text-center text-gray-500">
                      <Store className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="mt-4">등록된 부스가 없습니다</p>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedBooths.map((booth) => {
                    const datetime = formatDateTime(booth.createdAt);
                    return (
                      <tr
                        key={booth.id}
                        onClick={() => router.push(`/booths/${booth.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">#{booth.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-[#4990FF]">
                              {booth.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {booth.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={cn(
                            "text-sm font-medium",
                            selectedSort.field === "totalSales" ? "text-[#4990FF]" : "text-gray-900"
                          )}>
                            {formatCurrency(booth.totalSales)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm text-gray-900">{datetime.date}</div>
                          <div className="text-xs text-gray-500">{datetime.time}</div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
