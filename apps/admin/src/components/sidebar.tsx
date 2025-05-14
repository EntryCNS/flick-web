"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Store, Receipt, Stamp, HelpCircle, Bell } from "lucide-react";

interface MenuItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

type MenuSection = {
  title?: string;
  items: MenuItem[];
};

const MENUS: MenuSection[] = [
  {
    title: "유저",
    items: [
      {
        href: "/users",
        icon: <Users size={18} className="text-[#4990FF]" />, // 유저 관련 아이콘, 메인 브랜드 컬러
        label: "유저 목록",
      },
      {
        href: "/transcations",
        icon: <Receipt size={18} className="text-[#22C55E]" />, // 거래/영수증 아이콘, 포지티브 색상
        label: "거래 내역",
      }
    ],
  },
  {
    title: "부스",
    items: [
      {
        href: "/booths/approval",
        icon: <Stamp size={18} className="text-[#F97316]" />, // 승인/인증 아이콘, 주의/액션 색상
        label: "부스 승인 / 거부",
      },
      {
        href: "/booths",
        icon: <Store size={18} className="text-[#6366F1]" />, // 부스/상점 아이콘, 보조 브랜드 색상
        label: "부스 목록",
      },
    ]
  },
  {
    title: "기타",
    items: [
      {
        href: "/inquirys",
        icon: <HelpCircle size={18} className="text-[#8B5CF6]" />, // 문의/도움말 아이콘, 특수 색상
        label: "문의"
      },
      {
        href: "/notices",
        icon: <Bell size={18} className="text-[#EF4444]" />, // 알림/공지 아이콘, 중요 색상
        label: "공지사항"
      }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-[250px] h-full bg-[#F8F9FA] font-pretendard border-r border-[#DDE2E5]">
      {MENUS.map((section, sectionIndex) => {
        const isFirstSection = sectionIndex === 0;
        const topMargin = isFirstSection
          ? ""
          : section.title && sectionIndex > 1
          ? "mt-6"
          : "mt-4";

        return (
          <div
            key={sectionIndex}
            className={`px-3 ${isFirstSection ? "pt-4" : ""} ${topMargin}`}
          >
            {section.title && (
              <div className="text-[#868E96] text-xs font-medium mb-1.5 ml-3">
                {section.title}
              </div>
            )}

            <div className="space-y-0.5">
              {section.items.map((item, index) => (
                <SidebarItem
                  key={index}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname === item.href}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function SidebarItem({
  href,
  icon,
  label,
  active = false,
}: SidebarItemProps): React.ReactElement {
  return (
    <Link href={href} className="block">
      <div
        className={cn(
          "flex items-center py-2.5 px-3 rounded-md text-sm font-medium transition-colors",
          active
            ? "text-[#4990FF] bg-white"
            : "text-[#4E5968] hover:bg-white hover:text-[#4990FF]"
        )}
      >
        <div className="mr-3">{icon}</div>
        {label}
      </div>
    </Link>
  );
}
