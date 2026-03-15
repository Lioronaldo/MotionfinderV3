import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lio’s Motion Finder",
  description: "Fasten your seatbelt before booking your next motion.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://mogadishutravel.vercel.app"),
  openGraph: {
    title: "Lio’s Motion Finder",
    description: "Modern flight discovery with smart scoring and one-tap booking provider links.",
    type: "website"
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
