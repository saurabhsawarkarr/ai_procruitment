import React from "react";
import {
  Sparkles,
  Layers,
  Settings,
  ChevronDown,
  UploadCloud,
  AlertTriangle,
  BarChart3,
  Award,
  RefreshCw
} from "lucide-react";

interface SidebarProps {
  currentStep?: number;
  onSelectStep?: (step: number) => void;
  supplierCount?: number;
  exceptionCount?: number;
  resolvedCount?: number;
  savingsInr?: number;
  savingsPct?: number;
  isCustomMode?: boolean;
  onResetToDefault?: () => void;
  onOpenAiCopilot?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentStep = 1,
  onSelectStep,
  supplierCount = 5,
  exceptionCount = 4,
  resolvedCount = 0,
  savingsInr = 38260910,
  savingsPct = 21.4,
  isCustomMode = false,
  onResetToDefault,
  onOpenAiCopilot
}) => {
  const stages = [
    {
      number: 1,
      title: "1. Upload & Extract",
      subtext: `${supplierCount} Supplier Quotes`,
      icon: UploadCloud,
      badge: `${supplierCount}`,
      badgeBg: "#EFF6FF",
      badgeColor: "#1D4ED8",
      badgeBorder: "#BFDBFE"
    },
    {
      number: 2,
      title: "2. Normalize & Verify",
      subtext: currentStep > 2 ? `${resolvedCount} Resolved` : "Verify & Normalize",
      icon: AlertTriangle,
      badge: exceptionCount > 0 ? `${exceptionCount} Alerts` : "0 Pending",
      badgeBg: exceptionCount > 0 ? "#FEF3C7" : "#F0FDF4",
      badgeColor: exceptionCount > 0 ? "#B45309" : "#166534",
      badgeBorder: exceptionCount > 0 ? "#FDE68A" : "#BBF7D0"
    },
    {
      number: 3,
      title: "3. Compare & Optimize",
      subtext: "Master Matrix & Solver",
      icon: BarChart3
    },
    {
      number: 4,
      title: "4. Award & Approval",
      subtext: "Sign-off & Board Memo",
      icon: Award
    }
  ];

  return (
    <aside
      style={{
        width: "255px",
        minWidth: "255px",
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid #E2E8F0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        zIndex: 40,
        userSelect: "none"
      }}
    >
      {/* Top Header & Brand */}
      <div>
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: "10px",
            borderBottom: "1px solid #F1F5F9"
          }}
        >
          {/* Aerchain Logo Mark */}
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              backgroundColor: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)"
            }}
          >
            <span style={{ fontWeight: 900, fontSize: "16px", fontStyle: "italic", fontFamily: "sans-serif" }}>A</span>
          </div>
          <div>
            <span
              style={{
                fontSize: "17px",
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-0.3px",
                fontFamily: "Inter, system-ui, sans-serif"
              }}
            >
              Aerchain
            </span>
            <div style={{ fontSize: "10px", color: "#64748B", fontWeight: 600, letterSpacing: "0.4px" }}>
              AI SOURCING PLATFORM
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {/* Section: Sourcing Workflow Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 8px 8px 8px",
              color: "#64748B",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.6px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Layers size={14} color="#2563EB" />
              <span>RFx Workflow</span>
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                backgroundColor: "#EFF6FF",
                color: "#2563EB",
                padding: "1px 6px",
                borderRadius: "10px",
                border: "1px solid #BFDBFE"
              }}
            >
              {`Stage ${currentStep}/4`}
            </span>
          </div>

          {/* 4 RFx Stages */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {stages.map((stage) => {
              const isActive = currentStep === stage.number;
              const isDone = currentStep > stage.number;

              return (
                <button
                  key={stage.number}
                  onClick={() => onSelectStep && onSelectStep(stage.number)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 10px",
                    borderRadius: "10px",
                    backgroundColor: isActive ? "#EFF6FF" : "transparent",
                    border: isActive ? "1px solid #BFDBFE" : "1px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                    boxShadow: isActive ? "0 1px 2px rgba(37, 99, 235, 0.08)" : "none"
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "#F8FAFC";
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    {/* Circle / Icon */}
                    {isDone ? (
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: "#059669",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        ✓
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: isActive ? "#2563EB" : "#F1F5F9",
                          color: isActive ? "#FFFFFF" : "#64748B",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        {stage.number}
                      </div>
                    )}

                    <div style={{ minWidth: 0, overflow: "hidden" }}>
                      <div
                        style={{
                          fontSize: "12.5px",
                          fontWeight: isActive ? 700 : 600,
                          color: isActive ? "#1D4ED8" : "#0F172A",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {stage.title}
                      </div>
                      <div
                        style={{
                          fontSize: "10.5px",
                          color: isActive ? "#2563EB" : isDone ? "#059669" : "#64748B",
                          marginTop: "1px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {stage.subtext}
                      </div>
                    </div>
                  </div>

                  {/* Optional Badge */}
                  {stage.badge && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        backgroundColor: stage.badgeBg || "#FEF3C7",
                        color: stage.badgeColor || "#B45309",
                        borderRadius: "10px",
                        padding: "1px 6px",
                        border: `1px solid ${stage.badgeBorder || "#FDE68A"}`,
                        flexShrink: 0,
                        marginLeft: "6px"
                      }}
                    >
                      {stage.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tender KPI Summary Card */}
          <div
            style={{
              marginTop: "12px",
              padding: "10px 12px",
              borderRadius: "10px",
              backgroundColor: isCustomMode ? "#F0FDF4" : "#F8FAFC",
              border: isCustomMode ? "1px solid #BBF7D0" : "1px solid #E2E8F0"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "10.5px", fontWeight: 700, color: isCustomMode ? "#166534" : "#64748B", textTransform: "uppercase" }}>
                {isCustomMode ? "Custom Upload Active" : "Tender Benchmark"}
              </div>
              {isCustomMode && onResetToDefault && (
                <button
                  onClick={onResetToDefault}
                  title="Restore 5 default demo quotes"
                  style={{
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#166534",
                    cursor: "pointer",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    fontSize: "10px",
                    fontWeight: 600
                  }}
                >
                  <RefreshCw size={11} color="#166534" />
                  <span>Reset</span>
                </button>
              )}
            </div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: isCustomMode ? "#166534" : "#0F172A", marginTop: "2px" }}>
              {isCustomMode ? `${supplierCount} Uploaded Suppliers` : "₹17.90 Cr"}
            </div>
            <div style={{ fontSize: "11px", color: isCustomMode ? "#15803D" : "#64748B", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
              <span>{isCustomMode ? "Default demo quotes purged" : "30 IT Hardware SKUs"}</span>
              <span>•</span>
              <span style={{ color: "#166534", fontWeight: 600 }}>
                {savingsPct ? `${savingsPct.toFixed(1)}% Sav` : "21.4% Sav"}
              </span>
            </div>
          </div>

          {/* AI Copilot Status Chip */}
          <div
            onClick={onOpenAiCopilot}
            style={{
              marginTop: "4px",
              padding: "8px 12px",
              borderRadius: "10px",
              backgroundColor: "#EFF6FF",
              border: "1px solid #DBEAFE",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: onOpenAiCopilot ? "pointer" : "default",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={e => {
              if (onOpenAiCopilot) {
                e.currentTarget.style.backgroundColor = "#DBEAFE";
                e.currentTarget.style.borderColor = "#93C5FD";
              }
            }}
            onMouseLeave={e => {
              if (onOpenAiCopilot) {
                e.currentTarget.style.backgroundColor = "#EFF6FF";
                e.currentTarget.style.borderColor = "#DBEAFE";
              }
            }}
            title={onOpenAiCopilot ? "Click to open Aera AI Sourcing Copilot" : undefined}
          >
            <Sparkles size={14} color="#2563EB" />
            <div style={{ fontSize: "11px", color: "#1D4ED8", fontWeight: 600 }}>
              Aera AI Engine Active
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Profile & Settings */}
      <div style={{ borderTop: "1px solid #F1F5F9", padding: "14px 12px" }}>
        {/* Settings */}
        <button
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 12px",
            borderRadius: "8px",
            backgroundColor: "transparent",
            border: "none",
            color: "#64748B",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            marginBottom: "10px",
            textAlign: "left"
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <Settings size={16} color="#64748B" />
          <span>Settings</span>
        </button>

        {/* User Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 10px",
            borderRadius: "10px",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#3B82F6",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700
              }}
            >
              SS
            </div>
            <div>
              <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>
                Saurabh Sawarkar
              </div>
              <div style={{ fontSize: "11px", color: "#64748B", lineHeight: 1.2 }}>
                Procurement
              </div>
            </div>
          </div>
          <ChevronDown size={14} color="#94A3B8" />
        </div>
      </div>
    </aside>
  );
};
