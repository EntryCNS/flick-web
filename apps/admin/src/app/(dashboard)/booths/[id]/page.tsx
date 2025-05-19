"use client";

import {
  ArrowLeft,
  BarChart2,
  Package,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { use } from "react";
import { useRouter } from "next/navigation";

type ProductStatus = "AVAILABLE" | "SOLD_OUT" | "HIDDEN";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
  status: ProductStatus;
  sortOrder: number;
};

type Booth = {
  id: string;
  name: string;
  description: string;
  totalSales: number;
  products: Product[];
};

const StatusBadge = ({ status }: { status: ProductStatus }) => {
  const styles = {
    AVAILABLE: {
      bg: 'bg-[#4990FF]/10',
      text: 'text-[#4990FF]',
      border: 'border-[#4990FF]/20',
      label: '판매중',
      icon: <CheckCircle className="w-3 h-3 mr-1" />
    },
    HIDDEN: {
      bg: 'bg-gray-100',
      text: 'text-gray-500',
      border: 'border-gray-200',
      label: '비활성화',
      icon: <AlertCircle className="w-3 h-3 mr-1" />
    },
    SOLD_OUT: {
      bg: 'bg-red-50',
      text: 'text-red-500',
      border: 'border-red-200',
      label: '품절',
      icon: <AlertCircle className="w-3 h-3 mr-1" />
    }
  };

  const style = styles[status];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {style.icon}
      {style.label}
    </span>
  );
};

export default function BoothDetailPage({ params: ParamPromise }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const params = use(ParamPromise)
  const boothId = params.id
  const { data: boothData, isLoading } = useQuery<Booth>({
    queryKey: ["booth", boothId],
    queryFn: async () => {
      const { data } = await api.get(`/booths/${boothId}`);
      return data;
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-scree flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4990FF]"></div>
      </div>
    );
  }

  if (!boothData) {
    return (
      <div className="min-h-scree flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            부스를 찾을 수 없습니다
          </h2>
          <p className="mt-2 text-gray-500">
            요청하신 부스 정보를 불러올 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-scree">
      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-medium text-gray-900">공지사항</h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-medium text-gray-900">{boothData.name}</h2>
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                  ID: {boothData.id}
                </span>
              </div>
              {boothData.description && (
                <p className="text-sm text-gray-600 max-w-2xl">{boothData.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#4990FF]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#4990FF]/10 rounded-lg">
                    <ShoppingBag className="w-4 h-4 text-[#4990FF]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">총 제품</div>
                    <div className="text-base font-medium text-gray-900">
                      {boothData.products.length}개
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#4990FF]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#4990FF]/10 rounded-lg">
                    <Package className="w-4 h-4 text-[#4990FF]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">판매중</div>
                    <div className="text-base font-medium text-gray-900">
                      {boothData.products.filter(p => p.status === "AVAILABLE").length}개
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#4990FF]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#4990FF]/10 rounded-lg">
                    <BarChart2 className="w-4 h-4 text-[#4990FF]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">총 매출</div>
                    <div className="text-base font-medium text-gray-900">
                      {formatCurrency(boothData.totalSales)}원
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden mb-10">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-medium text-gray-900">상품 목록</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-r border-l border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">제품명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">가격</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">재고</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">정렬 순서</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 border-l border-r border-b">
                {boothData.products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#4990FF]">
                        {formatCurrency(product.price)}원
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-sm font-medium",
                        product.stock > 5 ? "text-gray-900" : 
                        product.stock > 0 ? "text-orange-500" : "text-red-500"
                      )}>
                        {product.stock}개
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{product.sortOrder}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-900">재고 부족 제품</h4>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {boothData.products.filter(p => p.stock < 5).map((product) => (
                  <div key={`lowstock-${product.id}`} className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg overflow-hidden relative">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </div>
                      <div className="text-sm text-orange-500">
                        {product.stock}개
                      </div>
                    </div>
                  </div>
                ))}
                {boothData.products.filter(p => p.stock < 5).length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-4">
                    재고 부족 제품이 없습니다
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-900">상태별 제품 수</h4>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#4990FF]" />
                    <span className="text-sm text-gray-600">판매중</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {boothData.products.filter(p => p.status === "AVAILABLE").length}개
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="text-sm text-gray-600">비활성화</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {boothData.products.filter(p => p.status === "HIDDEN").length}개
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-600">품절</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {boothData.products.filter(p => p.status === "SOLD_OUT").length}개
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}