import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans, Oswald } from "next/font/google";
import "./globals.css";

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const displayFont = Oswald({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ironclad Ops AI",
  description:
    "A gritty, demo-ready AI operating system for trade business owners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
