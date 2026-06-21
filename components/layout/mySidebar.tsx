'use client';

import {
  Activity,
  Bell,
  Database,
  FileClock,
  Globe2,
  LayoutDashboard,
  MonitorSmartphone,
  Settings,
  ShieldCheck,
  Square,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/layoutContext";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "",
    items: [
      { title: "Tổng quan", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Quản lý",
    items: [
      { title: "Người dùng", href: "/accounts", icon: Users },
      { title: "Phiên truy cập", href: "/logs", icon: FileClock },
      { title: "Bảo mật", href: "/security", icon: ShieldCheck },
    ],
  },
  {
    label: "Phân tích",
    items: [
      { title: "Hành vi", href: "/student", icon: Activity },
      { title: "Địa lý", href: "/geo", icon: Globe2 },
      { title: "Thiết bị", href: "/batches", icon: MonitorSmartphone },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { title: "Audit log", href: "/audit", icon: Database },
      { title: "Cảnh báo", href: "/alerts", icon: Bell },
      { title: "Cấu hình", href: "/settings", icon: Settings },
    ],
  },
];

export default function MySidebar() {
  const pathname = usePathname();
  const { isExtend } = useSidebar();

  return (
    <aside
      data-sidebar={isExtend ? "expanded" : "collapsed"}
      className={cn("h-screen border-r border-neutral-200 bg-[#fbfaf6] transition-all duration-200", isExtend ? "w-[280px]" : "w-[82px]")}
    >
      <div className="flex h-[76px] items-center gap-4 border-b border-neutral-200 px-6">
        <Square className="h-5 w-5 text-indigo-500" />
        {isExtend ? <div className="text-xl font-semibold tracking-normal text-neutral-900">Admin Panel</div> : null}
      </div>

      <nav className="py-6">
        {groups.map((group) => (
          <div key={group.label || "main"} className="mb-6">
            {isExtend && group.label ? (
              <div className="mb-2 px-6 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                {group.label}
              </div>
            ) : null}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative mx-0 flex h-11 items-center gap-4 px-6 text-[15px] font-semibold transition",
                      isActive ? "bg-[#f0eee7] text-neutral-950" : "text-neutral-600 hover:bg-neutral-100",
                      !isExtend && "justify-center px-0"
                    )}
                  >
                    {isActive ? <span className="absolute left-0 top-0 h-full w-1 bg-indigo-500" /> : null}
                    <Icon className="h-5 w-5 shrink-0" />
                    {isExtend ? <span>{item.title}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      {isExtend ? (
        <div className="absolute bottom-6 left-6 right-6 rounded-[10px] border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">AD</div>
            <div>
              <div className="text-sm font-semibold text-neutral-900">Admin</div>
              <div className="text-xs font-medium text-neutral-500">UniSchedule</div>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
