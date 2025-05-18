"use client";

import { useCallback, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import api from '@/lib/api';
import { toast } from 'sonner';

interface Notice {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string[];
}

export default function NoticesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const itemsPerPage = 15;

  const { data: notices = [], isLoading } = useQuery<Notice[]>({
    queryKey: ['notices', currentPage],
    queryFn: async () => {
      const { data } = await api.get<Notice[]>(`/notices?page=${currentPage}&limit=${itemsPerPage}`);
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });

  const { mutate: deleteNotice } = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/notices/${id}`);
    },
    onSuccess: () => {
      toast.success('공지사항이 삭제되었습니다');
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
    onError: () => {
      toast.error('삭제 중 오류가 발생했습니다');
    }
  });

  const formatDate = useCallback((dateArr: string[]) => {
    if (!Array.isArray(dateArr) || dateArr.length < 3) return "";
    const [year, month, day] = dateArr;
    return format(new Date(+year, +month - 1, +day), 'MM.dd', { locale: ko });
  }, []);

  const handleEdit = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    router.push(`/notices/${id}/edit`);
    setActiveDropdown(null);
  }, [router]);

  const handleDelete = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('이 공지사항을 삭제하시겠습니까?')) {
      deleteNotice(id);
    }
    setActiveDropdown(null);
  }, [deleteNotice]);

  const toggleDropdown = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  }, [activeDropdown]);

  const totalPages = Math.ceil((notices?.length || 0) / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-medium text-gray-900">공지사항</h1>
          <button
            onClick={() => router.push("/notices/new")}
            className="h-9 px-4 bg-[#4990FF] text-white text-sm font-medium rounded-lg hover:bg-[#4990FF]/90 transition-colors"
          >
            <span className="flex items-center">
              <Plus className="w-4 h-4 mr-1.5" />
              새 공지사항
            </span>
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="py-24 text-center text-gray-500">
            등록된 공지사항이 없습니다
          </div>
        ) : (
          <div className="space-y-2">
            {notices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => router.push(`/notices/${notice.id}`)}
                className="group p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {notice.isPinned && (
                        <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded">
                          고정
                        </span>
                      )}
                      <h2 className="text-base font-medium text-gray-900 truncate group-hover:text-[#4990FF]">
                        {notice.title}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {notice.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <time className="text-sm text-gray-400">
                      {formatDate(notice.createdAt)}
                    </time>
                    <div className="relative">
                      <button
                        onClick={(e) => toggleDropdown(e, notice.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-gray-100"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeDropdown === notice.id && (
                        <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg border border-gray-100 shadow-lg overflow-hidden">
                          <button
                            onClick={(e) => handleEdit(e, notice.id)}
                            className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center"
                          >
                            <Pencil size={14} className="mr-2" />
                            수정
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, notice.id)}
                            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center"
                          >
                            <Trash2 size={14} className="mr-2" />
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && notices.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-40 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            
            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={cn(
                  "w-8 h-8 text-sm rounded-full transition-colors",
                  currentPage === number
                    ? "bg-[#4990FF] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
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