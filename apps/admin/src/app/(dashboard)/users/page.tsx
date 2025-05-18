"use client";

import { useState } from "react";
import { Search, Filter, X, ChevronDown, User, CheckCircle, Loader2 } from 'lucide-react';
import { AmountModal } from "@/components/users/AmountModal";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTokenStore } from "@/stores/token";

type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

interface UserType {
  id: number;
  name: string;
  role: UserRole;
  grade?: number;
  room?: number;
  number?: number;
  balance: number;
}

interface PaginatedResponse {
  content: UserType[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

interface FilterType {
  category: string;
  value: string[];
}

interface FilterGroupType {
  category: string;
  options: string[];
}

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ['users', currentPage],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse>(`/users?page=${currentPage - 1}&size=${ITEMS_PER_PAGE}`);
      return data;
    },
  });

  const users = data?.content || [];
  const totalPages = data?.totalPages || 1;

  const filterOptions: FilterGroupType[] = [
    { category: '역할', options: ['STUDENT', 'TEACHER'] },
    { category: '학년', options: ['1학년', '2학년', '3학년'] },
    { category: '반', options: ['1반', '2반', '3반', '4반'] },
  ];

  const handleFilterAdd = (category: string, value: string) => {
    setActiveFilters(prev => {
      // 이미 해당 카테고리가 있는지 확인
      const existingFilterIndex = prev.findIndex(filter => filter.category === category);

      if (existingFilterIndex >= 0) {
        // 이미 해당 카테고리가 있으면 값만 추가
        const newFilters = [...prev];
        // 이미 해당 값이 있는지 확인하고, 없으면 추가
        if (!newFilters[existingFilterIndex].value.includes(value)) {
          newFilters[existingFilterIndex].value.push(value);
        }
        return newFilters;
      } else {
        // 해당 카테고리가 없으면 새로 추가
        return [...prev, { category, value: [value] }];
      }
    });
    setIsFilterMenuOpen(false);
    setCurrentPage(1);
  };

  const handleFilterRemove = (category: string, value: string) => {
    setActiveFilters(prev => {
      const newFilters = prev.map(filter => {
        if (filter.category === category) {
          // 해당 값만 제거
          const newValues = filter.value.filter(v => v !== value);
          return { ...filter, value: newValues };
        }
        return filter;
      });

      // 값이 없는 필터는 제거
      return newFilters.filter(filter => filter.value.length > 0);
    });
    setCurrentPage(1);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters = activeFilters.every(filter => {
      if (filter.category === '역할') return filter.value.some(role => user.role.includes(role));
      if (filter.category === '학년') return filter.value.some(grade => user.grade === parseInt(grade));
      if (filter.category === '반') return filter.value.some(room => user.room === parseInt(room));
      return true;
    });
    return matchesSearch && matchesFilters;
  });

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">유저 목록</h1>
        <p className="text-gray-500 mt-1.5">클릭하여 유저의 금액을 충전할 수 있습니다</p>
      </div>

      <div className="bg-white">

        <div className="py-4 mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="이름으로 검색"
              className="w-full h-10 pl-10 pr-4 bg-gray-50 rounded-lg text-sm 
                        focus:outline-none focus:ring-2 focus:ring-[#4990FF]/20 focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="flex items-center gap-2 h-10 px-4 bg-gray-50 rounded-lg text-sm font-medium
                          hover:bg-gray-100 transition-colors"
            >
              <Filter size={16} />
              필터
              <ChevronDown size={14} className={cn("transition-transform", isFilterMenuOpen && "rotate-180")} />
            </button>

            {isFilterMenuOpen && (
              <div className="absolute mt-2 right-0 z-10 w-64 bg-white rounded-lg shadow-lg 
                            border border-gray-100 py-2">
                {filterOptions.map((group, i) => (
                  <div key={i} className="py-1">
                    <div className="px-3 py-1.5 text-sm font-medium text-gray-500">{group.category}</div>
                    {group.options.map((opt, j) => {
                      const isSelected = activeFilters.some(
                        f => f.category === group.category && f.value.includes(opt)
                      );
                      return (
                        <button
                          key={j}
                          className={cn(
                            "w-full px-3 py-2 text-sm text-left flex items-center justify-between",
                            isSelected
                              ? "text-[#4990FF] bg-blue-50"
                              : "hover:bg-gray-50"
                          )}
                          onClick={() => !isSelected && handleFilterAdd(group.category, opt)}
                          disabled={isSelected}
                        >
                          {opt}
                          {isSelected && <CheckCircle size={14} />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                filter.value.map((val, i) => (
                  <div
                    key={`${filter.category}-${val}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-sm"
                  >
                    <span className="text-[#4990FF]">{filter.category}:</span>
                    <span className="text-gray-700">{val}</span>
                    <button
                      onClick={() => handleFilterRemove(filter.category, val)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              ))}
            </div>
          )}
        </div>

        <div className="border border-gray-100 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">이름</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">역할</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">학번</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">잔액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-20">
                    <Loader2 className="mx-auto animate-spin text-gray-400" size={32} />
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedUser(user);
                      setModalOpen(true);
                    }}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        user.role === 'STUDENT'
                          ? "bg-[#4990FF]/10 text-[#4990FF]"
                          : "bg-emerald-50 text-emerald-600"
                      )}>
                        <User size={12} className="mr-1" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.grade && user.room && user.number
                        ? `${user.grade}${user.room}${user.number.toString().padStart(2, '0')}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-[#4990FF]">
                        {user.balance.toLocaleString()}원
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-gray-500">
                    검색 결과가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {filteredUsers.length > 0 && (
            <div className="px-6 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                페이지 {currentPage} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg transition-colors",
                    currentPage === 1
                      ? "text-gray-400 bg-gray-100"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  이전
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg transition-colors",
                    currentPage === totalPages
                      ? "text-gray-400 bg-gray-100"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 모달 */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <AmountModal user={selectedUser} onClose={() => {
            setModalOpen(false);
            setSelectedUser(null);
          }} />
        </div>
      )}
    </div>
  );
}