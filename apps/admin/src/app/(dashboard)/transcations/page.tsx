"use client"

import { useState } from "react";
import { Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface TransactionType {
  id: number;
  userId: number;
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
  createdAt: string;
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

const formatDate = (year: string, month: string, day: string) => {
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
};

const formatTime = (hour: string, minute: string, second: string) => {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('ko-KR') + '원';
};

export default function TransactionsPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const { data, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ['transactions', currentPage],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse>(`/transactions`);
      return data;
    },
  });

  const transactions = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">거래 내역</h1>
          <p className="text-gray-500 mt-1">
            전체 거래 내역을 확인할 수 있습니다
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">사용자 ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">거래 유형</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">거래 금액</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">거래 후 잔액</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">거래 일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="mx-auto animate-spin text-gray-400" size={36} />
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                    거래 내역이 없습니다
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const date = formatDate(transaction.createdAt[0], transaction.createdAt[1], transaction.createdAt[2]);
                  const time = formatTime(transaction.createdAt[3], transaction.createdAt[4], transaction.createdAt[5]);
                  const isCharge = transaction.type === "CHARGE";

                  return (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {transaction.userId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
                            isCharge
                              ? "bg-blue-50 text-blue-600"
                              : "bg-red-50 text-red-600"
                          )}>
                            {isCharge ? (
                              <ArrowDownRight size={14} />
                            ) : (
                              <ArrowUpRight size={14} />
                            )}
                            {isCharge ? "충전" : "결제"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-sm font-medium",
                          isCharge ? "text-blue-600" : "text-red-600"
                        )}>
                          {isCharge ? "+" : "-"}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {formatCurrency(transaction.balanceAfter)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">{date}</span>
                          <span className="text-xs text-gray-500">{time}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            총 <span className="font-medium text-gray-900">{totalElements}</span>개의 거래
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className={cn(
                "inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 transition-colors",
                currentPage === 1
                  ? "text-gray-300"
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              &lt;
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={cn(
                  "inline-flex items-center justify-center h-8 min-w-[2rem] rounded-lg text-sm font-medium transition-colors",
                  currentPage === i
                    ? "bg-[#4990FF] text-white"
                    : "text-gray-500 hover:bg-gray-50 border border-gray-200"
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className={cn(
                "inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 transition-colors",
                currentPage === totalPages - 1
                  ? "text-gray-300"
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}