"use client";

import { use, useState } from 'react';
import { ArrowLeft, Download, Share2, Clock, CreditCard, Tag, MapPin } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import dayjs from "dayjs"

interface TransactionType {
  id: number;
  userId: number;
  type: "CHARGE" | "PAYMENT";
  amount: number;
  balanceAfter: number;
  orderId: number;
  adminId: number;
  memo: string;
  booth: {
    name: string;
  };
  items: [
    {
      id: number,
      product: {
        name: string
      },
      price: number,
      quantity: number
    }
  ],
  createdAt: string
};

const statusConfig = {
  "CHARGE": { className: 'bg-emerald-50 text-emerald-600' },
  'PAYMENT': { className: 'bg-[#4990FF]/10 text-[#4990FF]' }
}

const formatDate = (year: string | undefined, month: string | undefined, day: string | undefined) => {
  return `${year}-${month?.toString().padStart(2, "0")}-${day?.toString().padStart(2, "0")}`;
};

const formatTime = (hour: string | undefined, minute: string | undefined, second: string | undefined) => {
  return `${hour?.toString().padStart(2, "0")}:${minute?.toString().padStart(2, "0")}:${second?.toString().padStart(2, "0")}`;
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('ko-KR') + '원';
};


export default function TransactionDetailPage({ params: ParamPromise }: { params: Promise<{ id: number }> }) {
  const params = use(ParamPromise)
  const router = useRouter();

  const { data: transaction, isLoading } = useQuery<TransactionType>({
    queryKey: ["transaction"],
    queryFn: async () => {
      const { data } = await api.get(`transactions/${params.id}`)
      return data;
    }
  })

  const statusConfig = {
    'CHARGE': { className: 'bg-emerald-50 text-emerald-600' },
    'PAYMENT': { className: 'bg-[#4990FF]/10 text-[#4990FF]' },
  };

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
            <h1 className="text-2xl font-medium text-gray-900">거래 상세</h1>
            <p className="text-gray-500 mt-1">거래에 대한 상세 정보를 확인할 수 있습니다</p>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽 컬럼 (거래 정보) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex flex-col items-center">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-6 w-20 bg-gray-100 rounded animate-pulse" />
                  <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="h-6 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
                    statusConfig[transaction?.type ?? "CHARGE"]?.className || ''
                  )}>
                    {transaction?.type === 'CHARGE' ? '충전' : '결제'}
                  </span>
                  <h2 className="text-3xl font-semibold mt-3 mb-1 text-gray-900">
                    {formatCurrency(transaction?.amount || 0)}
                  </h2>
                  <p className="text-gray-600 font-medium">
                    {transaction?.booth?.name || '-'}
                  </p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {transaction?.createdAt ? (
                      <div>
                        <span>{dayjs(new Date(...transaction.createdAt)).format("YYYY.MM.DD")}</span>
                        {' '}/{' '}
                        <span>{new Date(...transaction.createdAt).toLocaleString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false
                          })}</span>
                      </div>
                    ) : '-'}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">항목 내역</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">상품명</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500">수량</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500">가격</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300" />
                        </div>
                      </td>
                    </tr>
                  ) : transaction?.items?.length ? (
                    transaction.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.product.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(item.price)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center text-gray-500">
                        항목이 없습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">총액</span>
                <span className="font-medium text-[#4990FF]">
                  {transaction ? formatCurrency(transaction.amount) : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">거래 정보</h3>
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">거래 ID</span>
                  <span className="text-sm font-medium text-gray-900">{transaction?.id || '-'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">부스</span>
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-[#4990FF]" />
                    {transaction?.booth?.name || '-'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}