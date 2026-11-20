import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { DataProvider } from "@/lib/data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sidebar, MobileNav } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: { default: "Pineapple Games", template: "%s · Pineapple Games" },
  description: "Free browser games. No downloads, no installs, just play.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          <DataProvider>
            <Header />
            <Suspense fallback={null}><MobileNav /></Suspense>
            <div className="max-w-[1500px] mx-auto flex">
              <Suspense fallback={<div className="hidden lg:block w-56 shrink-0" />}><Sidebar /></Suspense>
              <div className="flex-1 min-w-0 flex flex-col min-h-[calc(100vh-4rem)]">
                <main className="flex-1 px-4 sm:px-6 py-6">{children}</main>
                <Footer />
              </div>
            </div>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
