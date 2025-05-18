"use client";

import { use } from 'react';
import { ArrowLeft, Clock, User } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface TransactionType {
  id: number;
  user: {
    id: number;
    name: string;
  };
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
  createdAt: string | number[]
};

const formatDateTime = (dateArr: number[]) => {
  if (!dateArr || dateArr.length < 6) return { date: '-', time: '-' };
  const [year, month, day, hour, minute, second] = dateArr;
  const date = new Date(+year, +month - 1, +day, +hour, +minute, +second);
  return {
    date: format(date, 'yyyy.MM.dd', { locale: ko }),
    time: format(date, 'HH:mm:ss', { locale: ko })
  };
};

const formatCurrency = (amount: number | null) => {
  if (amount === null) return '';
  return amount.toLocaleString('ko-KR') + '원';
};

export default function TransactionDetailPage({ params: ParamPromise }: { params: Promise<{ id: number }> }) {
  const params = use(ParamPromise)
  const router = useRouter();

  const { data: transaction, isLoading } = useQuery<TransactionType>({
    queryKey: ["transaction", params.id],
    queryFn: async () => {
      const { data } = await api.get(`transactions/${params.id}`)
      return data;
    }
  })

  const datetime = transaction?.createdAt && Array.isArray(transaction.createdAt)
    ? formatDateTime(transaction.createdAt)
    : { date: '-', time: '-' };

  const isCharge = transaction?.type === "CHARGE";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[960px] mx-auto px-5 py-6">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-medium text-gray-900">거래 상세</h1>
          </div>

          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-medium text-gray-900">거래 상세</h1>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  isCharge ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                )}>
                  {isCharge ? "충전" : "결제"}
                </span>
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100">
                  <User className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-700">
                    {transaction?.user?.name ?? '-'}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className={cn(
                  "text-2xl font-medium",
                  isCharge ? "text-blue-600" : "text-red-600"
                )}>
                  {transaction && (
                    <>{isCharge ? "+" : "-"}{formatCurrency(transaction.amount)}</>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  잔액 {formatCurrency(transaction?.balanceAfter || 0)}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1.5" />
                {datetime.date} {datetime.time}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg border border-gray-200 space-y-4">
            <h2 className="font-medium text-gray-900">거래 정보</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">거래 번호</span>
                <span className="text-sm font-medium text-gray-900">#{transaction?.id}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">사용자 ID</span>
                <span className="text-sm font-medium text-gray-900">#{transaction?.user?.id ?? '-'}</span>
              </div>
              {!isCharge && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">부스</span>
                  <span className="text-sm font-medium text-gray-900">
                    {transaction?.booth?.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {!isCharge && transaction?.items && transaction.items.length > 0 && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-medium text-gray-900">상품 목록</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {transaction.items.map((item, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.product.name}</div>
                        <div className="text-sm text-gray-500">{item.quantity}개</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(item.price)}/개
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">총액</span>
                    <span className="font-medium text-[#4990FF]">
                      {formatCurrency(transaction?.amount ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}