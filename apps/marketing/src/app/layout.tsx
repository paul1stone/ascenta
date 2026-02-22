import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ascenta | AI-Powered HR Workflows",
  description: "AI-powered HR workflows that bring clarity, safety, and peak performance to every organizational peak.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
