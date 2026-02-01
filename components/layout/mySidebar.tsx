'use client'
import {LayoutDashboard, User2} from "lucide-react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useSidebar} from "@/contexts/layoutContext";
import {MenuItem} from "@/types/menu_item";

const menuItems: MenuItem [] = [
  { title: 'Tổng quan', href: '/', icon: LayoutDashboard},
  { title: 'Sinh viên', href: '/student', icon: User2 },
];

export default function MySidebar() {

  const pathname = usePathname();
  const { isExtend } = useSidebar();

  return (
    <nav className="">
      {isExtend ? menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              href={item.href}
              key={index}
              className={`flex items-center gap-3 p-4 text-sm ${
                isActive
                  ? 'bg-lime-50 text-lime-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon/>
              <span>{item.title}</span>
            </Link>
          );
        }) : menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              href={item.href}
              key={index}
              className={`flex items-center p-4 ${
                isActive
                  ? 'bg-lime-50 text-lime-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon/>
            </Link>
          );
        })
      }
    </nav>
  );
}