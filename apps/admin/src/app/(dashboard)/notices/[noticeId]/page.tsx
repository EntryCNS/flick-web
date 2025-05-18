"use client";

import { useState, use } from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";

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

export default function NoticeDetailPage({ params: ParamPromise }: { params: Promise<{ noticeId: number }> }) {
  const params = use(ParamPromise)
  const noticeId = params.noticeId;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: notice, isLoading, isError } = useQuery<NoticeResponse>({
    queryKey: ["notices", noticeId],
    queryFn: async () => {
      const { data } = await api.get(`/notices/${noticeId}`);
      return data;
    },
    retry: false,
    staleTime: 1000 * 60,
    enabled: !isDeleting,
  });

  const { mutate: deleteNotice } = useMutation({
    mutationFn: async () => {
      setIsDeleting(true);
      await api.delete(`/notices/${noticeId}`);
    },
    onSuccess: () => {
      toast.success("공지사항이 삭제되었습니다");
      queryClient.removeQueries({ queryKey: ["notices", noticeId] });
      router.replace("/notices");
    },
    onError: () => {
      toast.error("삭제 중 오류가 발생했습니다");
      setIsDeleting(false);
    }
  });

  const formatDate = (dateArr: string[] | undefined) => {
    if (!Array.isArray(dateArr) || dateArr.length < 3) return "";
    const [year, month, day] = dateArr;
    return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[960px] mx-auto px-5 py-6">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-32 bg-gray-100 rounded" />
            <div className="h-8 w-3/4 bg-gray-100 rounded" />
            <div className="space-y-4">
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-5/6 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    router.replace("/notices");
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-medium text-gray-900">공지사항</h1>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {notice?.isPinned && (
              <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded">
                고정
              </span>
            )}
            <span>{formatDate(notice?.createdAt)}</span>
            <span>•</span>
            <span>{notice?.author.name}</span>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900">
            {notice?.title}
          </h2>

          <div className="text-base text-gray-600 space-y-6">
            {notice?.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="leading-relaxed whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
          <div className="max-w-[960px] mx-auto px-5 py-4">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  if (window.confirm("이 공지사항을 삭제하시겠습니까?")) {
                    deleteNotice();
                  }
                }}
                disabled={isDeleting}
                className={cn(
                  "h-9 px-4 text-sm font-medium rounded-lg transition-colors",
                  "text-red-600 hover:bg-red-50",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <span className="flex items-center">
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  {isDeleting ? "삭제 중" : "삭제"}
                </span>
              </button>
              <button
                onClick={() => router.push(`/notices/${noticeId}/edit`)}
                disabled={isDeleting}
                className={cn(
                  "h-9 px-4 text-sm font-medium rounded-lg transition-colors",
                  "bg-[#4990FF] text-white hover:bg-[#4990FF]/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <span className="flex items-center">
                  <Edit className="w-4 h-4 mr-1.5" />
                  수정
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}