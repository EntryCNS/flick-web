"use client";

import { useState, use } from "react";
import { ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";

interface NoticeType {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  author: {
    name: string;
  };
  createdAt: string[];
}

export default function NoticeDetailPage({ params: ParamPromise }: { params: Promise<{ id: number }> }) {
  const params = use(ParamPromise)
  const noticeId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: notice, isLoading } = useQuery<NoticeType>({
    queryKey: ["notices", noticeId],
    queryFn: async () => {
      const { data } = await api.get(`/notices/${noticeId}`);
      return data;
    },
  });

  const { mutate: deleteNotice } = useMutation({
    mutationFn: async (id: number) => {
      setIsDeleting(true);
      try {
        await api.delete(`/notices/${id}`);
      } catch (error) {
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    onSuccess: () => {
      toast.success("공지사항이 삭제되었습니다");
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      router.push("/notices");
    },
    onError: (error) => {
      console.error('Delete notice error:', error);
      toast.error("공지사항 삭제에 실패했습니다");
    }
  });

  const handleDelete = () => {
    if (isDeleting) return;

    if (window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      deleteNotice(noticeId);
    }
  };

  const formatDateTime = (dateArr: string[] | undefined) => {
    if (!Array.isArray(dateArr) || dateArr.length < 6) {
      return { date: "", time: "" };
    }

    try {
      const date = `${dateArr[0]}-${String(dateArr[1]).padStart(2, "0")}-${String(dateArr[2]).padStart(2, "0")}`;
      const time = `${String(dateArr[3]).padStart(2, "0")}:${String(dateArr[4]).padStart(2, "0")}:${String(dateArr[5]).padStart(2, "0")}`;
      return { date, time };
    } catch (error) {
      console.error('DateTime formatting error:', error);
      return { date: "", time: "" };
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={36} />
      </div>
    );
  }

  const { date, time } = formatDateTime(notice?.createdAt);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-medium text-gray-900">공지사항</h1>
            <p className="text-gray-500 mt-1">공지사항을 확인하고 관리하세요</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/notices/${noticeId}/edit`)}
            disabled={isDeleting}
            className="inline-flex items-center h-10 px-4 bg-[#4990FF] text-white rounded-lg text-sm font-medium hover:bg-[#4990FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit className="w-4 h-4 mr-1.5" />
            수정하기
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="bg-white rounded-lg border border-gray-100">
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              {notice?.isPinned && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600">
                  고정
                </span>
              )}
            </div>
            <h2 className="text-xl font-medium text-gray-900">
              {notice?.title}
            </h2>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
              <span>{notice?.author.name}</span>
              <span>{date} {time}</span>
            </div>
          </div>

          <div className="prose max-w-none">
            {notice?.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center h-9 px-4 border border-red-200 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            {isDeleting ? "삭제 중..." : "삭제하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
