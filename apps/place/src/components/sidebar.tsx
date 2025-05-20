"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, ShoppingBag, FileText } from "lucide-react";

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
    title: "매출 리포트",
    items: [
      {
        href: "/",
        icon: <BarChart3 size={18} className="text-[#4990FF]" />,
        label: "매출현황",
      },
    ],
  },
  {
    title: "상품관리",
    items: [
      {
        href: "/products",
        icon: <ShoppingBag size={18} className="text-[#20C997]" />,
        label: "상품 목록",
      },
    ],
  },
  {
    title: "키오스크 관리",
    items: [
      {
        href: "/kiosks",
        icon: <ShoppingBag size={18} className="text-[#20C997]" />,
        label: "키오스크 등록",
      },
    ],
  },
  {
    title: "주문 관리",
    items: [
      {
        href: "/orders",
        icon: <ShoppingBag size={18} className="text-[#20C997]" />,
        label: "주문 목록",
      },
    ],
  },
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
