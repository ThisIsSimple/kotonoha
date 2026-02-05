import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { THEME_STORAGE_KEY } from "@/lib/theme";

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
  const themeScript = `
    (function() {
      try {
        const stored = localStorage.getItem("${THEME_STORAGE_KEY}");
        const preference =
          stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const shouldDark = preference === "dark" || (preference === "system" && prefersDark);
        const root = document.documentElement;
        root.classList.toggle("dark", shouldDark);
        root.style.colorScheme = shouldDark ? "dark" : "light";
      } catch (error) {}
    })();
  `;

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="font-sans">
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <NavBar />
        <main className="container py-10">{children}</main>
      </body>
    </html>
  );
}
