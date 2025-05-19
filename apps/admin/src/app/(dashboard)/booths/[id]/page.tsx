"use client";

import {
  ArrowLeft,
  Edit,
  Trash2,
  BarChart2,
  Package,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/api";

type ProductStatus = "ACTIVE" | "SOLD_OUT" | "HIDDEN";

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
  const badgeStyles = {
    ACTIVE: "bg-green-100 text-green-800 border-green-200",
    HIDDEN: "bg-gray-100 text-gray-800 border-gray-200",
    SOLD_OUT: "bg-red-100 text-red-800 border-red-200",
  };

  const statusLabels = {
    ACTIVE: "판매중",
    HIDDEN: "비활성화",
    SOLD_OUT: "품절",
  };

  const icons = {
    ACTIVE: <CheckCircle className="w-4 h-4 mr-1" />,
    HIDDEN: <AlertCircle className="w-4 h-4 mr-1" />,
    SOLD_OUT: <AlertCircle className="w-4 h-4 mr-1" />,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md border ${badgeStyles[status]}`}
    >
      {icons[status]}
      {statusLabels[status]}
    </span>
  );
};

export default function BoothDetailPage() {
  const params = useParams();
  const boothId = params.boothId as string;

  const { data: boothData, isLoading } = useQuery<Booth>({
    queryKey: ["booth", boothId],
    queryFn: async () => {
      const { data } = await api.get(`/booths/${boothId}`);
      return data;
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!boothData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    <div className="bg-white min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">
                부스 상세
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap justify-between items-start">
            <div className="mr-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {boothData.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">ID: {boothData.id}</p>
              <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                {boothData.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="bg-blue-50 rounded-lg p-3 flex items-center">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <div className="ml-2">
                  <div className="text-xs font-medium text-gray-500">
                    총 제품
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {boothData.products.length}개
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 flex items-center">
                <Package className="w-5 h-5 text-green-600" />
                <div className="ml-2">
                  <div className="text-xs font-medium text-gray-500">
                    판매중
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {
                      boothData.products.filter((p) => p.status === "ACTIVE")
                        .length
                    }
                    개
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 flex items-center">
                <BarChart2 className="w-5 h-5 text-purple-600" />
                <div className="ml-2">
                  <div className="text-xs font-medium text-gray-500">
                    총 매출
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(boothData.totalSales)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              판매 상품 목록
            </h3>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                필터
              </button>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                + 제품 추가
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      제품명
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      가격
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      재고
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      상태
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      정렬 순서
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {boothData.products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden relative">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 48px"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${product.stock > 5 ? "text-gray-900" : product.stock > 0 ? "text-orange-600" : "text-red-600"}`}
                        >
                          {product.stock}개
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sortOrder}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900 border border-gray-200 rounded p-1">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 border border-gray-200 rounded p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                이전
              </button>
              <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                다음
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  총{" "}
                  <span className="font-medium">
                    {boothData.products.length}
                  </span>{" "}
                  개 항목 중 <span className="font-medium">1</span> -{" "}
                  <span className="font-medium">
                    {boothData.products.length}
                  </span>{" "}
                  표시
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md"
                  aria-label="Pagination"
                >
                  <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                    <span className="sr-only">이전</span>
                    <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button className="relative inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                    1
                  </button>
                  <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                    <span className="sr-only">다음</span>
                    <ArrowLeft
                      className="h-5 w-5 rotate-180"
                      aria-hidden="true"
                    />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">제품 통계</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                인기 제품
              </h4>
              <div className="space-y-2">
                {boothData.products.slice(0, 3).map((product) => (
                  <div
                    key={`popular-${product.id}`}
                    className="flex items-center"
                  >
                    <div className="h-8 w-8 bg-gray-100 rounded-md overflow-hidden relative">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 32px"
                      />
                    </div>
                    <div className="ml-2 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(product.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                재고 부족 제품
              </h4>
              <div className="space-y-2">
                {boothData.products
                  .filter((p) => p.stock < 5)
                  .map((product) => (
                    <div
                      key={`lowstock-${product.id}`}
                      className="flex items-center"
                    >
                      <div className="h-8 w-8 bg-gray-100 rounded-md overflow-hidden relative">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 32px"
                        />
                      </div>
                      <div className="ml-2 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-orange-600">
                        {product.stock}개
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                상태별 제품 수
              </h4>
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-gray-600">판매중</span>
                  </div>
                  <span className="text-sm font-medium">
                    {
                      boothData.products.filter((p) => p.status === "ACTIVE")
                        .length
                    }
                    개
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                    <span className="text-sm text-gray-600">비활성화</span>
                  </div>
                  <span className="text-sm font-medium">
                    {
                      boothData.products.filter((p) => p.status === "HIDDEN")
                        .length
                    }
                    개
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm text-gray-600">품절</span>
                  </div>
                  <span className="text-sm font-medium">
                    {
                      boothData.products.filter((p) => p.status === "SOLD_OUT")
                        .length
                    }
                    개
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
