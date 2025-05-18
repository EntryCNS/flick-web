"use client";

import { useState } from "react";
import { Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface TransactionType {
  id: number;
  user: {
    id: number
    name: string;
  }
  type: "CHARGE" | "PAYMENT";
  amount: number;
  balanceAfter: number;
  booth: {
    name: string;
  },
  product: {
    name: string;
  },
  memo: string;
  createdAt: string[];
}

interface PaginatedResponse {
  content: TransactionType[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

const formatDateTime = (dateArr: string[]) => {
  const [year, month, day, hour, minute, second] = dateArr;
  const date = new Date(+year, +month - 1, +day, +hour, +minute, +second);
  return {
    date: format(date, 'MM.dd', { locale: ko }),
    time: format(date, 'HH:mm', { locale: ko })
  };
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('ko-KR') + '원';
};

export default function TransactionsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 15;

  const { data, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ['transactions', currentPage],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse>(`/transactions`, {
        params: {
          page: currentPage,
          size: itemsPerPage,
        }
      });
      return data;
    },
  });

  const transactions = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const getPageNumbers = () => {
    const maxPages = 5;
    const halfMax = Math.floor(maxPages / 2);
    
    let startPage = Math.max(0, currentPage - halfMax);
    let endPage = Math.min(totalPages - 1, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(0, endPage - maxPages + 1);
    }
    
    return Array.from(
      { length: Math.min(maxPages, totalPages) }, 
      (_, i) => startPage + i
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-5 py-7">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-xl font-medium text-gray-900">거래 내역</h1>
          <div className="flex items-center h-7 px-2 bg-[#4990FF]/10 rounded">
            <span className="text-xs font-medium text-[#4990FF]">
              총 {totalElements}건
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">번호</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">유형</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">사용자</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500">금액/잔액</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500">일시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center">
                      <Loader2 className="mx-auto animate-spin text-gray-400 w-8 h-8" />
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center text-gray-500">
                      거래 내역이 없습니다
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => {
                    const datetime = formatDateTime(transaction.createdAt);
                    const isCharge = transaction.type === "CHARGE";

                    return (
                      <tr
                        key={transaction.id}
                        onClick={() => router.push(`/transactions/${transaction.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            #{transaction.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                            isCharge ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                          )}>
                            {isCharge ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                            {isCharge ? "충전" : "결제"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900 group-hover:text-[#4990FF]">
                            {transaction.user.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div>
                            <span className={cn(
                              "text-sm font-medium",
                              isCharge ? "text-blue-600" : "text-red-600"
                            )}>
                              {isCharge ? "+" : "-"}{formatCurrency(transaction.amount)}
                            </span>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {formatCurrency(transaction.balanceAfter)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm text-gray-900">{datetime.date}</span>
                            <span className="text-xs text-gray-500 mt-0.5">{datetime.time}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-40 hover:bg-gray-100 rounded-full transition-colors"
            >
              &lt;
            </button>
            
            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={cn(
                  "w-8 h-8 text-sm rounded-full transition-colors",
                  currentPage === pageNum
                    ? "bg-[#4990FF] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {pageNum + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-40 hover:bg-gray-100 rounded-full transition-colors"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}