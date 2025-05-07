"use client";

import { useState } from "react";
import { RefreshCw, Loader2, Filter } from "lucide-react";
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
  const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    PENDING: { 
      label: "대기중", 
      className: "bg-yellow-50 text-yellow-600 border-yellow-200" 
    },
    PAID: { 
      label: "결제완료", 
      className: "bg-green-50 text-green-600 border-green-200" 
    },
    COMPLETED: { 
      label: "처리완료", 
      className: "bg-blue-50 text-blue-600 border-blue-200" 
    },
    CANCELED: { 
      label: "취소됨", 
      className: "bg-gray-50 text-gray-600 border-gray-200" 
    },
    EXPIRED: { 
      label: "만료됨", 
      className: "bg-red-50 text-red-600 border-red-200" 
    },
  };

  const config = statusConfig[status];
  
  return (
    <span className={`text-xs px-2 py-1 rounded border ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function OrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");

  const { data: orders = [], isLoading, refetch } = useQuery<OrderResponse[]>({
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
    .filter(order => !statusFilter || order.status === statusFilter)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === "DESC" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-medium">주문 관리</h1>
          <p className="text-gray-500 mt-1">
            총 {filteredOrders.length}개의 주문
          </p>
        </div>
        <Button 
          onClick={() => refetch()}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <RefreshCw size={18} className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      <div className="border rounded-lg bg-white p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          onClick={() => setSortDirection(prev => prev === "ASC" ? "DESC" : "ASC")}
          variant="outline"
        >
          {sortDirection === "DESC" ? "최신순" : "오래된순"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="border rounded-lg bg-white overflow-hidden">
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm">
                    <th className="px-4 py-3 text-left font-medium">주문번호</th>
                    <th className="px-4 py-3 text-left font-medium">키오스크번호</th>
                    <th className="px-4 py-3 text-left font-medium">상태</th>
                    <th className="px-4 py-3 text-left font-medium">주문금액</th>
                    <th className="px-4 py-3 text-left font-medium">주문일시</th>
                    <th className="px-4 py-3 text-left font-medium">만료일시</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => handleViewDetails(order.id)}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        #{order.id}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {order.boothOrderNumber}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {order.totalAmount.toLocaleString()}원
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {dayjs(order.createdAt).format("YYYY.MM.DD HH:mm")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {dayjs(order.expiresAt).format("YYYY.MM.DD HH:mm")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              조회된 주문이 없습니다
            </div>
          )}
        </div>
      )}

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}