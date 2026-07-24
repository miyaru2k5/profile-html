import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/shared/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Miyaru — Nền tảng Profile",
    template: "%s · Miyaru",
  },
  description:
    "Nền tảng SaaS profile đa tenant: tên miền riêng, page builder, phân tích và trợ lý AI.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://miyaru.online"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: extension trình duyệt (vd. ColorZilla) có thể
    // chèn attribute như cz-shortcut-listen vào <body> trước khi React hydrate.
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
