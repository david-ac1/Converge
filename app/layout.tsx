import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Load fonts as requested in PRD
// Note: "Inter Tight" is not available in standard Next.js google fonts wrapper yet as "Inter_Tight", 
// so using "Inter" which is standard. For "Inter Tight", we would need manual import or wait for update.
// Using standard "Inter" as acceptable approximation or I can try "Inter_Tight" if supported.
// Let's check if 'Inter_Tight' is importable. It usually is.

import { Inter_Tight } from "next/font/google";

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
  title: {
    default: "CONVERGE | Global Mobility Blueprint",
    template: "%s | CONVERGE"
  },
  description: "Autonomous planning engine for global mobility trajectories. Analyze visas, passports, and geopolitical trends.",
  keywords: ["global mobility", "visa planning", "second passport", "migration", "AI agent", "geopolitics"],
  authors: [{ name: "Converge AI" }],
  creator: "Converge Systems",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://converge.app",
    title: "CONVERGE | Global Mobility Blueprint",
    description: "Autonomous planning engine for global mobility trajectories.",
    siteName: "CONVERGE",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Converge System Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CONVERGE | Global Mobility Blueprint",
    description: "Autonomous planning engine for global mobility trajectories.",
    images: ["/og-image.jpg"],
    creator: "@converge_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
        {children}
      </body>
    </html>
  );
}

