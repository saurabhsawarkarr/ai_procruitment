import React from "react";
import { X, Printer, Copy, Check, FileText } from "lucide-react";

interface AwardMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoMarkdown: string;
}

export const AwardMemoModal: React.FC<AwardMemoModalProps> = ({
  isOpen,
  onClose,
  memoMarkdown
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(memoMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Procurement Board Award Memo - FY2026 Enterprise IT Hardware RFx</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
              table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
              th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
              th { background: #f4f4f4; }
              h1, h2, h3 { color: #1A365D; }
              pre { background: #f8f8f8; padding: 12px; border-radius: 4px; }
            </style>
          </head>
          <body>
            <pre style="white-space: pre-wrap; font-family: inherit;">${memoMarkdown}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(15, 23, 42, 0.4)",
      backdropFilter: "blur(4px)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "30px"
    }}>
      <div style={{
        width: "800px",
        maxHeight: "90vh",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FileText size={20} color="#2563EB" />
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>
                Executive Procurement Board Award Memorandum
              </h2>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                Audit-Ready Strategic Award Decision Report
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={handleCopy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                backgroundColor: "#FFFFFF",
                color: "#334155",
                border: "1px solid #CBD5E1",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
              <span>{copied ? "Copied" : "Copy Text"}</span>
            </button>

            <button
              onClick={handlePrint}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                backgroundColor: "#2563EB",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              <Printer size={14} />
              <span>Print / Export PDF</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "#64748B",
                cursor: "pointer",
                padding: "4px"
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          backgroundColor: "#F8FAFC",
          fontSize: "13px",
          color: "#0F172A",
          lineHeight: 1.6
        }}>
          <pre style={{
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
            lineHeight: 1.7,
            backgroundColor: "#FFFFFF",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #E2E8F0"
          }}>
            {memoMarkdown}
          </pre>
        </div>
      </div>
    </div>
  );
};
