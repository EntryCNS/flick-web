"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import api from "@/lib/api";
import OrderDetailModal from "@/components/order/OrderDetailModal";
import { Button } from "@/components/ui/button";

type OrderStatus = "PENDING" | "PAID" | "COMPLETED" | "CANCELED" | "EXPIRED";

interface OrderResponse {
  id: number;
  userId: number;
  boothOrderNumber: number;
  totalAmount: number;
  status: OrderStatus;
  expiresAt: string;
  paidAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const statusConfig: Record<
    OrderStatus,
    { label: string; className: string }
  > = {
    PENDING: {
      label: "대기중",
      className: "bg-[#4990FF]/10 text-[#4990FF] border-[#4990FF]/20",
    },
    PAID: {
      label: "결제완료",
      className: "bg-green-50 text-green-600 border-green-200",
    },
    COMPLETED: {
      label: "처리완료",
      className: "bg-blue-50 text-blue-600 border-blue-200",
    },
    CANCELED: {
      label: "숨김",
      className: "bg-gray-50 text-gray-500 border-gray-200",
    },
    EXPIRED: {
      label: "만료됨",
      className: "bg-red-50 text-red-600 border-red-200",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default function OrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");

  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useQuery<OrderResponse[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await api.get<OrderResponse[]>("/orders");
      return data;
    },
  });

  const handleViewDetails = (orderId: number): void => {
    setSelectedOrderId(orderId);
  };

  const handleCloseModal = (): void => {
    setSelectedOrderId(null);
  };

  const filteredOrders = orders
    .filter((order) => !statusFilter || order.status === statusFilter)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === "DESC" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-gray-900">주문 관리</h1>
            <div className="flex items-center h-7 px-2 bg-[#4990FF]/10 rounded">
              <span className="text-xs font-medium text-[#4990FF]">
                총 {filteredOrders.length}건
              </span>
            </div>
          </div>
          <Button
            onClick={() => refetch()}
            className="h-9 px-4 bg-[#4990FF] hover:bg-[#4990FF]/90 text-white text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            새로고침
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OrderStatus | "")
              }
              className="h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:border-[#4990FF]"
            >
              <option value="">모든 상태</option>
              <option value="PENDING">대기중</option>
              <option value="PAID">결제완료</option>
              <option value="COMPLETED">처리완료</option>
              <option value="CANCELED">취소됨</option>
              <option value="EXPIRED">만료됨</option>
            </select>
          </div>

          <Button
            onClick={() =>
              setSortDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"))
            }
            variant="outline"
            className="h-9 px-4 text-sm border-gray-200 hover:bg-gray-100"
          >
            {sortDirection === "DESC" ? "최신순" : "오래된순"}
          </Button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="px-6 py-24 text-center">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400" />
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
                      주문번호
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
                      키오스크번호
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
                      상태
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
                      주문금액
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
                      주문일시
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">
                      만료일시
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => handleViewDetails(order.id)}
                      className="hover:bg-gray-50 cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          #{order.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 group-hover:text-[#4990FF]">
                          {order.boothOrderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {order.totalAmount.toLocaleString()}원
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {dayjs(order.createdAt).format("YYYY.MM.DD HH:mm")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {dayjs(order.expiresAt).format("YYYY.MM.DD HH:mm")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-24 text-center text-gray-500">
              조회된 주문이 없습니다
            </div>
          )}
        </div>

        {selectedOrderId && (
          <OrderDetailModal
            orderId={selectedOrderId}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}
