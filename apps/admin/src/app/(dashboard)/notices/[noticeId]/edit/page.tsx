"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

interface Notice {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  author: {
    name: string;
  };
  createdAt: string[];
}

interface FormData {
  title: string;
  content: string;
  isPinned: boolean;
}

export default function EditNoticePage({ params: paramPromise }: { params: Promise<{ noticeId: number }> }) {
  const params = use(paramPromise);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    isPinned: false
  });

  const { data: notice, isLoading } = useQuery<Notice>({
    queryKey: ["notices", params.noticeId],
    queryFn: async () => {
      const { data } = await api.get(`/notices/${params.noticeId}`);
      return data;
    },
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title,
        content: notice.content,
        isPinned: notice.isPinned
      });
    }
  }, [notice]);

  const { mutate: updateNotice } = useMutation({
    mutationFn: async (data: FormData) => {
      setIsSubmitting(true);
      return api.patch(`/notices/${params.noticeId}`, data);
    },
    onSuccess: () => {
      toast.success("공지사항이 수정되었습니다");
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      router.replace(`/notices/${params.noticeId}`);
    },
    onError: () => {
      toast.error("공지사항 수정에 실패했습니다");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

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
      <div className="min-h-screen bg-white">
        <div className="max-w-[960px] mx-auto px-5 py-6">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-32 bg-gray-100 rounded" />
            <div className="space-y-4">
              <div className="h-11 w-full bg-gray-100 rounded" />
              <div className="h-[300px] w-full bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-medium text-gray-900">공지사항 수정</h1>
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault();
          if (!formData.title.trim()) return toast.error("제목을 입력해주세요");
          if (!formData.content.trim()) return toast.error("내용을 입력해주세요");
          updateNotice(formData);
        }}>
          <div>
            <label className="inline-flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors">
              <input
                type="checkbox"
                name="isPinned"
                checked={formData.isPinned}
                onChange={handleChange}
                className="w-4 h-4 text-[#4990FF] rounded border-gray-300 focus:ring-[#4990FF]/20"
              />
              <span className="text-sm font-medium text-gray-700">상단 고정</span>
            </label>
          </div>

          <div className="space-y-1.5">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="제목을 입력하세요"
              className={cn(
                "w-full px-0 py-2 text-lg font-medium placeholder:text-gray-400",
                "border-0 border-b focus:border-b-2 focus:border-[#4990FF]",
                "focus:outline-none focus:ring-0"
              )}
            />
          </div>

          <div className="space-y-1.5">
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="내용을 입력하세요"
              rows={20}
              className={cn(
                "w-full px-0 py-4 text-base text-gray-600",
                "border-0 focus:ring-0 focus:outline-none",
                "resize-none",
                "placeholder:text-gray-400"
              )}
            />
          </div>
        </form>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
          <div className="max-w-[960px] mx-auto px-5 py-4">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="h-9 px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (!formData.title.trim()) return toast.error("제목을 입력해주세요");
                  if (!formData.content.trim()) return toast.error("내용을 입력해주세요");
                  updateNotice(formData);
                }}
                disabled={isSubmitting}
                className={cn(
                  "h-9 px-4 text-sm font-medium rounded-lg transition-colors",
                  "bg-[#4990FF] text-white hover:bg-[#4990FF]/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <span className="flex items-center">
                  <Save className="w-4 h-4 mr-1.5" />
                  {isSubmitting ? "저장 중..." : "저장하기"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}