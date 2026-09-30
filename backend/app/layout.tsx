import type { Metadata } from "next";
import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "TMDB API Reverse Proxy & Documentation",
  description: "High performance, CORS-enabled reverse proxy for The Movie Database API with ISP bypass and global CDN caching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#0b0f17] text-slate-100 antialiased min-h-screen selection:bg-cyan-500/20 selection:text-cyan-200`}
      >
        {children}
      </body>
    </html>
  );
}
