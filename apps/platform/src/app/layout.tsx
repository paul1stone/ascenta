import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SidebarProvider } from "@ascenta/ui/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ascenta Platform",
  description: "AI-powered HR workflows for peak performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          {children}
        </SidebarProvider>
        <Analytics />
      </body>
    </html>
  );
}
