import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Load fonts as requested in PRD
// Note: "Inter Tight" is not available in standard Next.js google fonts wrapper yet as "Inter_Tight", 
// so using "Inter" which is standard. For "Inter Tight", we would need manual import or wait for update.
// Using standard "Inter" as acceptable approximation or I can try "Inter_Tight" if supported.
// Let's check if 'Inter_Tight' is importable. It usually is.

import { Inter_Tight } from "next/font/google";
import { TavusProvider } from "@/components/providers/TavusProvider";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CONVERGE | Global Mobility Blueprint",
  description: "Autonomous planning engine for global mobility trajectories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" />
      </head>
      <body className={`${interTight.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-display selection:bg-primary/20 selection:text-white overflow-x-hidden`}>
        {/* Background Grid Layer */}
        <div className="fixed inset-0 pointer-events-none z-[-1] bg-blueprint-grid bg-[length:40px_40px]"></div>
        <TavusProvider>
          {children}
        </TavusProvider>
      </body>
    </html>
  );
}
