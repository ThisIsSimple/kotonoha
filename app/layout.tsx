import type { Metadata } from "next";
import { Noto_Serif_JP, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Noto_Serif_JP({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
});

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
      <body className={`${headingFont.variable} ${bodyFont.variable} font-[var(--font-body)]`}>
        <NavBar />
        <main className="container py-10">{children}</main>
      </body>
    </html>
  );
}
