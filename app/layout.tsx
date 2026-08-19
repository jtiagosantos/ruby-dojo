import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import SessionProvider from "@/components/layout/SessionProvider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ruby Dojo — Aprenda e Pratique Ruby",
  description:
    "Plataforma de aprendizado e prática da linguagem Ruby com conteúdo teórico e desafios de código.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistMono.variable} h-full antialiased`}
    >
      <body
        className="h-full flex"
        style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      >
        <SessionProvider>
          <Sidebar />
          <main
            className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto pb-16 lg:pb-0"
            style={{ minHeight: "100vh" }}
          >
            {children}
          </main>
          <BottomNav />
        </SessionProvider>
      </body>
    </html>
  );
}
