"use client";

import React, { PropsWithChildren } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@repo/ui/header";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col h-screen w-full bg-white font-pretendard">
      <Header name="place" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-white">{children}</main>
      </div>
    </div>
  );
}
