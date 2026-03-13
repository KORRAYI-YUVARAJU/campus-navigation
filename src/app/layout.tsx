import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CampusNav — MVGR Smart Campus Navigation",
  description: "Navigate MVGR campus with AI pathfinding, AR directions, real-time crowd tracking, and indoor positioning.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-[#0a0f1c] text-white`}>
        {/* We use a client wrapper to check pathname and conditionally hide Navbar */}
        <NavbarWrapper />
        <main>{children}</main>
      </body>
    </html>
  );
}
