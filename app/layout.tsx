import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Kotonoha Journal",
    template: "%s | Kotonoha Journal",
  },
  description: "日本語日記とAIフィードバックの学習記録を管理する個人ブログ",
  openGraph: {
    title: "Kotonoha Journal",
    description: "日本語日記とAIフィードバックの学習記録ブログ",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="font-sans">
        <NavBar />
        <main className="container py-10">{children}</main>
      </body>
    </html>
  );
}
