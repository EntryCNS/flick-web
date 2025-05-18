"use client";

import { useCallback } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

const noticeSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  isPinned: z.boolean()
});

type NoticeFormData = z.infer<typeof noticeSchema>;

interface NoticeResponse {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string[];
}

export default function NewNoticePage() {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: "",
      content: "",
      isPinned: false,
    }
  });

  const { mutate: createNotice, isSuccess } = useMutation<NoticeResponse, Error, NoticeFormData>({
    mutationFn: async (data) => {
      const response = await api.post<NoticeResponse>("/notices", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("공지사항이 등록되었습니다");
      router.replace("/notices");
    },
    onError: () => {
      toast.error("공지사항 등록에 실패했습니다");
    },
  });

  const onSubmit = useCallback((data: NoticeFormData) => {
    createNotice(data);
  }, [createNotice]);

  const watchedTitle = watch("title");
  const watchedContent = watch("content");
  const isFormDisabled = isSubmitting || isSuccess || !watchedTitle?.trim() || !watchedContent?.trim();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-medium text-gray-900">새 공지사항</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="inline-flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors">
              <input
                type="checkbox"
                {...register("isPinned")}
                className="w-4 h-4 text-[#4990FF] rounded border-gray-300 focus:ring-[#4990FF]/20"
              />
              <span className="text-sm font-medium text-gray-700">상단 고정</span>
            </label>
          </div>

          <div className="space-y-1.5">
            <input
              type="text"
              {...register("title")}
              placeholder="제목을 입력하세요"
              className={cn(
                "w-full px-0 py-2 text-lg font-medium placeholder:text-gray-400",
                "border-0 border-b focus:border-b-2 focus:border-[#4990FF]",
                "focus:outline-none focus:ring-0",
                errors.title ? "border-red-500" : "border-gray-200"
              )}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <textarea
              {...register("content")}
              placeholder="내용을 입력하세요"
              rows={20}
              className={cn(
                "w-full px-0 py-4 text-base text-gray-600",
                "border-0 focus:ring-0 focus:outline-none",
                "resize-none",
                "placeholder:text-gray-400"
              )}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
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
                onClick={handleSubmit(onSubmit)}
                disabled={isFormDisabled}
                className={cn(
                  "h-9 px-4 text-sm font-medium rounded-lg transition-colors",
                  "bg-[#4990FF] text-white hover:bg-[#4990FF]/90",
                  "disabled:bg-[#4990FF]/50 disabled:cursor-not-allowed"
                )}
              >
                <span className="flex items-center">
                  <Send className="w-4 h-4 mr-1.5" />
                  {isSuccess ? "등록됨" : "등록하기"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}