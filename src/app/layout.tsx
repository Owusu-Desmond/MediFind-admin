import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/context/AdminContext";
import LayoutWrapper from "./LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediFind Ghana | Admin Console",
  description: "System administration and pharmacy verification dashboard for MediFind Ghana.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AdminProvider>
      </body>
    </html>
  );
}
