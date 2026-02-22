"use client";

import { SidebarInset } from "@ascenta/ui/sidebar";
import { AppNavbar } from "@/components/app-navbar";
import { DocumentTracker } from "@/components/document-tracker";

export default function TrackerPage() {
  return (
    <SidebarInset className="bg-glacier">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-6">
        <div className="flex-1" />
        <AppNavbar />
      </header>
      <main className="max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-deep-blue">Document Tracker</h1>
          <p className="mt-1 text-muted-foreground">Track and manage HR documents through their delivery lifecycle.</p>
        </div>
        <DocumentTracker />
      </main>
    </SidebarInset>
  );
}
