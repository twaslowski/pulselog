import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Header } from "@/components/header";
import React from "react";
import { instanceUrl } from "@/lib/utils";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(instanceUrl()),
  title: "Pulselog",
  description: "Track your mental health, your way",
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/android-chrome-192x192.png",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: `/favicon/site.webmanifest`,
  authors: [
    {
      name: "Tobias Waslowski",
      url: "https://twaslowski.com",
    },
  ],
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <Script
          defer
          src="https://tracking.twaslowski.com/script.js"
          data-website-id="38627a8d-d8bf-4921-b931-9173a2cc9594"
          strategy="afterInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col h-screen">
            <div className="border-b border-b-muted-foreground/10 shrink-0">
              <Header />
            </div>
            <Toaster />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
