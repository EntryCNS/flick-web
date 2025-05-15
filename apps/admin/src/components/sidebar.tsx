"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Store, Receipt, Stamp, HelpCircle, Bell, Download } from "lucide-react";

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
    items: [
      {
        href: "/",
        icon: <Users size={18} className="text-[#4990FF]" />,
        label: "대시 보드",
      }
    ]
  },
  {
    title: "유저",
    items: [
      {
        href: "/users",
        icon: <Users size={18} className="text-[#4990FF]" />,
        label: "유저 목록",
      },
      {
        href: "/transactions",
        icon: <Receipt size={18} className="text-[#22C55E]" />,
        label: "거래 내역",
      }
    ],
  },
  {
    title: "부스",
    items: [
      {
        href: "/booths/approval",
        icon: <Stamp size={18} className="text-[#F97316]" />,
        label: "부스 승인 / 거부",
      },
      {
        href: "/booths",
        icon: <Store size={18} className="text-[#6366F1]" />,
        label: "부스 목록",
      },
    ]
  },
  {
    title: "기타",
    items: [
      {
        href: "/inquiries",
        icon: <HelpCircle size={18} className="text-[#8B5CF6]" />,
        label: "문의"
      },
      {
        href: "/notices",
        icon: <Bell size={18} className="text-[#EF4444]" />,
        label: "공지사항"
      }
    ]
  },
  {
    items: [
      {
        href: '/download',
        icon: <Download size={18} className="text-[#8B5CF6]" />,
        label: "다운로드"
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
