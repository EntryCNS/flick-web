"use client";

import Link from "next/link";
import Image from "next/image";

export function Header({ name }: { name: string }) {
  return (
    <header className="h-16 border-b border-[#DDE2E5] bg-white px-6 flex items-center justify-between font-pretendard">
      <div className="flex items-center">
        <Image src="/logo.png" alt="Flick Place" width={28} height={28} />
        <span className="ml-2.5 text-lg font-extrabold text-[#212529]">
          flick {name}
        </span>
      </div>

      <Link
        href="/login"
        className="text-[#6B7280] text-sm hover:text-[#4990FF]"
      >
        로그아웃
      </Link>
    </header>
  );
}
