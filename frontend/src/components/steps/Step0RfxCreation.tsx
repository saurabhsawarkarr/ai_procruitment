import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Building2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  Layers,
  ArrowRight,
  Mail,
  Smartphone,
  Globe,
  Database,
  Check,
  Info
} from "lucide-react";

interface Step0RfxCreationProps {
  onProceedToIngest: () => void;
}

export const Step0RfxCreation: React.FC<Step0RfxCreationProps> = ({ onProceedToIngest }) => {
  const [activeTab, setActiveTab] = useState<"skus" | "terms" | "vendors">("vendors");
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [dispatchStage, setDispatchStage] = useState<number>(0);

  const sampleSkus = [
    { line: 1, code: "SKU-001", name: "ThinkPad T14s Gen 5 Ultrabook", cat: "Compute", qty: 120, baseline: "₹1,18,500", target: "₹1,04,200" },
    { line: 2, code: "SKU-002", name: "Dell Latitude 5440 Enterprise Laptop", cat: "Compute", qty: 200, baseline: "₹86,200", target: "₹76,500" },
    { line: 3, code: "SKU-003", name: "Apple MacBook Pro 14 M3 Pro", cat: "Compute", qty: 45, baseline: "₹2,39,900", target: "₹2,18,000" },
    { line: 4, code: "SKU-004", name: "HP EliteBook 840 G10 Business Notebook", cat: "Compute", qty: 110, baseline: "₹1,24,500", target: "₹1,10,000" },
    { line: 5, code: "SKU-005", name: "Dell Precision 7680 Mobile Workstation", cat: "Compute", qty: 25, baseline: "₹3,48,000", target: "₹3,15,000" },
    { line: 13, code: "SKU-013", name: "Dell UltraSharp 27 4K USB-C Hub Monitor", cat: "Peripheral", qty: 180, baseline: "₹48,500", target: "₹42,500" },
    { line: 23, code: "SKU-023", name: "Dell PowerEdge R760 2U Rack Server", cat: "Infra", qty: 14, baseline: "₹6,85,000", target: "₹6,15,000" },
    { line: 27, code: "SKU-027", name: "Cisco Catalyst 9300 48-Port PoE+ Switch", cat: "Infra", qty: 12, baseline: "₹4,25,000", target: "₹3,85,000" }
  ];

  const targetVendors = [
    {
      id: "VEND-001",
      name: "Apex Technology Solutions",
      channel: "ERP EDI Gateway",
      icon: Database,
      channelColor: "#2563EB",
      channelBg: "#EFF6FF",
      recipient: "edi-dispatch@apextech.in",
      location: "Bhiwandi & Bengaluru Hub",
      formatExpected: "Will submit multi-tab Excel (.xlsx)"
    },
    {
      id: "VEND-002",
      name: "CompuZone India Pvt Ltd",
      channel: "Enterprise Supplier Portal",
      icon: Globe,
      channelColor: "#0284C7",
      channelBg: "#F0F9FF",
      recipient: "portal://suppliers.enterprise.com/compuzone",
      location: "Bengaluru Tech Center",
      formatExpected: "Will submit corporate PDF (.pdf)"
    },
    {
      id: "VEND-003",
      name: "National IT Systems",
      channel: "Direct SCM Gateway",
      icon: Layers,
      channelColor: "#7C3AED",
      channelBg: "#F5F3FF",
      recipient: "scm-gateway@nationalit.com",
      location: "Hyderabad Logistics Depot",
      formatExpected: "Will submit narrative Word proposal (.docx)"
    },
    {
      id: "VEND-004",
      name: "Vardhman Infotech",
      channel: "WhatsApp & Mobile Dispatch",
      icon: Smartphone,
      channelColor: "#D97706",
      channelBg: "#FFFBEB",
      recipient: "+91 98250 XXXXX (Surat Works)",
      location: "Surat Factory Depot",
      formatExpected: "Will submit mobile camera photo (.jpg)"
    },
    {
      id: "VEND-005",
      name: "Shree Balaji Infotech",
      channel: "Corporate Email (SMTP)",
      icon: Mail,
      channelColor: "#16A34A",
      channelBg: "#F0FDF4",
      recipient: "rajesh@balajiinfotech.in",
      location: "Mumbai Logistics Hub",
      formatExpected: "Will submit casual shorthand email (.eml)"
    }
  ];

  const handleTriggerDispatch = () => {
    setIsDispatching(true);
    setDispatchStage(1);
    setTimeout(() => setDispatchStage(2), 600);
    setTimeout(() => setDispatchStage(3), 1200);
    setTimeout(() => {
      setDispatchStage(4);
      setIsDispatching(false);
      setIsDispatched(true);
    }, 1800);
  };

  return (
    <div style={{ padding: "24px 28px", backgroundColor: "#F8FAFC", minHeight: "calc(100vh - 64px)" }}>
      {/* 1. Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#1D4ED8",
                backgroundColor: "#EFF6FF",
                padding: "2px 8px",
                borderRadius: "12px",
                border: "1px solid #BFDBFE"
              }}
            >
              Stage 0: Upstream Initiation
            </span>
            <span style={{ fontSize: "12px", color: "#64748B" }}>
              RFQ Reference: <strong>RFX-2026-ITHW-099</strong>
            </span>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: "4px 0 0 0" }}>
            AI Co-Pilot RFx Authoring & Omnichannel Vendor Dispatch
          </h2>
          <p style={{ fontSize: "12.5px", color: "#64748B", margin: "2px 0 0 0" }}>
            The category buyer talks the RFx into existence with Aera. Scope, specifications, questionnaire, and commercial rules are compiled and dispatched across 5 supplier channels.
          </p>
        </div>

        {isDispatched && (
          <button
            onClick={onProceedToIngest}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
              transition: "all 0.15s ease"
            }}
          >
            <span>Proceed to Step 1: Ingestion Hub</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* 2. Main Dual-Column Grid: Left (Aera Co-Pilot Chat) + Right (Drafted RFx Cockpit) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "420px 1fr",
          gap: "24px",
          alignItems: "start"
        }}
      >
        {/* Left Column: Conversational Aera AI Co-Pilot */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "680px"
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid #E2E8F0",
              backgroundColor: "#F8FAFC",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF"
                }}
              >
                <Sparkles size={15} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                  Aera AI Sourcing Co-Pilot
                </div>
                <div style={{ fontSize: "10.5px", color: "#16A34A", fontWeight: 600 }}>
                  ● RFx Authoring Engine Online
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#2563EB",
                backgroundColor: "#EFF6FF",
                padding: "2px 8px",
                borderRadius: "10px",
                border: "1px solid #DBEAFE"
              }}
            >
              Direct Materials
            </span>
          </div>

          {/* Chat Messages */}
          <div style={{ padding: "16px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Message 1: Buyer Prompt */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
              <div style={{ fontSize: "10.5px", color: "#64748B", fontWeight: 600 }}>Saurabh Sawarkar (Category Buyer)</div>
              <div
                style={{
                  backgroundColor: "#2563EB",
                  color: "#FFFFFF",
                  padding: "12px 14px",
                  borderRadius: "12px 12px 2px 12px",
                  fontSize: "12.5px",
                  lineHeight: 1.5,
                  maxWidth: "92%"
                }}
              >
                "Aera, draft an RFx for <strong>FY2026 Enterprise IT Hardware & Client Compute</strong> across our Bengaluru (Whitefield) and Mumbai (BKC) Tech Centers. Sourcing <strong>30 SKUs</strong>: Ultrabooks, Enterprise Workstations, 4K Displays, and Rack Servers.
                <br /><br />
                Sourcing rules: Delivery SLA ≤ 12 business days, DDP Incoterms, Net 45 payment terms, and our mandatory ISO 9001 qualification questionnaire with ≤ 2.0% defect rate. Budget benchmark is <strong>₹17.90 Crore</strong>."
              </div>
            </div>

            {/* Message 2: Aera AI Response */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={12} color="#2563EB" />
                <span style={{ fontSize: "10.5px", color: "#2563EB", fontWeight: 700 }}>Aera AI Co-Pilot</span>
              </div>
              <div
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  color: "#1E293B",
                  padding: "12px 14px",
                  borderRadius: "12px 12px 12px 2px",
                  fontSize: "12px",
                  lineHeight: 1.5,
                  maxWidth: "96%"
                }}
              >
                <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: "6px" }}>
                  ✓ RFX-2026-ITHW-099 Drafted Successfully
                </div>
                I have structured the tender specification and aligned it with historical pricing data:
                <ul style={{ margin: "8px 0 8px 16px", padding: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <li><strong>Scope</strong>: 30 SKUs across Compute (12), Peripherals (10), and Infrastructure (8).</li>
                  <li><strong>Target Benchmark Spend</strong>: ₹17.90 Crore ($2.15M) based on FY2025 contract baseline.</li>
                  <li><strong>SLA Standard</strong>: Strictly ≤ 12 business days turnaround to BKC & Whitefield tech centers.</li>
                  <li><strong>Quality Hurdle</strong>: Mandatory ISO 9001 certification + DoA defect rate ≤ 2.0%.</li>
                  <li><strong>Commercial Baseline</strong>: Equalized to DDP Delivered, Net 45 Days.</li>
                </ul>
                I have populated the candidate distribution list with 5 approved suppliers across EDI, Web Portal, SCM Gateway, WhatsApp, and Email.
              </div>
            </div>

            {/* Simulated System Status */}
            <div
              style={{
                backgroundColor: isDispatched ? "#F0FDF4" : "#EFF6FF",
                border: `1px solid ${isDispatched ? "#BBF7D0" : "#BFDBFE"}`,
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "11.5px",
                color: isDispatched ? "#166534" : "#1D4ED8"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
                {isDispatched ? <CheckCircle2 size={14} color="#16A34A" /> : <Info size={14} color="#2563EB" />}
                <span>{isDispatched ? "RFx Dispatched to 5 Suppliers" : "Tender Ready for Simulated Dispatch"}</span>
              </div>
              <div style={{ fontSize: "11px", marginTop: "2px", opacity: 0.9 }}>
                {isDispatched
                  ? "Sourcing window completed. 5 Heterogeneous quote formats returned and ready for ingestion."
                  : "Vendors will receive specs in their preferred format and reply asynchronously without rigid web forms."}
              </div>
            </div>
          </div>

          {/* Chat Footer / Prompt Input Simulation */}
          <div
            style={{
              padding: "12px 14px",
              borderTop: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <input
              type="text"
              readOnly
              value={isDispatched ? "RFx published • Sourcing cycle initiated" : "Ready to dispatch to 5 candidate vendors"}
              style={{
                flex: 1,
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "12px",
                backgroundColor: "#F8FAFC",
                color: "#64748B"
              }}
            />
            <button
              onClick={handleTriggerDispatch}
              disabled={isDispatching || isDispatched}
              style={{
                backgroundColor: isDispatched ? "#16A34A" : "#2563EB",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: isDispatched ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                opacity: isDispatching ? 0.7 : 1
              }}
            >
              {isDispatched ? <Check size={14} /> : <Send size={14} />}
              <span>{isDispatched ? "Dispatched" : isDispatching ? "Sending..." : "Dispatch"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Drafted RFx Cockpit */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "18px"
          }}
        >
          {/* RFx Overview Card */}
          <div
            style={{
              border: "1px solid #E2E8F0",
              borderRadius: "10px",
              padding: "16px",
              backgroundColor: "#F8FAFC",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  backgroundColor: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2563EB"
                }}
              >
                <FileText size={22} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A" }}>
                    RFX-2026-ITHW-099
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: isDispatched ? "#16A34A" : "#D97706",
                      backgroundColor: isDispatched ? "#F0FDF4" : "#FEF3C7",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      border: `1px solid ${isDispatched ? "#BBF7D0" : "#FDE68A"}`
                    }}
                  >
                    {isDispatched ? "Dispatched to 5 Vendors" : "Draft Approved by Category Lead"}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                  Enterprise IT Hardware & Client Compute • 30 Line Items • Tech Centers: Whitefield (BLR) & BKC (MUM)
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Baseline Budget Spend</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A" }}>₹17.90 Crore</div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0", gap: "8px" }}>
            <button
              onClick={() => setActiveTab("vendors")}
              style={{
                padding: "8px 16px",
                fontSize: "12.5px",
                fontWeight: activeTab === "vendors" ? 700 : 500,
                color: activeTab === "vendors" ? "#2563EB" : "#64748B",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === "vendors" ? "2px solid #2563EB" : "2px solid transparent",
                cursor: "pointer"
              }}
            >
              Target 5 Vendors & Channels ({targetVendors.length})
            </button>
            <button
              onClick={() => setActiveTab("skus")}
              style={{
                padding: "8px 16px",
                fontSize: "12.5px",
                fontWeight: activeTab === "skus" ? 700 : 500,
                color: activeTab === "skus" ? "#2563EB" : "#64748B",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === "skus" ? "2px solid #2563EB" : "2px solid transparent",
                cursor: "pointer"
              }}
            >
              30 SKU Specification Sample
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              style={{
                padding: "8px 16px",
                fontSize: "12.5px",
                fontWeight: activeTab === "terms" ? 700 : 500,
                color: activeTab === "terms" ? "#2563EB" : "#64748B",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === "terms" ? "2px solid #2563EB" : "2px solid transparent",
                cursor: "pointer"
              }}
            >
              Qualification Questionnaire & Terms
            </button>
          </div>

          {/* Tab 1: Vendors & Channels */}
          {activeTab === "vendors" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "4px" }}>
                The assignment mandate specifies 5 heterogeneous suppliers. Below are the 5 target vendors and the simulated transmission channels through which the RFx is dispatched:
              </div>

              {targetVendors.map((v) => {
                const IconComponent = v.icon;
                return (
                  <div
                    key={v.id}
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#FFFFFF",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          backgroundColor: v.channelBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: v.channelColor
                        }}
                      >
                        <IconComponent size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                          {v.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>
                          {v.location} • <span style={{ color: "#334155" }}>{v.recipient}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: v.channelColor,
                            backgroundColor: v.channelBg,
                            padding: "2px 8px",
                            borderRadius: "6px"
                          }}
                        >
                          {v.channel}
                        </span>
                        <div style={{ fontSize: "10.5px", color: "#94A3B8", marginTop: "2px" }}>
                          {v.formatExpected}
                        </div>
                      </div>

                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: isDispatched ? "#F0FDF4" : "#F1F5F9",
                          color: isDispatched ? "#16A34A" : "#94A3B8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 700
                        }}
                      >
                        {isDispatched ? <Check size={14} /> : "•"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: SKU Specification Sample */}
          {activeTab === "skus" && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", textAlign: "left", color: "#64748B" }}>
                    <th style={{ padding: "8px 10px" }}>Line</th>
                    <th style={{ padding: "8px 10px" }}>SKU Code</th>
                    <th style={{ padding: "8px 10px" }}>Hardware Item</th>
                    <th style={{ padding: "8px 10px" }}>Category</th>
                    <th style={{ padding: "8px 10px", textAlign: "right" }}>Qty</th>
                    <th style={{ padding: "8px 10px", textAlign: "right" }}>Historical Baseline</th>
                    <th style={{ padding: "8px 10px", textAlign: "right" }}>Target Price</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleSkus.map((sku) => (
                    <tr key={sku.line} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "8px 10px", color: "#64748B" }}>{sku.line}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 700, color: "#2563EB" }}>{sku.code}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#0F172A" }}>{sku.name}</td>
                      <td style={{ padding: "8px 10px", color: "#64748B" }}>{sku.cat}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700 }}>{sku.qty}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", color: "#64748B" }}>{sku.baseline}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#16A34A" }}>{sku.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: "11px", color: "#64748B", marginTop: "8px", textAlign: "center" }}>
                Showing 8 of 30 total SKUs in tender scope. Complete 30-item specification available in matrix.
              </div>
            </div>
          )}

          {/* Tab 3: Terms & Questionnaire */}
          {activeTab === "terms" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div style={{ border: "1px solid #E2E8F0", borderRadius: "8px", padding: "14px", backgroundColor: "#F8FAFC" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={16} color="#2563EB" />
                  <span>Mandatory Quality Hurdle</span>
                </div>
                <div style={{ fontSize: "11.5px", color: "#475569", lineHeight: 1.5 }}>
                  • <strong>Quality Questionnaire</strong>: Pass / Fail status required.<br />
                  • <strong>Defect Threshold</strong>: Historical DoA rate ≤ 2.0%.<br />
                  • <strong>Certifications</strong>: Valid ISO 9001:2015 certification mandatory.<br />
                  • <strong>Disqualification</strong>: Failure on quality questionnaire or defect rate breaches automatically disqualifies supplier in Step 3 solver.
                </div>
              </div>

              <div style={{ border: "1px solid #E2E8F0", borderRadius: "8px", padding: "14px", backgroundColor: "#F8FAFC" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={16} color="#2563EB" />
                  <span>Delivery SLA & Logistics Terms</span>
                </div>
                <div style={{ fontSize: "11.5px", color: "#475569", lineHeight: 1.5 }}>
                  • <strong>Maximum Lead Time</strong>: Strictly ≤ 12 business days turnaround.<br />
                  • <strong>Delivery Terms</strong>: DDP Tech Centers (Bengaluru & Mumbai).<br />
                  • <strong>Freight Normalization</strong>: Ex-Works quotes will have destination freight equalized to DDP.<br />
                  • <strong>Minimum Allocation Threshold</strong>: Orders below ₹5.00 Lakhs disallowed to prevent sub-scale batch cancellations.
                </div>
              </div>
            </div>
          )}

          {/* Simulated Dispatch Execution Box */}
          <div
            style={{
              border: "1px solid #DBEAFE",
              borderRadius: "10px",
              padding: "16px",
              backgroundColor: isDispatched ? "#F0FDF4" : "#EFF6FF",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: isDispatched ? "#166534" : "#1D4ED8" }}>
                {isDispatched
                  ? "✓ Omnichannel RFx Dispatch Completed & 5 Quotes Returned"
                  : isDispatching
                  ? `Simulating Multi-Channel Dispatch (Stage ${dispatchStage}/4)...`
                  : "Dispatch RFx to 5 Vendors across Simulated Channels"}
              </div>
              <div style={{ fontSize: "11.5px", color: isDispatched ? "#15803D" : "#4B5563", marginTop: "2px" }}>
                {isDispatched
                  ? "Apex (Excel), CompuZone (PDF), National (Word), Vardhman (Photo), and Balaji (Email) have replied."
                  : "Clicking dispatch transmits the RFx simultaneously over EDI, SCM Portal, WhatsApp, and SMTP."}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {!isDispatched ? (
                <button
                  onClick={handleTriggerDispatch}
                  disabled={isDispatching}
                  style={{
                    backgroundColor: "#2563EB",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 18px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: isDispatching ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 4px rgba(37,99,235,0.2)"
                  }}
                >
                  <Send size={15} />
                  <span>{isDispatching ? "Simulating Dispatch..." : "🚀 Dispatch RFx to 5 Vendors"}</span>
                </button>
              ) : (
                <button
                  onClick={onProceedToIngest}
                  style={{
                    backgroundColor: "#16A34A",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 18px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 4px rgba(22,163,74,0.25)"
                  }}
                >
                  <span>Proceed to Step 1: Ingestion Hub</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
