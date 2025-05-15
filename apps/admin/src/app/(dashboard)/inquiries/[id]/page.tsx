"use client";

import { use, useState } from 'react';
import { ArrowLeft, Send, Paperclip, Clock, User, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import api from '@/lib/api';
import Link from 'next/link';

type InquiryStatus = 'ACCOUNT' | 'PAYMENT' | 'SYSTEM' | 'OTHER';
type ReplyStatus = 'PENDING' | 'COMPLETED';

interface InquiryDetail {
  id: number;
  category: InquiryStatus;
  title: string;
  content: string;
  userId: number;
  createdAt: string[];
  updatedAt: string[];
}

interface Reply {
  id: number;
  content: string;
  createdAt: string[];
  isAdmin: boolean;
  adminName?: string;
}

interface Attachment {
  id: number;
  fileName: string;
  fileSize: number;
  fileUrl: string;
}

interface StatusBadgeProps {
  category: InquiryStatus;
}

interface ReplyStatusBadgeProps {
  status: ReplyStatus;
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
      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
      config[category].className
    )}>
      {config[category].label}
    </span>
  );
};

const ReplyStatusBadge = ({ status }: ReplyStatusBadgeProps) => {
  const config: Record<ReplyStatus, { className: string; label: string }> = {
    PENDING: {
      className: 'bg-amber-50 text-amber-600',
      label: '답변 대기'
    },
    COMPLETED: {
      className: 'bg-emerald-50 text-emerald-600',
      label: '답변 완료'
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
      config[status].className
    )}>
      {config[status].label}
    </span>
  );
};

const formatDate = (dateArray: string[]) => {
  const [year, month, day, hour, minute, second] = dateArray;
  return {
    date: `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
    time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`
  };
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

export default function AdminInquiryDetailPage({ params: paramPromise }: { params: Promise<{ id: number }> }) {
  const params = use(paramPromise);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState('');
  
  const inquiryId = params.id;

  const { data: inquiry, isLoading } = useQuery<InquiryDetail>({
    queryKey: ["inquiry", inquiryId],
    queryFn: async () => {
      const { data } = await api.get<InquiryDetail>(`/inquiries/${inquiryId}`);
      return data;
    }
  });

  // const sendReplyMutation = useMutation({
  //   mutationFn: async (content: string) => {
  //     const { data } = await api.post(`/inquiries/${inquiryId}/replies`, { content });
  //     return data;
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["inquiry", inquiryId] });
  //     setReplyContent('');
  //   }
  // });

  // const handleSendReply = () => {
  //   if (replyContent.trim()) {
  //     sendReplyMutation.mutate(replyContent);
  //   }
  // };

  if (isLoading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">로딩 중...</h1>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">문의를 찾을 수 없습니다</h1>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <p className="text-gray-500">요청하신 문의를 찾을 수 없습니다. 문의 목록으로 돌아가세요.</p>
          <Link 
            href="/admin/inquiries" 
            className="mt-4 inline-flex items-center px-4 py-2 bg-[#4990FF] text-white rounded-lg text-sm font-medium hover:bg-[#4990FF]/90 transition-all"
          >
            문의 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const createdDateTime = formatDate(inquiry.createdAt);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-8 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start space-x-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{inquiry.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge category={inquiry.category} />
              {/* <ReplyStatusBadge status={inquiry.status} /> */}
            </div>
          </div>
        </div>
        <button 
          onClick={() => router.push(`/admin/inquiries`)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          목록으로
        </button>
      </div>

      {/* 문의 상세 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 문의 내용 */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg text-gray-900">문의 내용</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={16} className="mr-1.5" />
                  <span>{createdDateTime.date} {createdDateTime.time}</span>
                </div>
              </div>
              <div className="prose max-w-none text-gray-700">
                <p className="whitespace-pre-wrap leading-relaxed">{inquiry.content}</p>
              </div>
            </div>
          </div>

          {/* <div className="space-y-4">
            <h2 className="font-semibold text-lg text-gray-900">답변 내역</h2>
            {inquiry.replies.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm">
                <p className="text-gray-500">아직 답변 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiry.replies.map(reply => {
                  const replyDateTime = formatDate(reply.createdAt);
                  return (
                    <div 
                      key={reply.id} 
                      className={cn(
                        "bg-white rounded-lg border shadow-sm p-6",
                        reply.isAdmin 
                          ? "border-[#4990FF]/20 bg-[#4990FF]/[0.02]" 
                          : "border-gray-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          {reply.isAdmin ? (
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-[#4990FF]/10 flex items-center justify-center mr-3">
                                <CheckCircle size={18} className="text-[#4990FF]" />
                              </div>
                              <span className="font-medium text-gray-900">{reply.adminName || '관리자'}</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                <User size={18} className="text-gray-500" />
                              </div>
                              <span className="font-medium text-gray-900">{inquiry.userName}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {replyDateTime.date} {replyDateTime.time}
                        </div>
                      </div>
                      <div className="prose max-w-none text-gray-700">
                        <p className="whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div> */}
        </div>

        {/* 사용자 정보 */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-lg text-gray-900 mb-4">문의자 정보</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={18} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{inquiry.userId}</p>
                  {/* <p className="text-xs text-gray-500">{inquiry.userEmail}</p> */}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <dt className="text-gray-500">사용자 ID</dt>
                  <dd className="text-gray-900 font-medium">{inquiry.userId}</dd>
                  <dt className="text-gray-500">문의 번호</dt>
                  <dd className="text-gray-900 font-medium">{inquiry.id}</dd>
                  <dt className="text-gray-500">문의 상태</dt>
                  {/* <dd><ReplyStatusBadge status={inquiry.status} /></dd> */}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 답변 입력 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-lg text-gray-900 mb-4">답변 작성</h2>
        <div className="space-y-4">
          <textarea
            rows={5}
            placeholder="답변 내용을 입력하세요"
            className="w-full rounded-lg border border-gray-200 p-4 text-sm placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF] transition-all"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <button className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 
                              hover:bg-gray-50 hover:border-gray-300 transition-all">
              <Paperclip size={16} className="mr-2" />
              파일 첨부
            </button>
            <button
              // onClick={handleSendReply}
              disabled={replyContent.trim() === ''}
              className="inline-flex items-center px-5 py-2 bg-[#4990FF] text-white rounded-lg text-sm font-medium
                        hover:bg-[#4990FF]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} className="mr-2" />
              답변 보내기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}