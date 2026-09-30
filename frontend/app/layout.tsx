import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { getSettings } from "@/lib/api";

export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

function hexToRgb(hex: string): string {
  try {
    const clean = (hex || "").replace("#", "").trim();
    if (clean.length === 6) {
      const num = parseInt(clean, 16);
      return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
    }
  } catch {
    // fallback
  }
  return "229, 9, 20";
}

export const metadata: Metadata = {
  title: {
    default: "Movies.snishad - Watch & Download Movies and Series in HD",
    template: "%s | Movies.snishad",
  },
  description:
    "Stream and download the latest Bollywood, Hollywood, South Indian movies, and trending web series in HD with high-speed direct download links.",
  keywords: [
    "movies download",
    "watch series online",
    "hd movies",
    "bollywood movies",
    "dual audio movies",
    "hollywood hindi dubbed",
  ],
  authors: [{ name: "Movies.snishad" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "Movies.snishad - Watch & Download HD Movies and Series",
    description:
      "Your ultimate destination for streaming and downloading the latest movies and web series in high quality.",
    siteName: "Movies.snishad",
    locale: "en_US",
    type: "website",
    images: [{ url: "/logo.jpg", width: 400, height: 400, alt: "Movies.snishad Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Movies.snishad - Watch & Download HD Movies",
    description: "Stream and download the latest movies and web series in HD quality.",
    images: ["/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const primaryRgb = hexToRgb(settings.primaryColor || "#e50914");

  const dynamicStyles = `
    :root {
      --color-primary: ${settings.primaryColor || "#e50914"};
      --color-primary-rgb: ${primaryRgb};
      --color-accent: ${settings.accentColor || "#ff1f2d"};
      --color-background: ${settings.backgroundColor || "#08080c"};
      --color-card: ${settings.cardColor || "#121218"};
      --color-text: ${settings.textColor || "#f8fafc"};
    }
  `;

  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />
      </head>
      <body
        className="min-h-screen text-[#f8fafc] flex flex-col font-sans selection:bg-[#e50914] selection:text-white"
        style={{
          backgroundColor: "var(--color-background, #08080c)",
          color: "var(--color-text, #f8fafc)",
        }}
      >
        <AnnouncementBar
          text={settings.announcementText}
          link={settings.announcementLink}
          active={settings.announcementActive}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
