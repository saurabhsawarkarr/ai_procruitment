import React from "react";
import { Bell, TrendingDown } from "lucide-react";

interface StepNavigationHeaderProps {
  currentStep: number;
  onSelectStep?: (step: number) => void;
  supplierCount?: number;
  exceptionCount?: number;
  totalExceptionCount?: number;
  resolvedCount?: number;
  savingsInr?: number;
  savingsPct?: number;
  baselineSpend?: number;
}

const formatInrCr = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  return `₹${(val / 100000).toFixed(2)} Lakhs`;
};

const stageInfo: Record<number, { title: string; subtitle: string; tag: string }> = {
  1: {
    title: "1. Upload & Extract Quotes",
    subtitle: "Multi-Format Parsing, Line Item Extraction & Commercial Term Detection",
    tag: "Data Ingestion"
  },
  2: {
    title: "2. Normalize & Verify",
    subtitle: "Exception Auditing, Landed Cost Normalization & Risk Resolution",
    tag: "Audit Cockpit"
  },
  3: {
    title: "3. Compare & Optimize",
    subtitle: "Price Comparison Matrix & Constraint-Based Split Allocation",
    tag: "Optimization Cockpit"
  },
  4: {
    title: "4. Award & Approval",
    subtitle: "Allocation Sign-off, Compliance Verification & Audit Export",
    tag: "Executive Decision"
  }
};

export const StepNavigationHeader: React.FC<StepNavigationHeaderProps> = ({
  currentStep,
  savingsInr = 38260910,
  savingsPct = 21.4,
  baselineSpend = 178960500
}) => {
  const currentStage = stageInfo[currentStep] || stageInfo[1];

  return (
    <header
      style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        padding: "10px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        minHeight: "64px",
        zIndex: 30
      }}
    >
      {/* Left: Project Title & Direct Spend Pill */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
              FY2026 Enterprise IT Hardware RFx
            </h1>
            <span
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                backgroundColor: "#EFF6FF",
                color: "#1D4ED8",
                borderRadius: "12px",
                fontWeight: 600,
                border: "1px solid #BFDBFE",
                display: "inline-block"
              }}
            >
              Direct Spend Sourcing
            </span>
          </div>
          <p style={{ fontSize: "11.5px", color: "#64748B", margin: 0, marginTop: "2px" }}>
            Bengaluru & Mumbai Tech Centers • 30 SKUs • Baseline {formatInrCr(baselineSpend)}
          </p>
        </div>
      </div>

      {/* Center: Current Stage Active Header Pill */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            padding: "6px 14px",
            borderRadius: "10px"
          }}
        >
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "6px",
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {currentStep}
          </div>
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>{currentStage.title}</span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#2563EB",
                  backgroundColor: "#EFF6FF",
                  padding: "1px 6px",
                  borderRadius: "6px",
                  border: "1px solid #DBEAFE"
                }}
              >
                {currentStage.tag}
              </span>
            </div>
            <div style={{ fontSize: "10.5px", color: "#64748B" }}>
              {currentStage.subtitle}
            </div>
          </div>
        </div>

        {/* Projected Savings Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "#F0FDF4",
            border: "1px solid #BBF7D0",
            padding: "6px 14px",
            borderRadius: "10px"
          }}
        >
          <TrendingDown size={16} color="#16A34A" />
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>
              Projected Savings
            </div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#166534" }}>
              {formatInrCr(savingsInr)} ({savingsPct.toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Right: Notifications Bell & User SS Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ position: "relative", cursor: "pointer" }}>
          <Bell size={18} color="#64748B" />
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "7px",
              height: "7px",
              backgroundColor: "#EF4444",
              borderRadius: "50%",
              border: "1.5px solid #FFFFFF"
            }}
          />
        </div>

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
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.08)"
          }}
        >
          SS
        </div>
      </div>
    </header>
  );
};
