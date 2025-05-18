"use client"

import { useState } from 'react';
import { ArrowLeft, Edit, Trash2, BarChart2, Package, ShoppingBag, AlertCircle, CheckCircle } from 'lucide-react';

// 타입 정의
type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
  status: 'active' | 'inactive' | 'soldout';
  sortOrder: number;
};

type Booth = {
  id: string;
  name: string;
  description: string;
  totalSales: number;
  products: Product[];
};

// 더미 데이터
const boothData: Booth = {
  id: "b001",
  name: "디지털 가전 부스",
  description: "최신 전자제품과 가전제품을 판매하는 프리미엄 부스입니다. 혁신적인 기술 제품들을 만나보세요.",
  totalSales: 2458000,
  products: [
    {
      id: "p001",
      name: "스마트 워치 프로",
      price: 249000,
      description: "건강 모니터링과 알림 기능이 탑재된 최신형 스마트 워치",
      imageUrl: "/api/placeholder/400/400",
      stock: 15,
      status: "active",
      sortOrder: 1
    },
    {
      id: "p002",
      name: "무선 이어버드",
      price: 189000,
      description: "노이즈 캔슬링 기능을 갖춘 프리미엄 무선 이어버드",
      imageUrl: "/api/placeholder/400/400",
      stock: 8,
      status: "active",
      sortOrder: 2
    },
    {
      id: "p003",
      name: "휴대용 블루투스 스피커",
      price: 79000,
      description: "방수 기능과 10시간 배터리 수명의 휴대용 스피커",
      imageUrl: "/api/placeholder/400/400",
      stock: 0,
      status: "soldout",
      sortOrder: 3
    },
    {
      id: "p004",
      name: "스마트홈 허브",
      price: 129000,
      description: "스마트홈 기기를 통합 제어하는 인공지능 허브",
      imageUrl: "/api/placeholder/400/400",
      stock: 12,
      status: "inactive",
      sortOrder: 4
    }
  ]
};

// 상태 배지 컴포넌트
const StatusBadge = ({ status }) => {
  const badgeStyles = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    soldout: "bg-red-100 text-red-800 border-red-200"
  };

  const statusLabels = {
    active: "판매중",
    inactive: "비활성화",
    soldout: "품절"
  };

  const icons = {
    active: <CheckCircle className="w-4 h-4 mr-1" />,
    inactive: <AlertCircle className="w-4 h-4 mr-1" />,
    soldout: <AlertCircle className="w-4 h-4 mr-1" />
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md border ${badgeStyles[status]}`}>
      {icons[status]}
      {statusLabels[status]}
    </span>
  );
};

export default function BoothDetailPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* 상단 네비게이션 바 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">부스 상세</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 부스 개요 정보 (축소된 형태) */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap justify-between items-start">
            <div className="mr-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900">{boothData.name}</h2>
              <p className="mt-1 text-sm text-gray-500">ID: {boothData.id}</p>
              <p className="mt-2 text-sm text-gray-600 max-w-2xl">{boothData.description}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="bg-blue-50 rounded-lg p-3 flex items-center">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <div className="ml-2">
                  <div className="text-xs font-medium text-gray-500">총 제품</div>
                  <div className="text-lg font-semibold text-gray-900">{boothData.products.length}개</div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 flex items-center">
                <Package className="w-5 h-5 text-green-600" />
                <div className="ml-2">
                  <div className="text-xs font-medium text-gray-500">판매중</div>
                  <div className="text-lg font-semibold text-gray-900">{boothData.products.filter(p => p.status === 'active').length}개</div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 flex items-center">
                <BarChart2 className="w-5 h-5 text-purple-600" />
                <div className="ml-2">
                  <div className="text-xs font-medium text-gray-500">총 매출</div>
                  <div className="text-lg font-semibold text-gray-900">{formatCurrency(boothData.totalSales)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 제품 관리 섹션 - 메인 콘텐츠 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">판매 상품 목록</h3>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                필터
              </button>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                + 제품 추가
              </button>
            </div>
          </div>
          
          {/* 제품 목록 테이블 */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제품명</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재고</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">정렬 순서</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {boothData.products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(product.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${product.stock > 5 ? 'text-gray-900' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
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
          
          {/* 페이지네이션 */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">이전</button>
              <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">다음</button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  총 <span className="font-medium">{boothData.products.length}</span> 개 항목 중 <span className="font-medium">1</span> - <span className="font-medium">{boothData.products.length}</span> 표시
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md" aria-label="Pagination">
                  <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                    <span className="sr-only">이전</span>
                    <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button className="relative inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                    1
                  </button>
                  <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                    <span className="sr-only">다음</span>
                    <ArrowLeft className="h-5 w-5 rotate-180" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
        
        {/* 제품 통계 요약 */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">제품 통계</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">인기 제품</h4>
              <div className="space-y-2">
                {boothData.products.slice(0, 3).map(product => (
                  <div key={`popular-${product.id}`} className="flex items-center">
                    <div className="h-8 w-8 bg-gray-100 rounded-md overflow-hidden">
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="ml-2 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(product.price)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">재고 부족 제품</h4>
              <div className="space-y-2">
                {boothData.products.filter(p => p.stock < 5).map(product => (
                  <div key={`lowstock-${product.id}`} className="flex items-center">
                    <div className="h-8 w-8 bg-gray-100 rounded-md overflow-hidden">
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="ml-2 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                    </div>
                    <div className="text-sm font-medium text-orange-600">{product.stock}개</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">상태별 제품 수</h4>
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-gray-600">판매중</span>
                  </div>
                  <span className="text-sm font-medium">{boothData.products.filter(p => p.status === 'active').length}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                    <span className="text-sm text-gray-600">비활성화</span>
                  </div>
                  <span className="text-sm font-medium">{boothData.products.filter(p => p.status === 'inactive').length}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm text-gray-600">품절</span>
                  </div>
                  <span className="text-sm font-medium">{boothData.products.filter(p => p.status === 'soldout').length}개</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
  );
}