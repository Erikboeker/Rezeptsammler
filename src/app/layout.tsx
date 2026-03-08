import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rezeptsammler",
  description: "Dein digitales Kochbuch – Rezepte automatisch aus dem Web extrahieren",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
