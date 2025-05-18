"use client";

import { use } from 'react';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import api from '@/lib/api';

interface InquiryType {
  id: number;
  category: "ACCOUNT" | "PAYMENT" | "SYSTEM" | "OTHER";
  title: string;
  content: string;
  user: {
    name: string;
  };
  createdAt: string | number[];
  updatedAt: string | number[];
}

const categoryConfig = {
  ACCOUNT: { label: '계정', className: 'bg-[#4990FF]/10 text-[#4990FF]' },
  PAYMENT: { label: '결제', className: 'bg-amber-50 text-amber-600' },
  SYSTEM: { label: '시스템', className: 'bg-emerald-50 text-emerald-600' },
  OTHER: { label: '기타', className: 'bg-gray-100 text-gray-600' }
} as const;

const formatDateTime = (datetime: string | number[] | undefined): Dayjs | null => {
  if (!datetime) return null;
  
  if (Array.isArray(datetime)) {
    const [year, month, day, hour, minute, second] = datetime;
    return dayjs()
      .year(Number(year))
      .month(Number(month) - 1)
      .date(Number(day))
      .hour(Number(hour))
      .minute(Number(minute))
      .second(Number(second));
  }
  
  return dayjs(datetime);
};

export default function InquiryDetailPage({ params: ParamPromise }: { params: Promise<{ inquiryId: number }> }) {
  const router = useRouter();
  const param = use(ParamPromise);

  const { data: inquiry, isLoading } = useQuery<InquiryType>({
    queryKey: ['inquiry', param.inquiryId],
    queryFn: async () => {
      const { data } = await api.get(`/inquiries/${param.inquiryId}`);
      return data;
    },
    staleTime: 1000 * 60,
  });

  const createdAt = formatDateTime(inquiry?.createdAt);
  const updatedAt = formatDateTime(inquiry?.updatedAt);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[960px] mx-auto px-5 py-6">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-32 bg-gray-100 rounded" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-gray-100 rounded" />
              <div className="h-40 bg-gray-100 rounded" />
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-medium text-gray-900">문의 상세</h1>
          </div>
        </div>

        <div className="space-y-6">
          {inquiry?.category && (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg ${categoryConfig[inquiry.category].className}`}>
              {categoryConfig[inquiry.category].label}
            </span>
          )}

          <h2 className="text-2xl font-semibold text-gray-900">
            {inquiry?.title}
          </h2>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{inquiry?.user.name}</span>
            </div>
            {createdAt && (
              <>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{createdAt.format('YYYY-MM-DD')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{createdAt.format('HH:mm:ss')}</span>
                </div>
              </>
            )}
            {updatedAt && !updatedAt.isSame(createdAt) && (
              <span className="text-xs text-gray-400">
                ({updatedAt.format('YYYY-MM-DD HH:mm')} 수정됨)
              </span>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100">
            <div className="prose max-w-none text-gray-600">
              {inquiry?.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-base leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}