import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import { Providers } from "@/src/components/providers";
import { SiteHeader } from "@/src/components/site-header";
import { ThemeInitializer } from "@/src/components/theme-initializer";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Viremo",
  description:
    "Track every movie, series, and anime you finish, rate, revisit, or recommend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full" suppressHydrationWarning>
        <Providers>
          <ThemeInitializer />
          <div className="relative min-h-screen overflow-x-hidden">
            <div className="page-backdrop pointer-events-none absolute inset-0" />
            <div className="relative min-h-screen">
              <SiteHeader />
              <main className="min-h-screen pt-20 md:pt-0 md:pl-14">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
