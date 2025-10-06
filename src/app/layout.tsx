import { LanguageProvider } from "@/contexts/LanguageContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { JSX, ReactNode } from "react";
import "./globals.css";

// =====================================
// FONT CONFIGURATIONS
// =====================================

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// =====================================
// METADATA
// =====================================

export const metadata: Metadata = {
  title: "Yohann Di Crescenzo's Portfolio",
  description: "Portfolio complet avec support RTL pour l'arabe",
};

// =====================================
// ROOT LAYOUT COMPONENT
// =====================================

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * Root layout component for the entire application
 * @param children - Child components to render
 * @returns JSX Element for root layout
 */
export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
