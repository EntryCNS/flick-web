"use client"

import { useState } from 'react';
import { Search, Filter, ArrowUpDown, ChevronRight } from 'lucide-react';

type StatusType = 'completed' | 'processing' | 'cancelled';

const StatusBadge = ({ status }: { status: StatusType }) => {
  const styles: Record<StatusType, { bg: string; text: string; label: string }> = {
    completed: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      label: '완료'
    },
    processing: {
      bg: 'bg-[#4990FF]/10',
      text: 'text-[#4990FF]',
      label: '처리중'
    },
    cancelled: {
      bg: 'bg-red-50',
      text: 'text-red-500',
      label: '취소'
    }
  };

  const style = styles[status] ?? styles.processing;

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
};

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const PRODUCT_TABS = [
    { id: 'all', label: '전체' },
    { id: 'smartwatch', label: '스마트워치' },
    { id: 'earphones', label: '이어폰' },
    { id: 'tablet', label: '태블릿' },
    { id: 'phone', label: '스마트폰' },
    { id: 'laptop', label: '노트북' },
  ] as const;

  const salesData = [
    { id: 1, date: '2025-05-15', customer: '김민수', product: '스마트워치 X1', category: 'smartwatch', amount: 299000, status: 'completed' },
    { id: 2, date: '2025-05-14', customer: '이지연', product: '무선이어폰 Pro', category: 'earphones', amount: 189000, status: 'completed' },
    { id: 3, date: '2025-05-12', customer: '박준호', product: '태블릿 T9', category: 'tablet', amount: 589000, status: 'processing' },
    { id: 4, date: '2025-05-10', customer: '최서연', product: '스마트폰 Galaxy', category: 'phone', amount: 1250000, status: 'completed' },
    { id: 5, date: '2025-05-08', customer: '강현우', product: '노트북 X Pro', category: 'laptop', amount: 1890000, status: 'cancelled' },
    { id: 6, date: '2025-05-05', customer: '윤지원', product: '무선이어폰 Pro', category: 'earphones', amount: 129000, status: 'completed' },
    { id: 7, date: '2025-05-01', customer: '정다은', product: '스마트워치 X1', category: 'smartwatch', amount: 299000, status: 'completed' },
  ];

  // Filter data based on active tab
  const filteredData = salesData
    .filter(item => {
      if (activeTab !== 'all' && item.category !== activeTab) {
        return false;
      }

      if (searchQuery) {
        return item.customer.toLowerCase().includes(searchQuery.toLowerCase());
      }

      return true;
    });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };


  const formatCurrency = (amount: number) => {
    return `${new Intl.NumberFormat('ko-KR').format(amount)}원`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ko-KR').format(date);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="mb-8">
          <h1 className="text-xl font-medium text-gray-900">판매 내역</h1>
          <p className="mt-1 text-sm text-gray-500">고객 주문 및 판매 정보를 관리하세요</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="고객명으로 검색"
                className="h-9 pl-9 pr-4 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-[#4990FF] focus:border-[#4990FF]"
              />
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6 overflow-x-auto">
            {PRODUCT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-[#4990FF] text-[#4990FF]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>


        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['주문 번호', '날짜', '고객명', '상품', '금액', '상태', ''].map((header, i) => (
                    <th key={i} className="px-6 py-4 text-left text-xs font-medium text-gray-500">
                      {header && (
                        <div className="flex items-center gap-1">
                          {header}
                          <ArrowUpDown className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        #{item.id.toString().padStart(5, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{formatDate(item.date)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{item.customer}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{item.product}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#4990FF]">{formatCurrency(item.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-1 text-gray-400 hover:text-[#4990FF] rounded-lg hover:bg-gray-100">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            총 {filteredData.length}건 중 {filteredData.length}건 표시
          </p>

          <div className="flex items-center gap-1">
            <button
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-40 hover:bg-gray-100 rounded-full transition-colors"
              disabled={true}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {[1, 2, 3].map((number) => (
              <button
                key={number}
                className={`w-8 h-8 text-sm rounded-full transition-colors ${number === 1
                  ? "bg-[#4990FF] text-white"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {number}
              </button>
            ))}

            <button
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-40 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}