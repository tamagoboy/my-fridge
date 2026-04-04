import { Providers } from "@/components/Providers";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "myFridge",
  description: "食材を新鮮に保ち、廃棄を最小限に。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="light relative">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD,opsz@400,1,0,24&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${manrope.variable} font-sans antialiased text-on-surface bg-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container relative z-0`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
