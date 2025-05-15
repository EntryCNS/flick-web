"use client";

import { useState, useEffect, use } from "react";
import { Loader2, AlertCircle, Save, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function NoticeEditPage({ params: paramPromise }: { params: Promise<{ id: number }> }) {
  const params = use(paramPromise);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 상태
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isPinned: false
  });

  // API 호출
  const { data: notice, isLoading } = useQuery<NoticeType>({
    queryKey: ["notices", params.id],
    queryFn: async () => {
      const { data } = await api.get(`/notices/${params.id}`);
      return data;
    },
    staleTime: 1000 * 60, // 1분 캐시
  });

  // 초기 데이터 설정
  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title,
        content: notice.content,
        isPinned: notice.isPinned
      });
    }
  }, [notice]);

  // 수정 API
  const { mutate: updateNotice } = useMutation({
    mutationFn: async (data: typeof formData) => {
      return api.patch(`/notices/${params.id}`, data);
    },
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      toast.success("공지사항이 수정되었습니다");
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      router.push(`/notices/${params.id}`);
    },
    onError: (error) => {
      console.error("Update notice error:", error);
      toast.error("공지사항 수정에 실패했습니다");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleSubmit = () => {
    const { title, content } = formData;

    if (!title.trim()) {
      toast.error("제목을 입력해주세요");
      return;
    }

    if (!content.trim()) {
      toast.error("내용을 입력해주세요");
      return;
    }

    updateNotice(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={36} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">공지사항 수정</h1>
          <p className="text-gray-500 mt-1">
            공지사항을 수정하고 업데이트하세요
          </p>
        </div>
        <button
          onClick={() => router.push("/notices")}
          className="inline-flex items-center h-10 px-4 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          목록으로
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="p-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isPinned"
                checked={formData.isPinned}
                onChange={handleChange}
                className="w-4 h-4 text-[#4990FF] rounded border-gray-300 focus:ring-[#4990FF]/20"
              />
              <span className="text-sm font-medium text-gray-700">상단 고정</span>
            </label>
            <p className="mt-1 text-xs text-gray-500 ml-6">
              상단 고정된 공지사항은 목록의 최상단에 표시됩니다
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              제목
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="공지사항 제목을 입력하세요"
              className={cn(
                "w-full h-11 px-3.5 border border-gray-200 rounded-lg text-sm",
                "placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF]"
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              내용
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="공지사항 내용을 입력하세요"
              rows={12}
              className={cn(
                "w-full px-3.5 py-3 border border-gray-200 rounded-lg text-sm",
                "placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF]",
                "resize-none"
              )}
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50/60 rounded-lg border border-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                수정 전 확인사항
              </h3>
              <ul className="mt-1.5 text-sm text-amber-700 space-y-1">
                <li>• 공지사항 수정 시 수정일이 자동으로 갱신됩니다.</li>
                <li>• 수정된 내용은 즉시 반영됩니다.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/notices")}
            className="inline-flex items-center h-10 px-4 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
            className={cn(
              "inline-flex items-center h-10 px-4 bg-[#4990FF] text-white rounded-lg text-sm font-medium hover:bg-[#4990FF]/90 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isSubmitting ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </form>
    </div>
  );
}