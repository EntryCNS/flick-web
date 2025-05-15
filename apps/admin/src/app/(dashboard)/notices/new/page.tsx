"use client";

import { useCallback } from "react";
import { AlertCircle, Send, ArrowLeft } from "lucide-react";
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

export default function AdminNoticeForm() {
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

  const { mutate: createNotice, isLoading } = useMutation({
    mutationFn: async (data: NoticeFormData) => {
      const response = await api.post("/notices", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("공지사항이 등록되었습니다");
      router.push("/notices");
    },
    onError: (error) => {
      console.error('Create notice error:', error);
      toast.error("공지사항 등록에 실패했습니다");
    },
  });

  const onSubmit = useCallback(async (data: NoticeFormData) => {
    try {
      await createNotice(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  }, [createNotice]);

  const watchedTitle = watch("title");
  const watchedContent = watch("content");
  const isFormDisabled = isSubmitting || isLoading || !watchedTitle?.trim() || !watchedContent?.trim();

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">공지사항 작성</h1>
          <p className="text-gray-500 mt-1">
            새로운 공지사항을 작성하고 등록하세요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center h-10 px-4 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            돌아가기
          </button>
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isFormDisabled}
            className={cn(
              "inline-flex items-center h-10 px-4 rounded-lg text-sm font-medium transition-colors",
              "bg-[#4990FF] text-white hover:bg-[#4990FF]/90",
              "disabled:bg-[#4990FF]/50 disabled:cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4 mr-1.5" />
            {isLoading ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-lg border border-gray-100 p-6">
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("isPinned")}
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
            {...register("title")}
            placeholder="공지사항 제목을 입력하세요"
            className={cn(
              "w-full h-11 px-3.5 border rounded-lg text-sm",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF]",
              errors.title ? "border-red-500" : "border-gray-200"
            )}
          />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            내용
          </label>
          <textarea
            {...register("content")}
            placeholder="공지사항 내용을 입력하세요"
            rows={12}
            className={cn(
              "w-full px-3.5 py-3 border rounded-lg text-sm",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF]",
              "resize-none",
              errors.content ? "border-red-500" : "border-gray-200"
            )}
          />
          {errors.content && (
            <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
          )}
        </div>

        <div className="flex items-start gap-3 p-4 bg-amber-50/60 rounded-lg border border-amber-100">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">
              등록 전 확인사항
            </h3>
            <ul className="mt-1.5 text-sm text-amber-700 space-y-1">
              <li>• 공지사항 등록 후에도 수정이 가능합니다.</li>
              <li>• 새로운 공지는 사용자에게 알림이 발송됩니다.</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}