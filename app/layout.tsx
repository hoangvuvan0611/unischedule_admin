import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/contexts/layoutContext";
import AppShell from "@/components/layout/appShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniSchedule",
  description: "Báo cáo dữ liệu người dùng và account",
  icons: {
    icon: [
      { url: "/logo_unischedule.jpg", type: "image/jpg", sizes: "192x192" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-950`}
      >
        <div className="min-h-screen bg-[#f7f6f1] font-sans">
          <SidebarProvider>
            <AppShell>{children}</AppShell>
          </SidebarProvider>
        </div>
      </body>
    </html>
  );
}
