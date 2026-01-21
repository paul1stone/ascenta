import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ascenta | Mountain Peaks Landing Page",
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
        {children}
      </body>
    </html>
  );
}
