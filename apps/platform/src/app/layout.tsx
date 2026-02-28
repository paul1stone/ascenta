import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SidebarProvider } from "@ascenta/ui/sidebar";
import { RoleProvider } from "@/lib/role/role-context";
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
        <RoleProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </RoleProvider>
        <Analytics />
      </body>
    </html>
  );
}
