import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "VEYRA — AI Solutions Architect | HackTech",
  description:
    "VEYRA is HackTech's AI Solutions Architect. Design. Estimate. Plan. Build. Describe your idea and walk away with a system architecture, complexity estimate and a proposal — in minutes.",
};

export const viewport: Viewport = {
  themeColor: "#06060a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
