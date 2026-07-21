import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "Gamebox — Rate what you play",
    template: "%s · Gamebox",
  },
  description: "A small, social home for the games you play and the people you play with.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
