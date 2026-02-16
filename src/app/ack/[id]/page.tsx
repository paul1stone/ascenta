"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type DocInfo = {
  title: string;
  documentType: string;
  createdAt: string;
};

export default function AcknowledgmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [docId, setDocId] = useState<string | null>(null);
  const [doc, setDoc] = useState<DocInfo | null>(null);
  const [status, setStatus] = useState<
    "loading" | "ready" | "submitting" | "done" | "error"
  >("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    params.then((p) => setDocId(p.id));
  }, [params]);

  useEffect(() => {
    if (!docId || !token) {
      if (!token) {
        setStatus("error");
        setErrorMsg("Missing verification token.");
      }
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/tracked-documents/${docId}`);
        if (!res.ok) {
          setStatus("error");
          setErrorMsg("Document not found.");
          return;
        }
        const data = await res.json();
        setDoc({
          title: data.title,
          documentType: data.documentType,
          createdAt: data.createdAt,
        });

        if (data.acknowledgedAt) {
          setStatus("done");
        } else {
          setStatus("ready");
        }
      } catch {
        setStatus("error");
        setErrorMsg("Failed to load document.");
      }
    })();
  }, [docId, token]);

  async function handleAcknowledge() {
    if (!docId || !token) return;
    setStatus("submitting");
    try {
      const res = await fetch(`/api/tracked-documents/${docId}/ack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setStatus("done");
      } else {
        const data = await res.json();
        setStatus("error");
        setErrorMsg(data.error || "Failed to acknowledge.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f5f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "8px",
          maxWidth: "480px",
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            background: "#1e293b",
            padding: "24px 32px",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: "20px",
              fontWeight: 600,
            }}
          >
            Ascenta
          </h1>
        </div>

        <div style={{ padding: "32px" }}>
          {status === "loading" && (
            <p style={{ color: "#64748b", textAlign: "center" }}>
              Loading document...
            </p>
          )}

          {status === "error" && (
            <div>
              <h2
                style={{
                  margin: "0 0 12px",
                  color: "#dc2626",
                  fontSize: "18px",
                }}
              >
                Error
              </h2>
              <p style={{ margin: 0, color: "#334155" }}>{errorMsg}</p>
            </div>
          )}

          {(status === "ready" || status === "submitting") && doc && (
            <div>
              <h2
                style={{
                  margin: "0 0 16px",
                  color: "#1e293b",
                  fontSize: "18px",
                }}
              >
                Document Acknowledgment
              </h2>
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "6px",
                  padding: "16px",
                  marginBottom: "24px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px",
                    color: "#64748b",
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Document
                </p>
                <p
                  style={{
                    margin: "0 0 8px",
                    color: "#1e293b",
                    fontSize: "16px",
                    fontWeight: 600,
                  }}
                >
                  {doc.title}
                </p>
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                  Type: {doc.documentType.replace(/_/g, " ")}
                </p>
              </div>
              <p
                style={{
                  margin: "0 0 24px",
                  color: "#334155",
                  fontSize: "15px",
                }}
              >
                By clicking the button below, you confirm that you have received
                and reviewed this document.
              </p>
              <button
                onClick={handleAcknowledge}
                disabled={status === "submitting"}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px 24px",
                  background:
                    status === "submitting" ? "#93c5fd" : "#2563eb",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: 600,
                  border: "none",
                  borderRadius: "6px",
                  cursor:
                    status === "submitting" ? "not-allowed" : "pointer",
                }}
              >
                {status === "submitting"
                  ? "Acknowledging..."
                  : "I acknowledge receipt of this document"}
              </button>
            </div>
          )}

          {status === "done" && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "#dcfce7",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: "24px",
                }}
              >
                &#10003;
              </div>
              <h2
                style={{
                  margin: "0 0 8px",
                  color: "#1e293b",
                  fontSize: "18px",
                }}
              >
                Acknowledged
              </h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "15px" }}>
                Thank you. Your acknowledgment has been recorded.
              </p>
            </div>
          )}
        </div>

        <div
          style={{
            padding: "16px 32px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: "12px",
            }}
          >
            Powered by Ascenta
          </p>
        </div>
      </div>
    </div>
  );
}
