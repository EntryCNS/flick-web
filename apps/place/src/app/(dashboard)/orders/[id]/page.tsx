"use client"

import { useState } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const statusConfig = {
  PENDING: { 
    color: 'bg-[#4990FF]/10 text-[#4990FF] border-[#4990FF]/20', 
    icon: <AlertCircle className="w-3 h-3" />,
    text: '결제 대기중'
  },
  PAID: { 
    color: 'bg-green-50 text-green-600 border-green-100', 
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    text: '결제 완료'
  },
  COMPLETED: { 
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100', 
    icon: <CheckCircle className="w-3 h-3" />,
    text: '주문 완료'
  }
};

interface OrderData {
  id: number;
  userId: number;
  boothOrderNumber: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'COMPLETED';
  expiresAt: string;
  paidAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const [orderData] = useState<OrderData>({
    id: 9007199254740991,
    userId: 9007199254740991,
    boothOrderNumber: 1073741824,
    totalAmount: 9007199254740991,
    status: "PENDING",
    expiresAt: "2025-05-19T15:23:37.815Z",
    paidAt: "2025-05-19T15:23:37.815Z",
    completedAt: "2025-05-19T15:23:37.815Z",
    createdAt: "2025-05-19T15:23:37.815Z",
    updatedAt: "2025-05-19T15:23:37.815Z"
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const formatAmount = (amount: number) => {
    return `${new Intl.NumberFormat('ko-KR').format(amount)}원`;
  };

  const currentStatus = statusConfig[orderData.status];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-medium text-gray-900">주문 상세</h1>
        </div>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-medium text-gray-900">주문 #{orderData.boothOrderNumber}</h2>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${currentStatus.color}`}>
                <span className="mr-1">{currentStatus.icon}</span>
                {currentStatus.text}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1.5" />
                주문일: {formatDate(orderData.createdAt)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1.5" />
                만료일: {formatDate(orderData.expiresAt)}
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-base font-medium text-gray-900 mb-4">주문 정보</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">주문 ID</span>
                <span className="text-sm text-gray-900">{orderData.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">사용자 ID</span>
                <span className="text-sm text-gray-900">{orderData.userId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">부스 주문번호</span>
                <span className="text-sm text-gray-900">{orderData.boothOrderNumber}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">총 결제금액</span>
                <span className="text-sm font-medium text-[#4990FF]">{formatAmount(orderData.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-base font-medium text-gray-900 mb-4">주문 타임라인</h2>
            <div className="relative">
              <div className="absolute left-2 top-1 h-full w-px bg-gray-200"></div>
              <div className="space-y-4">
                <div className="flex relative">
                  <div className="w-4 h-4 bg-[#4990FF]/10 rounded-full flex items-center justify-center z-10">
                    <div className="w-1.5 h-1.5 bg-[#4990FF] rounded-full"></div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm text-gray-900">주문 생성</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(orderData.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex relative">
                  <div className="w-4 h-4 bg-[#4990FF]/10 rounded-full flex items-center justify-center z-10">
                    <div className="w-1.5 h-1.5 bg-[#4990FF] rounded-full"></div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm text-gray-900">결제 완료</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(orderData.paidAt)}</p>
                  </div>
                </div>
                
                <div className="flex relative">
                  <div className={`w-4 h-4 ${orderData.status === 'COMPLETED' ? 'bg-[#4990FF]/10' : 'bg-gray-100'} rounded-full flex items-center justify-center z-10`}>
                    <div className={`w-1.5 h-1.5 ${orderData.status === 'COMPLETED' ? 'bg-[#4990FF]' : 'bg-gray-300'} rounded-full`}></div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm text-gray-900">주문 완료</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{orderData.status === 'COMPLETED' ? formatDate(orderData.completedAt) : '대기중'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="flex-1 h-9 bg-[#4990FF] hover:bg-[#4990FF]/90 text-white text-sm font-medium rounded-lg">
            결제하기
          </button>
          <button className="flex-1 h-9 border border-gray-200 hover:bg-gray-100 text-sm font-medium rounded-lg">
            주문 취소
          </button>
        </div>
      </div>
    </div>
  );
}