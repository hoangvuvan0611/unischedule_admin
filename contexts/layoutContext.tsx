"use client"; // context chỉ dùng client

import { createContext, useState, useContext, ReactNode } from "react";

// Kiểu dữ liệu context
type SidebarContextType = {
  isExtend: boolean;
  toggle: () => void;
};

// Tạo context
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Provider component
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExtend, setIsExtend] = useState(true);
  const toggle = () => setIsExtend(prev => !prev);

  return (
    <SidebarContext.Provider value={{ isExtend, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Hook tiện lợi để dùng context
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
}
