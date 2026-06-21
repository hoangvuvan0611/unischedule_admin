"use client";

import type { ReactNode } from "react";
import MyNavbar from "@/components/layout/myNavbar";
import MySidebar from "@/components/layout/mySidebar";
import { useSidebar } from "@/contexts/layoutContext";
import { cn } from "@/lib/utils";

export default function AppShell({ children }: { children: ReactNode }) {
  const { isExtend } = useSidebar();

  return (
    <div className="min-h-screen">
      <div className="fixed inset-y-0 left-0 z-40">
        <MySidebar />
      </div>
      <div
        className={cn(
          "min-w-0 transition-[padding] duration-200",
          isExtend ? "pl-[280px]" : "pl-[82px]"
        )}
      >
        <div
          className={cn(
            "fixed right-0 top-0 z-30 transition-[left] duration-200",
            isExtend ? "left-[280px]" : "left-[82px]"
          )}
        >
          <MyNavbar />
        </div>
        <main className="min-w-0 pt-[76px]">{children}</main>
      </div>
    </div>
  );
}
