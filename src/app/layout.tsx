import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ironclad AI | Find the Leak, Get the Fix",
  description:
    "A practical tool that helps local trades businesses find missed-call and follow-up leaks, get templates, and choose the next step.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
