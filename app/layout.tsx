import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TJ Galenti | Baseball Biomechanics & Performance",
    template: "%s | TJ Galenti"
  },
  description:
    "A premium baseball biomechanics, mocap, and performance publication from TJ Galenti, built for athletes, coaches, and practitioners who want deeper movement insight.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "TJ Galenti | Baseball Biomechanics & Performance",
    description:
      "Dense baseball movement, mocap, hitting, pitching, and performance concepts explained visually and practically.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ivory font-sans antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
