import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
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
            className="flex-1 overflow-y-auto"
            style={{ minHeight: "100vh" }}
          >
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
