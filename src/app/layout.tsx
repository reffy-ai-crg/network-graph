import type { Metadata } from "next";
import "./globals.css";
import { NetworkProvider } from "../context/NetworkContext";

export const metadata: Metadata = {
  title: "人脈圖 Network Graph | 活動專屬關係圖譜與人脈存摺",
  description: "專為線下實體課程、工作坊與年會學員打造的目錄檢索與動態關係圖譜系統。",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col">
        <NetworkProvider>
          {children}
        </NetworkProvider>
      </body>
    </html>
  );
}
