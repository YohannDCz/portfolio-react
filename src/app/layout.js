import { LanguageProvider } from "@/contexts/LanguageContext";
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

export const metadata = {
  title: "Yohann Di Crescenzo's Portfolio",
  description: "Portfolio complet avec support RTL pour l'arabe",
};

export default function RootLayout({ children }) {
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
