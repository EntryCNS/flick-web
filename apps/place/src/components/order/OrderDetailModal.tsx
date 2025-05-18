"use client";

import { X } from "lucide-react";
import dayjs from "dayjs";
import { OrderDetailResponse } from "@/types/order";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Product } from "@/types/product";

interface OrderDetailModalProps {
  orderId: number;
  onClose: () => void;
}

export default function OrderDetailModal({
  orderId,
  onClose,
}: OrderDetailModalProps) {
  const { data: order, isLoading } = useQuery({
    queryKey: ["orderDetail", orderId],
    queryFn: async () => {
      const { data } = await api.get<OrderDetailResponse>(`/orders/${orderId}`);
      return data;
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data;
    },
    enabled: !!order,
  });

  const getProductName = (productId: number) => {
    const product = products.find((p: Product) => p.id === productId);
    return product?.name || "알 수 없는 상품";
  };

  const getProductPrice = (productId: number) => {
    const product = products.find((p: Product) => p.id === productId);
    return product?.price || 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium">주문 상세</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4990FF]"></div>
            </div>
          ) : order ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-4">주문 정보</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-2 text-gray-500">주문번호</td>
                        <td className="py-2 font-medium text-right">
                          #{order.orderId}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500">주문상태</td>
                        <td className="py-2 text-right">
                          <OrderStatusBadge status={order.status} />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500">결제코드</td>
                        <td className="py-2 font-mono text-right">
                          {order.paymentCode}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500">주문금액</td>
                        <td className="py-2 font-medium text-right">
                          {order.totalAmount.toLocaleString()}원
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500">주문일시</td>
                        <td className="py-2 text-right">
                          {dayjs(order.createdAt).format("YYYY.MM.DD HH:mm")}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500">만료일시</td>
                        <td className="py-2 text-right">
                          {dayjs(order.expiresAt).format("YYYY.MM.DD HH:mm")}
                        </td>
                      </tr>
                      {order.paidAt && (
                        <tr>
                          <td className="py-2 text-gray-500">결제일시</td>
                          <td className="py-2 text-right">
                            {dayjs(order.paidAt).format("YYYY.MM.DD HH:mm")}
                          </td>
                        </tr>
                      )}
                      {order.paidBy && (
                        <tr>
                          <td className="py-2 text-gray-500">결제자 ID</td>
                          <td className="py-2 text-right">{order.paidBy}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-4">주문 상품</h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border border-gray-100 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {getProductName(item.productId)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getProductPrice(item.productId).toLocaleString()}원
                            x {item.quantity}개
                          </div>
                        </div>
                        <div className="font-medium">
                          {(
                            getProductPrice(item.productId) * item.quantity
                          ).toLocaleString()}
                          원
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
                    <span className="font-medium">총 금액</span>
                    <span className="font-bold text-[#4990FF]">
                      {order.totalAmount.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              주문 정보를 불러올 수 없습니다.
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
