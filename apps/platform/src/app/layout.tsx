import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SidebarProvider } from "@ascenta/ui/sidebar";
import { ChatProvider } from "@/lib/chat/chat-context";
import { ChatPanelLayout } from "@/components/chat/chat-panel-layout";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ChatPanelTrigger } from "@/components/chat/chat-panel-trigger";
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
        <ChatProvider>
          <ChatPanelLayout>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </ChatPanelLayout>
          <ChatPanel />
          <ChatPanelTrigger />
          <Analytics />
        </ChatProvider>
      </body>
    </html>
  );
}
