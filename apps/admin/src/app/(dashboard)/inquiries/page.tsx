"use client";

import { useMemo, useState } from 'react';
import { Search, ChevronDown, ArrowLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

type InquiryStatus = 'ACCOUNT' | 'PAYMENT' | 'SYSTEM' | 'OTHER';

interface InquiryType {
  id: number;
  category: InquiryStatus;
  title: string;
  createdAt: string | number[];
  updatedAt: string | number[];
}

interface PaginatedResponse {
  content: InquiryType[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

const categoryConfig = {
  ACCOUNT: { className: 'bg-[#4990FF]/10 text-[#4990FF]', label: '계정' },
  PAYMENT: { className: 'bg-amber-50 text-amber-600', label: '결제' },
  SYSTEM: { className: 'bg-emerald-50 text-emerald-600', label: '시스템' },
  OTHER: { className: 'bg-gray-100 text-gray-600', label: '기타' }
} as const;

const StatusBadge = ({ category }: { category: InquiryStatus }) => (
  <span className={cn("px-2 py-1 rounded text-xs font-medium", categoryConfig[category].className)}>
    {categoryConfig[category].label}
  </span>
);

const formatDate = (dateTime: string | number[]) => {
  if (Array.isArray(dateTime)) {
    const [year, month, day] = dateTime;
    return format(new Date(+year, +month - 1, +day), 'MM.dd', { locale: ko });
  }
  return format(new Date(dateTime), 'MM.dd', { locale: ko });
};

export default function InquiriesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const { data, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ["inquiries", currentPage],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse>(`/inquiries?page=${currentPage}&limit=${itemsPerPage}`);
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });

  const filteredInquiries = useMemo(() => {
    if (!data?.content) return [];

    return data.content.filter(inquiry => {
      const matchesCategory = selectedCategory === 'all' || inquiry.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || 
        inquiry.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [data?.content, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-medium text-gray-900">문의 관리</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="제목으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 h-9 pl-9 pr-4 rounded-lg text-sm bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-lg text-sm bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF] appearance-none"
              >
                <option value="all">전체</option>
                {Object.entries(categoryConfig).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="py-24 text-center text-gray-500">
            문의 내역이 없습니다
          </div>
        ) : (
          <div className="space-y-2">
            {filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                onClick={() => router.push(`/inquiries/${inquiry.id}`)}
                className="group p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge category={inquiry.category} />
                      <h2 className="text-base font-medium text-gray-900 truncate group-hover:text-[#4990FF]">
                        {inquiry.title}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600">
                      #{inquiry.id}
                    </p>
                  </div>
                  <time className="text-sm text-gray-400">
                    {formatDate(inquiry.createdAt)}
                  </time>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && data && !data.empty && (
          <div className="mt-8 flex items-center justify-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={data.first}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-40 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            
            {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "w-8 h-8 text-sm rounded-full transition-colors",
                  currentPage === i + 1
                    ? "bg-[#4990FF] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(data.totalPages, prev + 1))}
              disabled={data.last}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-40 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}