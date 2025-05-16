"use client";

import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from '@/lib/api';

interface NoticeResponse {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  author: {
    name: string;
  };
  createdAt: string[];
}

export default function AdminNoticePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isFetching } = useQuery<NoticeResponse[]>({
    queryKey: ["notices", searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams(
        searchTerm ? { search: searchTerm.trim() } : {}
      );
      const { data } = await api.get<NoticeResponse[]>(`/notices${params.toString() ? `?${params.toString()}` : ''}`);
      return data;
    },
    staleTime: 1000 * 60,
  });

  const { mutate: deleteNotice } = useMutation({
    mutationFn: async (noticeId: number) => {
      setIsDeleting(true);
      try {
        await api.delete(`/notices/${noticeId}`);
      } catch (error) {
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    onSuccess: () => {
      toast.success("공지사항이 삭제되었습니다");
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
    onError: (error) => {
      console.error('Delete notice error:', error);
      toast.error("공지사항 삭제에 실패했습니다");
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, queryClient]);

  const handleRowClick = useCallback((noticeId: number) => {
    router.push(`/notices/${noticeId}`);
  }, [router]);

  const handleCreateClick = useCallback(() => {
    router.push("/notices/new");
  }, [router]);

  const handleEditClick = useCallback((noticeId: number) => {
    router.push(`/notices/${noticeId}/edit`);
  }, [router]);

  const handleDeleteClick = useCallback((noticeId: number) => {
    if (isDeleting) return;

    if (window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      deleteNotice(noticeId);
    }
  }, [deleteNotice, isDeleting]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const resetSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const formatDateTime = useCallback((dateArr: string[]) => {
    if (!Array.isArray(dateArr) || dateArr.length < 6) {
      return { date: "날짜 없음", time: "시간 없음" };
    }

    try {
      const date = `${dateArr[0]}-${String(dateArr[1]).padStart(2, "0")}-${String(dateArr[2]).padStart(2, "0")}`;
      const time = `${String(dateArr[3]).padStart(2, "0")}:${String(dateArr[4]).padStart(2, "0")}:${String(dateArr[5]).padStart(2, "0")}`;
      return { date, time };
    } catch (error) {
      console.error('DateTime formatting error:', error);
      return { date: "날짜 없음", time: "시간 없음" };
    }
  }, []);

  const notices = data ?? [];
  const isLoaderVisible = isLoading || isFetching || isDeleting;
  const filteredNotices = searchTerm.trim()
    ? notices.filter(notice =>
      notice.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase().trim())
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
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center h-10 px-4 bg-[#4990FF] text-white rounded-lg text-sm font-medium hover:bg-[#4990FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoaderVisible}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          새 공지사항
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="제목 또는 내용으로 검색"
              className="w-full h-10 pl-10 pr-4 bg-white rounded-lg text-sm border border-gray-200
                        focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF]"
              value={searchTerm}
              onChange={handleSearch}
              disabled={isLoaderVisible}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          {searchTerm && (
            <button
              onClick={resetSearch}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
              disabled={isLoaderVisible}
            >
              초기화
            </button>
          )}
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
                {isLoaderVisible ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <Loader2 className="mx-auto animate-spin text-gray-400" size={36} />
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
                    const { date, time } = formatDateTime(notice.createdAt);
                    return (
                      <tr
                        key={notice.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(notice.id)}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
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
                            <div className="text-sm font-medium text-gray-900 group-hover:text-[#4990FF]">
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
                            <span className="text-sm text-gray-900">{date}</span>
                            <span className="text-xs text-gray-500">{time}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditClick(notice.id)
                              }}
                              className="p-1 text-gray-400 hover:text-[#4990FF] transition-colors disabled:opacity-50"
                              disabled={isLoaderVisible}
                              title="수정"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteClick(notice.id)
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                              disabled={isLoaderVisible}
                              title="삭제"
                            >
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
              총 <span className="font-medium text-gray-900">{filteredNotices.length}</span>개의 공지사항
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}