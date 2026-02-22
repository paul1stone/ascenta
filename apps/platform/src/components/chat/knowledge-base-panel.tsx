"use client";

import { useEffect, useRef, useState } from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@ascenta/ui/sidebar";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";

interface Document {
  id: string;
  title: string;
  source?: string;
  createdAt: string;
}

export function KnowledgeBasePanel() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      await fetchDocuments();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/documents?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.docx"
        onChange={handleUpload}
        className="hidden"
      />

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            tooltip="Upload Document"
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            <span>{uploading ? "Uploading..." : "Upload Document"}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {documents.map((doc) => (
          <SidebarMenuItem key={doc.id}>
            <SidebarMenuButton tooltip={doc.title} className="pr-1">
              <FileText className="size-4 shrink-0" />
              <span className="truncate flex-1">{doc.title}</span>
            </SidebarMenuButton>
            <button
              onClick={() => handleDelete(doc.id)}
              disabled={deletingId === doc.id}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-0 group-hover/menu-item:opacity-100 hover:bg-sidebar-accent text-muted-foreground hover:text-destructive transition-all"
            >
              {deletingId === doc.id ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Trash2 className="size-3" />
              )}
            </button>
          </SidebarMenuItem>
        ))}

        {documents.length === 0 && (
          <div className="px-2 py-3 text-center text-xs text-muted-foreground">
            <p>No documents uploaded</p>
            <p className="mt-0.5">Upload PDF, DOCX, or TXT files</p>
          </div>
        )}
      </SidebarMenu>
    </>
  );
}
