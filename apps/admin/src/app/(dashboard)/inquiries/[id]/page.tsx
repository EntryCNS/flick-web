"use client";

import { use, useCallback, useState } from 'react';
import { Calendar, Clock, User, MessageCircle, Tag, ArrowLeft, ChevronRight, Share2, Bookmark } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface inquiryType {
  id: number,
  category: "ACCOUNT" | "PAYMENT" | "SYSTEM" | "OTHER",
  title: string,
  content: string,
  userId: number,
  createdAt: string,
  updatedAt: string
}

const formatDate = (year: string | undefined, month: string | undefined, day: string | undefined) => {
  if (!year || !month || !day) return '-';
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
};

const formatTime = (hour: string | undefined, minute: string | undefined, second: string | undefined) => {
  if (!hour || !minute || !second) return '-';
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
};

export default function InquiryDetailPage({ params: ParamPromise }: { params: Promise<{ id: number }> }) {
  const router = useRouter();
  const param = use(ParamPromise);

  const { data: inquiry, isLoading } = useQuery<inquiryType>({
    queryKey: ['inquiry', param.id],
    queryFn: async () => {
      const { data } = await api.get(`/inquiries/${param.id}`);
      return data;
    }
  });

  const date = inquiry?.createdAt ? formatDate(inquiry.createdAt[0], inquiry.createdAt[1], inquiry.createdAt[2]) : '-';
  const time = inquiry?.createdAt ? formatTime(inquiry.createdAt[3], inquiry.createdAt[4], inquiry.createdAt[5]) : '-';

  if (isLoading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-6 py-8">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-lg bg-gray-100 animate-pulse" />
            <div>
              <div className="h-8 w-32 bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* 컨텐츠 스켈레톤 */}
        <div className="bg-white rounded-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="h-7 w-3/4 bg-gray-100 rounded animate-pulse mb-4" />
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50">
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-medium text-gray-900">문의 상세</h1>
            <p className="text-gray-500 mt-1">문의에 대한 상세 정보를 확인할 수 있습니다</p>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="bg-white rounded-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            {inquiry?.title || '-'}
          </h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-1.5" />
              <span>{inquiry?.category || '-'}</span>
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1.5" />
              <span>유저 아이디: {inquiry?.userId || '-'}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5" />
              <span>{date}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5" />
              <span>{time}</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {inquiry?.content || '-'}
          </p>
        </div>
        <div className="px-6 py-4 bg-gray-50 text-sm text-gray-500 rounded-b-lg">
          문의 번호: {inquiry?.id || '-'}
        </div>
      </div>
    </div>
  );
}