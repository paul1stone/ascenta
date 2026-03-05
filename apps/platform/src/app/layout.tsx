import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { NavSidebar } from "@/components/nav-sidebar";
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
        <div className="flex h-screen overflow-hidden">
          <NavSidebar />
          <main className="flex flex-1 flex-col overflow-hidden bg-glacier">
            {children}
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
