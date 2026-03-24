import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { NavSidebar } from "@/components/nav-sidebar";
import { TopHeader } from "@/components/top-header";
import { ChatProvider } from "@/lib/chat/chat-context";
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
        <ChatProvider>
          <div className="flex h-screen overflow-hidden">
            <NavSidebar />
            <main className="flex flex-1 flex-col overflow-hidden bg-glacier">
              <TopHeader />
              <div className="flex flex-1 flex-col overflow-hidden">
                {children}
              </div>
            </main>
          </div>
        </ChatProvider>
        </RoleProvider>
        <Analytics />
      </body>
    </html>
  );
}
