"use client";

import { useState } from 'react';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface NoticeType {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  author: {
    name: string;
  };
  createdAt: string;
}

interface NoticeListResponse {
  content: NoticeType[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}:${seconds}`
    };
  } catch (error) {
    return {
      date: '날짜 없음',
      time: '시간 없음'
    };
  }
};

export default function AdminNoticePage() {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const size = 10;

  const { data, isLoading } = useQuery<NoticeListResponse>({
    queryKey: ["notices", page, size],
    queryFn: async () => {
      const { data } = await api.get<NoticeListResponse>(`/notices?page=${page}&size=${size}`);
      return data;
    }
  });

  const notices = data?.content ?? [];
  const filteredNotices = searchTerm
    ? notices.filter(notice =>
        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : notices;

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">공지사항</h1>
          <p className="text-gray-500 mt-1">
            공지사항을 관리하고 새로운 소식을 등록하세요
          </p>
        </div>
        <button className="inline-flex items-center h-10 px-4 bg-[#4990FF] text-white rounded-lg text-sm font-medium hover:bg-[#4990FF]/90 transition-colors">
          <Plus className="w-4 h-4 mr-1.5" />
          새 공지사항
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="제목 또는 내용으로 검색"
            className="w-full h-10 pl-10 pr-4 bg-white rounded-lg text-sm border border-gray-200
                      focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>

        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">구분</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">제목</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">작성자</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">작성일</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      로딩 중...
                    </td>
                  </tr>
                ) : filteredNotices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? "검색 결과가 없습니다" : "등록된 공지사항이 없습니다"}
                    </td>
                  </tr>
                ) : (
                  filteredNotices.map((notice) => {
                    const datetime = formatDateTime(notice.createdAt);
                    return (
                      <tr 
                        key={notice.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium",
                            notice.isPinned 
                              ? "bg-red-50 text-red-600" 
                              : "bg-gray-100 text-gray-600"
                          )}>
                            {notice.isPinned ? "고정" : "일반"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {notice.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {notice.content}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {notice.author.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900">{datetime.date}</span>
                            <span className="text-xs text-gray-500">{datetime.time}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-1 text-gray-400 hover:text-[#4990FF] transition-colors">
                              <Edit size={16} />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              총 <span className="font-medium text-gray-900">{data?.totalElements ?? 0}</span>개의 공지사항
            </span>
            {data && data.totalPages > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className={cn(
                    "inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 transition-colors",
                    page === 0
                      ? "text-gray-300"
                      : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={cn(
                      "inline-flex items-center justify-center h-8 min-w-[2rem] rounded-lg text-sm font-medium transition-colors",
                      page === i
                        ? "bg-[#4990FF] text-white"
                        : "text-gray-500 hover:bg-gray-50 border border-gray-200"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                  disabled={page === data.totalPages - 1}
                  className={cn(
                    "inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 transition-colors",
                    page === data.totalPages - 1
                      ? "text-gray-300"
                      : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}