"use client";

import { Wallet, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface StatisticType {
  totalSales: number;
  totalOrders: number;
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("ko-KR") + "원";
};

const formatCount = (count: number) => {
  return count.toLocaleString("ko-KR") + "건";
};

const statsConfig = [
  {
    key: "totalSales",
    title: "총 판매 금액",
    icon: Wallet,
    color: "text-[#4990FF]",
    bgColor: "bg-[#4990FF]/10",
    description: "판매한 상품의 전체 금액",
    format: formatCurrency,
  },
  {
    key: "totalOrders",
    title: "총 거래 건수",
    icon: CreditCard,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    description: "전체 거래 건수",
    format: formatCount,
  },
] as const;

export default function PlaceDashboard() {
  const { data: statistics } = useQuery<StatisticType>({
    queryKey: ["statistics"],
    queryFn: async () => {
      const { data } = await api.get<StatisticType>(`/statistics`);
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-5 py-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-xl font-medium text-gray-900">대시보드</h1>
          <div className="flex items-center h-7 px-2 bg-[#4990FF]/10 rounded">
            <span className="text-xs font-medium text-[#4990FF]">실시간</span>
          </div>
        </div>

        {/* 통계 카드 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statsConfig.map((stat) => (
            <div
              key={stat.key}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">
                  {stat.title}
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics ? stat.format(statistics[stat.key]) : "-"}
                </p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
