import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { AppProviders } from "@providers/app-providers";
import "./globals.css";

const geistSans = DM_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = DM_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "300"],
});

export const metadata: Metadata = {
  title: "TaskFlow Pro",
  description:
    "Task management platform with secure auth and responsive workflow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
