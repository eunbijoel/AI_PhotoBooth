import type { Metadata, Viewport } from "next";
import { Black_Han_Sans, Noto_Sans_KR } from "next/font/google";
import { ThemeBoot } from "@/components/shared/theme-boot";
import "./globals.css";

const notoSans = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Black_Han_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "나만의 AI 포토부스 | Personal AI Studio",
  description:
    "Personal AI photo booth — 8-shot capture, 4-photo frames, filters, and session video.",
  applicationName: "나만의 AI 포토부스",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body className={`${notoSans.variable} ${display.variable} antialiased`}>
        <ThemeBoot />
        {children}
      </body>
    </html>
  );
}
