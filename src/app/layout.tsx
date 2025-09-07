import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DayBit - One Word, Every Day",
  description: "Track your daily mood and activities with a single word. Visualize your year in a beautiful GitHub-style heatmap.",
  keywords: ["daily tracking", "mood tracker", "journal", "heatmap", "productivity"],
  authors: [{ name: "DayBit" }],
  icons: {
    icon: "/daybit_icon.png",
    shortcut: "/daybit_icon.png",
    apple: "/daybit_icon.png",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#10B981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
