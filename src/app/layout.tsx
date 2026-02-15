import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Link Nest | Save what matters. Organized in one place.",
    template: "%s | Link Nest",
  },
  description:
    "Link Nest is a private smart bookmark manager with Google sign-in, real-time sync, and secure personal organization.",
  keywords: [
    "Link Nest",
    "bookmark manager",
    "smart bookmarks",
    "private bookmarks",
    "Supabase",
    "Next.js",
    "real-time bookmarks",
    "Google OAuth",
  ],
  authors: [{ name: "Link Nest" }],
  creator: "Link Nest",
  publisher: "Link Nest",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Link Nest | Save what matters. Organized in one place.",
    description:
      "Manage private bookmarks with Google login, secure storage, and real-time sync across tabs.",
    url: "/",
    siteName: "Link Nest",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Link Nest | Smart Bookmark App",
    description:
      "Save, organize, and sync your private bookmarks in real time with Link Nest.",
  },
  icons: {
    icon: [{ url: "/icon.svg?v=3", type: "image/svg+xml" }],
    shortcut: [{ url: "/icon.svg?v=3", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg?v=3", type: "image/svg+xml" }],
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
