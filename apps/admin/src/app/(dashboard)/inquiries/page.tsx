"use client";

import { useMemo, useState } from 'react';
import { Search, Filter, ChevronDown, MoreHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

type InquiryStatus = 'ACCOUNT' | 'PAYMENT' | 'SYSTEM' | 'OTHER';

interface InquiryType {
  id: number;
  category: InquiryStatus;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  content: InquiryType[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

interface StatusBadgeProps {
  category: InquiryStatus;
}

const StatusBadge = ({ category }: StatusBadgeProps) => {
  const config: Record<InquiryStatus, { className: string; label: string }> = {
    ACCOUNT: {
      className: 'bg-[#4990FF]/10 text-[#4990FF]',
      label: '계정'
    },
    PAYMENT: {
      className: 'bg-amber-50 text-amber-600',
      label: '결제'
    },
    SYSTEM: {
      className: 'bg-emerald-50 text-emerald-600',
      label: '시스템'
    },
    OTHER: {
      className: 'bg-gray-100 text-gray-600',
      label: '기타'
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium",
      config[category].className
    )}>
      {config[category].label}
    </span>
  );
};

const formatDate = (year: string, month: string, day: string) => {
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
};

const formatTime = (hour: string, minute: string, second: string) => {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
};

export default function AdminInquiryPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ["inquiries", currentPage],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse>(`/inquiries`);
      return data;
    }
  });

  const categories: InquiryStatus[] = ['ACCOUNT', 'PAYMENT', 'SYSTEM', 'OTHER'];

  const filteredInquiries = useMemo(() => {
    if (!data?.content) return [];

    return data.content.filter(inquiry => {
      const matchesCategory =
        selectedCategory === 'all' ||
        inquiry.category === selectedCategory;


      const mathcesSearch =
        !searchQuery.trim() ||
        inquiry.title?.toLowerCase().includes(searchQuery.toLowerCase().trim());
        
      return matchesCategory && mathcesSearch;
    })
  }, [data?.content, selectedCategory, searchQuery]);

  const handleRowClick = (id: number) => {
    router.push(`/inquiries/${id}`)
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">문의</h1>
          <p className="text-gray-500 mt-1">문의 내역을 확인하고 관리하세요</p>
        </div>
      </div>

      <div className="space-y-4">

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="제목으로 검색"
              className="w-full h-10 pl-10 pr-4 bg-white rounded-lg text-sm border border-gray-200
                        focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <div className="relative">
            <select
              className="h-10 pl-4 pr-10 bg-white border border-gray-200 rounded-lg text-sm appearance-none
                        focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">모든 카테고리</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">카테고리</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">제목</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">등록일</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">수정일</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      로딩 중...
                    </td>
                  </tr>
                ) : filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      문의 내역이 없습니다
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inquiry) => {
                    const createdDate = formatDate(inquiry.createdAt[0], inquiry.createdAt[1], inquiry.createdAt[2]);
                    const createdTime = formatTime(inquiry.createdAt[3], inquiry.createdAt[4], inquiry.createdAt[5]);
                    const updatedDate = formatDate(inquiry.updatedAt[0], inquiry.updatedAt[1], inquiry.updatedAt[2]);
                    const updatedTime = formatTime(inquiry.updatedAt[3], inquiry.updatedAt[4], inquiry.updatedAt[5]);
                    return (
                      <tr
                        key={inquiry.id}
                        onClick={() => handleRowClick(inquiry.id)}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            {inquiry.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge category={inquiry.category} />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{inquiry.title}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900">{createdDate}</span>
                            <span className="text-xs text-gray-500">{createdTime}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900">{updatedDate}</span>
                            <span className="text-xs text-gray-500">{updatedTime}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              총 <span className="font-medium text-gray-900">{data?.totalElements ?? 0}</span>개의 문의
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ArrowLeft size={16} />
              </button>
              {data?.totalPages && Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "inline-flex items-center justify-center h-8 min-w-[2rem] rounded-lg text-sm font-medium transition-colors",
                    currentPage === i + 1
                      ? "bg-[#4990FF] text-white"
                      : "text-gray-500 hover:bg-gray-50 border border-gray-200"
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(data?.totalPages ?? p, p + 1))}
                disabled={currentPage === data?.totalPages}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}