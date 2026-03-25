import type { Metadata } from "next";
import "./globals.css";

import Navbar from "../components/Navbar";
import { ChatProvider } from "@/context/ChatContext";
import FloatingChatWidget from "@/components/FloatingChatWidget";

export const metadata: Metadata = {
  title: "RevCommerce - E-commerce Reverso",
  description: "Marketplace guiado pelo comprador.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased font-sans min-h-screen bg-meli-bg text-meli-dark relative">
        <ChatProvider>
          <Navbar />
          <main className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 pb-32">
            {children}
          </main>
          <FloatingChatWidget />
        </ChatProvider>
      </body>
    </html>
  );
}
