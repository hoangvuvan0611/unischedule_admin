"use client";

import { Bell, Menu, Search, Square } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/layoutContext";

const routeLabels: Record<string, string> = {
  "/": "Tổng quan",
  "/accounts": "Người dùng",
  "/logs": "Phiên truy cập",
  "/batches": "Thiết bị",
  "/student": "Hành vi",
};

export default function MyNavbar() {
  const pathname = usePathname();
  const { toggle } = useSidebar();
  const label = routeLabels[pathname] ?? "Tổng quan";

  return (
    <header className="flex h-[76px] items-center justify-between gap-4 border-b border-neutral-200 bg-[#fbfaf6] px-5 lg:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-neutral-700 hover:bg-neutral-100"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="truncate text-lg font-semibold text-neutral-800">
          Admin / {label}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="hidden h-12 w-[360px] items-center gap-3 rounded-[10px] border border-neutral-200 bg-white px-4 shadow-[0_1px_0_rgba(15,23,42,0.04)] md:flex">
          <Search className="h-5 w-5 text-neutral-500" />
          <input
            className="min-w-0 flex-1 bg-transparent text-base font-semibold text-neutral-900 outline-none placeholder:text-neutral-500"
            placeholder="Tìm username, ID..."
          />
        </label>
        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-[8px] text-neutral-700 hover:bg-neutral-100 sm:inline-flex"
          aria-label="Thông báo"
        >
          <Bell className="h-5 w-5" />
        </button>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
          AD
        </div>
        <Square className="hidden h-4 w-4 text-neutral-500 lg:block" />
      </div>
    </header>
  );
}
