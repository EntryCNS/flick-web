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
                총 {booths?.length || 0}개
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
                className="w-64 h-9 pl-9 pr-4 rounded-lg text-sm bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="h-9 px-3 pr-8 rounded-lg text-sm bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF] font-medium text-gray-700"
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

        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-[68px] bg-gray-100 rounded-lg" />
                </div>
              ))}
            </div>
          ) : !filteredAndSortedBooths.length ? (
            <div className="py-24 text-center text-gray-500">
              <Store className="w-8 h-8 mx-auto text-gray-400" />
              <p className="mt-4">등록된 부스가 없습니다</p>
            </div>
          ) : (
            filteredAndSortedBooths.map((booth) => {
              const datetime = formatDateTime(booth.createdAt);
              return (
                <div
                  key={booth.id}
                  onClick={() => router.push(`/booths/${booth.id}`)}
                  className="group h-[68px] p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between gap-4 h-full">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">#{booth.id}</span>
                        <h2 className="text-base font-medium text-gray-900 truncate group-hover:text-[#4990FF]">
                          {booth.name}
                        </h2>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                        {booth.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-sm font-medium",
                        selectedSort.field === "totalSales" ? "text-[#4990FF]" : "text-gray-900"
                      )}>
                        {formatCurrency(booth.totalSales)}
                      </span>
                      <time className="text-sm text-gray-400">
                        {datetime.date}
                      </time>
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