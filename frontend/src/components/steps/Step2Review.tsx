import React, { useState, useEffect } from "react";
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Info,
  Check,
  Edit3,
  RotateCcw,
  Truck,
  Send,
  X,
  Layers,
  ChevronDown,
  ShieldCheck,
  MapPin
} from "lucide-react";
import type { ActionChoice, ExceptionData, ExceptionStatusBadge } from "../../types/procurement";

interface Step2ReviewProps {
  onBackToIngest: () => void;
  onProceedToAnalysis: () => void;
  quarantineItems?: any[];
  exceptions: ExceptionData[];
  onUpdateExceptions: (updated: ExceptionData[]) => void;
  selectedExceptionId?: string;
  onSelectExceptionId?: (id: string) => void;
}

export const Step2Review: React.FC<Step2ReviewProps> = ({
  onBackToIngest,
  onProceedToAnalysis,
  exceptions,
  onUpdateExceptions,
  selectedExceptionId,
  onSelectExceptionId
}) => {
  const [localSelectedId, setLocalSelectedId] = useState<string>(
    selectedExceptionId || (exceptions.length > 0 ? exceptions[0].id : "")
  );
  const [showClarificationModal, setShowClarificationModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [clarificationDraft, setClarificationDraft] = useState<string>("");
  const [customValue, setCustomValue] = useState<string>("100475");
  const [isReasoningOpen, setIsReasoningOpen] = useState<boolean>(true);
  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState<boolean>(false);
  const [provenanceToast, setProvenanceToast] = useState<string | null>(null);
  const [autoTransitionNotice, setAutoTransitionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (selectedExceptionId && exceptions.some(e => e.id === selectedExceptionId)) {
      setLocalSelectedId(selectedExceptionId);
    } else if (exceptions.length > 0 && !exceptions.some(e => e.id === localSelectedId)) {
      setLocalSelectedId(exceptions[0].id);
    }
  }, [selectedExceptionId, exceptions]);

  const selectedExceptionIndex = Math.max(
    0,
    exceptions.findIndex(e => e.id === localSelectedId)
  );

  const activeExc = exceptions[selectedExceptionIndex] || exceptions[0];

  // 6 Lifecycle Status Counters
  const resolvedCount = exceptions.filter(e => e.statusBadge === "Resolved" || e.isResolved).length;
  const pendingCount = exceptions.filter(e => e.statusBadge === "Pending review" && !e.isResolved).length;
  const clarificationsCount = exceptions.filter(e => e.statusBadge === "Clarification requested").length;

  // Handle Radio Selection for Buyer Decision
  const handleActionChange = (action: ActionChoice) => {
    if (!activeExc) return;
    const updated = exceptions.map(e => {
      if (e.id === activeExc.id) {
        let statusBadge: ExceptionStatusBadge = e.statusBadge;
        let statusColor = e.statusColor;

        if (action === "confirm") {
          statusBadge = "Finding confirmed";
          statusColor = "#2563EB";
        } else if (action === "accept") {
          statusBadge = "Deviation accepted";
          statusColor = "#0284C7";
        } else if (action === "clarify") {
          statusBadge = "Clarification requested";
          statusColor = "#7C3AED";
        } else if (action === "edit") {
          statusBadge = "Finding confirmed";
          statusColor = "#2563EB";
        }

        return {
          ...e,
          selectedAction: action,
          statusBadge,
          statusColor
        };
      }
      return e;
    });

    onUpdateExceptions(updated);

    if (action === "clarify") {
      setClarificationDraft(
        `Dear ${activeExc.supplierName} Commercial Team,\n\nRegarding your quotation submission for the FY2026 Enterprise Hardware RFx:\n\nWe noted the following condition: "${activeExc.whatWasFound[0]}".\n\nPlease confirm whether the quoted logistics rate applies uniformly to both Bengaluru and Mumbai Tech Centers, and provide itemized freight terms within 2 business days.\n\nBest regards,\nSaurabh Sawarkar\nDirect Material Sourcing Lead`
      );
    } else if (action === "edit") {
      setCustomValue(activeExc.scenarioB.landedPrice.replace(/[^\d.]/g, "") || "100475");
    }
  };

  // Move to next unresolved exception, or automatically proceed to Step 3 if all are verified
  const advanceToNextException = (currentExceptions: ExceptionData[] = exceptions) => {
    const unresolved = currentExceptions.filter(
      e => !e.isResolved && e.statusBadge !== "Resolved" && e.statusBadge !== "Deviation accepted"
    );

    if (unresolved.length === 0) {
      // All documents & exceptions verified -> automatically transition to Step 3
      setAutoTransitionNotice("All supplier documents & exceptions verified! Auto-transitioning to Step 3: Compare & Optimize...");
      setTimeout(() => {
        onProceedToAnalysis();
      }, 500);
      return;
    }

    // Advance to next unresolved item
    const nextUnresolved =
      currentExceptions.find((e, idx) => !e.isResolved && idx > selectedExceptionIndex) ||
      unresolved[0];

    if (nextUnresolved) {
      setLocalSelectedId(nextUnresolved.id);
      onSelectExceptionId?.(nextUnresolved.id);
    }
  };

  // Quick verify a single exception directly
  const handleQuickVerifyOne = (excId: string) => {
    const updated = exceptions.map(e => {
      if (e.id === excId) {
        return {
          ...e,
          isResolved: true,
          statusBadge: "Resolved" as ExceptionStatusBadge,
          statusColor: "#059669"
        };
      }
      return e;
    });
    onUpdateExceptions(updated);
    advanceToNextException(updated);
  };

  // Batch verify all documents and transition to Step 3
  const handleBatchVerifyAll = () => {
    const updated = exceptions.map(e => ({
      ...e,
      isResolved: true,
      selectedAction: e.selectedAction || ("confirm" as ActionChoice),
      statusBadge: (e.selectedAction === "accept" ? "Deviation accepted" : "Resolved") as ExceptionStatusBadge,
      statusColor: e.selectedAction === "accept" ? "#0284C7" : "#059669"
    }));
    onUpdateExceptions(updated);
    setAutoTransitionNotice("All supplier documents & exceptions verified! Auto-transitioning to Step 3: Compare & Optimize...");
    setTimeout(() => {
      onProceedToAnalysis();
    }, 500);
  };

  // Primary Contextual Button Handler
  const handlePrimaryContextualAction = () => {
    if (!activeExc) return;

    // If all are already verified, proceed to Step 3 immediately
    const isAll = exceptions.length > 0 && exceptions.every(
      e => e.isResolved || e.statusBadge === "Resolved" || e.statusBadge === "Deviation accepted"
    );
    if (isAll) {
      onProceedToAnalysis();
      return;
    }

    if (activeExc.isResolved) {
      advanceToNextException();
      return;
    }

    if (activeExc.selectedAction === "edit") {
      setCustomValue(activeExc.scenarioB.landedPrice.replace(/[^\d.]/g, "") || "100475");
      setShowEditModal(true);
      return;
    }

    if (activeExc.selectedAction === "clarify") {
      setClarificationDraft(
        `Dear ${activeExc.supplierName} Commercial Team,\n\nRegarding your quotation submission for the FY2026 Enterprise Hardware RFx:\n\nWe noted the following condition: "${activeExc.whatWasFound[0]}".\n\nPlease confirm whether the quoted logistics rate applies uniformly to both Bengaluru and Mumbai Tech Centers, and provide itemized freight terms within 2 business days.\n\nBest regards,\nSaurabh Sawarkar\nDirect Material Sourcing Lead`
      );
      setShowClarificationModal(true);
      return;
    }

    // "confirm" or "accept"
    const updated = exceptions.map(e => {
      if (e.id === activeExc.id) {
        const nextStatus: ExceptionStatusBadge =
          e.selectedAction === "accept" ? "Deviation accepted" : "Resolved";
        return {
          ...e,
          isResolved: true,
          statusBadge: nextStatus,
          statusColor: e.selectedAction === "accept" ? "#0284C7" : "#059669"
        };
      }
      return e;
    });

    onUpdateExceptions(updated);
    advanceToNextException(updated);
  };

  const handleReopenForReview = () => {
    if (!activeExc) return;
    const updated = exceptions.map(e => {
      if (e.id === activeExc.id) {
        return {
          ...e,
          isResolved: false,
          statusBadge: "Pending review" as ExceptionStatusBadge,
          statusColor: "#D97706"
        };
      }
      return e;
    });
    onUpdateExceptions(updated);
  };

  // Helper for Contextual Primary Button Labels & Icons
  const getPrimaryButtonMeta = () => {
    const isAll = exceptions.length > 0 && exceptions.every(
      e => e.isResolved || e.statusBadge === "Resolved" || e.statusBadge === "Deviation accepted"
    );

    if (isAll) {
      return {
        label: "Proceed to Stage 3: Scenario Analysis",
        icon: <ArrowRight size={16} />,
        bg: "#059669",
        hoverBg: "#047857"
      };
    }

    if (activeExc.isResolved) {
      return {
        label: "✓ Verified (Resolved) • Next Exception",
        icon: <ArrowRight size={16} />,
        bg: "#059669",
        hoverBg: "#047857"
      };
    }

    switch (activeExc.selectedAction) {
      case "confirm":
        return {
          label: "Confirm & Apply Normalization",
          icon: <Check size={16} />,
          bg: "#2563EB",
          hoverBg: "#1D4ED8"
        };
      case "edit":
        return {
          label: "Save Changes & Recalculate",
          icon: <Edit3 size={16} />,
          bg: "#2563EB",
          hoverBg: "#1D4ED8"
        };
      case "accept":
        return {
          label: "Accept Deviation & Continue",
          icon: <ShieldCheck size={16} />,
          bg: "#0284C7",
          hoverBg: "#0369A1"
        };
      case "clarify":
        return {
          label: "Send Clarification Request",
          icon: <Send size={16} />,
          bg: "#7C3AED",
          hoverBg: "#6D28D9"
        };
      default:
        return {
          label: "Confirm & Apply Normalization",
          icon: <Check size={16} />,
          bg: "#2563EB",
          hoverBg: "#1D4ED8"
        };
    }
  };

  const primaryMeta = getPrimaryButtonMeta();

  // Helper for 6-State Status Badge rendering
  const renderStatusBadge = (status: ExceptionStatusBadge, isResolved: boolean) => {
    if (isResolved || status === "Resolved") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 12px",
            borderRadius: "14px",
            backgroundColor: "#ECFDF5",
            color: "#047857",
            border: "1px solid #A7F3D0",
            fontSize: "12px",
            fontWeight: 700
          }}
        >
          <CheckCircle2 size={13} color="#059669" />
          <span>Resolved: Decision saved successfully</span>
        </span>
      );
    }

    switch (status) {
      case "Finding confirmed":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 12px",
              borderRadius: "14px",
              backgroundColor: "#EFF6FF",
              color: "#1D4ED8",
              border: "1px solid #BFDBFE",
              fontSize: "12px",
              fontWeight: 700
            }}
          >
            <Check size={13} color="#1D4ED8" />
            <span>Finding confirmed: Finding verified</span>
          </span>
        );
      case "Deviation accepted":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 12px",
              borderRadius: "14px",
              backgroundColor: "#F0F9FF",
              color: "#0369A1",
              border: "1px solid #BAE6FD",
              fontSize: "12px",
              fontWeight: 700
            }}
          >
            <ShieldCheck size={13} color="#0284C7" />
            <span>Deviation accepted: Risk approved</span>
          </span>
        );
      case "Clarification requested":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 12px",
              borderRadius: "14px",
              backgroundColor: "#F5F3FF",
              color: "#6D28D9",
              border: "1px solid #DDD6FE",
              fontSize: "12px",
              fontWeight: 700
            }}
          >
            <MessageSquare size={13} color="#7C3AED" />
            <span>Clarification requested: Awaiting vendor</span>
          </span>
        );
      case "Non-compliant":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 12px",
              borderRadius: "14px",
              backgroundColor: "#FEF2F2",
              color: "#B91C1C",
              border: "1px solid #FECACA",
              fontSize: "12px",
              fontWeight: 700
            }}
          >
            <AlertTriangle size={13} color="#DC2626" />
            <span>Non-compliant: Disqualified</span>
          </span>
        );
      case "Pending review":
      default:
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 12px",
              borderRadius: "14px",
              backgroundColor: "#FFFBEB",
              color: "#92400E",
              border: "1px solid #FDE68A",
              fontSize: "12px",
              fontWeight: 700
            }}
          >
            <Clock size={13} color="#D97706" />
            <span>Pending review: Review required</span>
          </span>
        );
    }
  };

  const renderIcon = (type: string) => {
    if (type === "terms") return <FileText size={18} color="#2563EB" />;
    if (type === "bundle") return <Layers size={18} color="#2563EB" />;
    if (type === "missing") return <AlertTriangle size={18} color="#DC2626" />;
    if (type === "delivery") return <Truck size={18} color="#D97706" />;
    if (type === "tier") return <Layers size={18} color="#2563EB" />;
    if (type === "warranty") return <Sparkles size={18} color="#7C3AED" />;
    return <FileText size={18} color="#2563EB" />;
  };

  return (
    <div
      style={{
        padding: "24px 36px 40px 36px",
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}
    >
      {/* 1. Header with Breadcrumb & Title on Left, 3 KPI Stat Counters on Right */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#2563EB",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>STAGE 2 OF 4</span>
            <span style={{ color: "#94A3B8" }}>•</span>
            <span style={{ color: "#64748B" }}>Exception review</span>
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#0F172A",
              margin: "4px 0 0 0",
              letterSpacing: "-0.4px"
            }}
          >
            Review & Resolve Exceptions
          </h1>
          <p style={{ fontSize: "13.5px", color: "#64748B", margin: "4px 0 0 0" }}>
            {exceptions.length} exceptions identified across supplier quotations. Confirm findings, verify spatial coordinates, and apply auditable normalizations.
          </p>
        </div>

        {/* 3 Top-Right KPI Stat Counters */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Resolved */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#ECFDF5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <CheckCircle2 size={18} color="#059669" />
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#0F172A", lineHeight: 1.1 }}>
                {resolvedCount}
              </div>
              <div style={{ fontSize: "11.5px", color: "#64748B", fontWeight: 500 }}>
                Resolved
              </div>
            </div>
          </div>

          {/* Pending Review */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#FFFBEB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <AlertTriangle size={18} color="#D97706" />
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#0F172A", lineHeight: 1.1 }}>
                {pendingCount}
              </div>
              <div style={{ fontSize: "11.5px", color: "#64748B", fontWeight: 500 }}>
                Pending Review
              </div>
            </div>
          </div>

          {/* Clarifications */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#F5F3FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <MessageSquare size={18} color="#7C3AED" />
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#0F172A", lineHeight: 1.1 }}>
                {clarificationsCount}
              </div>
              <div style={{ fontSize: "11.5px", color: "#64748B", fontWeight: 500 }}>
                Clarifications
              </div>
            </div>
          </div>

          {/* Quick Action: Batch Verify All or Proceed */}
          <button
            onClick={() => {
              if (pendingCount > 0) {
                handleBatchVerifyAll();
              } else {
                onProceedToAnalysis();
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#059669",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "12px",
              padding: "12px 20px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(5, 150, 105, 0.25)",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#047857")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#059669")}
          >
            <CheckCircle2 size={16} />
            <span>{pendingCount > 0 ? `Verify All & Proceed to Step 3 (${pendingCount})` : "Proceed to Stage 3: Optimization"}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Auto-Transition Notice Alert */}
      {autoTransitionNotice && (
        <div
          style={{
            backgroundColor: "#ECFDF5",
            border: "1.5px solid #10B981",
            borderRadius: "12px",
            padding: "14px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#065F46",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#D1FAE5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <CheckCircle2 size={20} color="#059669" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "14px", color: "#065F46" }}>
                ✓ All Quotations & Exceptions Successfully Verified!
              </div>
              <div style={{ fontSize: "12.5px", color: "#047857", marginTop: "2px" }}>
                {autoTransitionNotice}
              </div>
            </div>
          </div>
          <button
            onClick={onProceedToAnalysis}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#059669",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              padding: "9px 18px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(5, 150, 105, 0.2)"
            }}
          >
            <span>Proceed Now</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* 2. Main Two-Column Interactive Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "330px 1fr",
          gap: "24px",
          alignItems: "start"
        }}
      >
        {/* Left Column: Exceptions by Supplier List */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "18px 16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
            position: "sticky",
            top: "20px"
          }}
        >
          <div
            style={{
              fontSize: "13.5px",
              fontWeight: 700,
              color: "#0F172A",
              padding: "0 6px 6px 6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <span>Exceptions by Supplier</span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                backgroundColor: "#EFF6FF",
                color: "#1D4ED8",
                padding: "2px 8px",
                borderRadius: "10px"
              }}
            >
              {exceptions.length} Total
            </span>
          </div>

          {pendingCount > 0 && (
            <button
              onClick={handleBatchVerifyAll}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                width: "100%",
                padding: "8px 12px",
                backgroundColor: "#ECFDF5",
                color: "#047857",
                border: "1px solid #A7F3D0",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: "4px",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#D1FAE5")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#ECFDF5")}
            >
              <CheckCircle2 size={13} color="#059669" />
              <span>Verify All ({pendingCount} pending)</span>
            </button>
          )}

          {exceptions.map((exc) => {
            const isSelected = activeExc && activeExc.id === exc.id;

            return (
              <div
                key={exc.id}
                onClick={() => {
                  setLocalSelectedId(exc.id);
                  onSelectExceptionId?.(exc.id);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
                  border: isSelected ? "1.5px solid #2563EB" : "1px solid #F1F5F9",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      backgroundColor: isSelected ? "#DBEAFE" : "#F8FAFC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    {renderIcon(exc.iconType)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#0F172A",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {exc.supplierName}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#64748B",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginTop: "1px"
                      }}
                    >
                      {exc.category}
                    </div>
                  </div>
                </div>

                {/* Right Lifecycle Indicator Badge */}
                <div
                  onClick={(e) => {
                    if (!exc.isResolved) {
                      e.stopPropagation();
                      handleQuickVerifyOne(exc.id);
                    }
                  }}
                  title={!exc.isResolved ? "Click to verify this exception" : "Verified & normalized"}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "10px",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    flexShrink: 0,
                    cursor: !exc.isResolved ? "pointer" : "default",
                    backgroundColor: exc.isResolved
                      ? "#ECFDF5"
                      : exc.statusBadge === "Finding confirmed"
                        ? "#EFF6FF"
                        : exc.statusBadge === "Deviation accepted"
                          ? "#F0F9FF"
                          : exc.statusBadge === "Clarification requested"
                            ? "#F5F3FF"
                            : "#FFFBEB",
                    color: exc.isResolved
                      ? "#047857"
                      : exc.statusBadge === "Finding confirmed"
                        ? "#1D4ED8"
                        : exc.statusBadge === "Deviation accepted"
                          ? "#0369A1"
                          : exc.statusBadge === "Clarification requested"
                            ? "#6D28D9"
                            : "#92400E",
                    border: exc.isResolved
                      ? "1px solid #A7F3D0"
                      : exc.statusBadge === "Finding confirmed"
                        ? "1px solid #BFDBFE"
                        : exc.statusBadge === "Deviation accepted"
                          ? "1px solid #BAE6FD"
                          : exc.statusBadge === "Clarification requested"
                            ? "1px solid #DDD6FE"
                            : "1px solid #FDE68A"
                  }}
                >
                  {exc.isResolved
                    ? "✓ Resolved"
                    : exc.statusBadge === "Finding confirmed"
                      ? "Confirmed"
                      : exc.statusBadge === "Deviation accepted"
                        ? "Deviation"
                        : exc.statusBadge === "Clarification requested"
                          ? "Clarify"
                          : "Verify →"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Main Pane: Active Exception Detail with Strict 5-Section Hierarchy */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "26px 30px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}
        >
          {/* Header Row: Exception review Breadcrumb & 6-State Status Pill */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Exception review
              </div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#0F172A",
                  margin: "2px 0 0 0",
                  letterSpacing: "-0.3px"
                }}
              >
                {activeExc.supplierName}
              </h2>
            </div>

            {/* Top-Right Status Badge (Separating Confirmed from Resolved) */}
            <div>{renderStatusBadge(activeExc.statusBadge, activeExc.isResolved)}</div>
          </div>

          {/* =========================================================================
              SECTION 1: 1. What was found (Extracted vendor terms & original source)
             ========================================================================= */}
          <div
            style={{
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "18px 20px"
            }}
          >
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: 700,
                color: "#0F172A",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px"
              }}
            >
              <FileText size={16} color="#2563EB" />
              <span>1. What was found</span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  backgroundColor: "#EFF6FF",
                  color: "#1D4ED8",
                  padding: "2px 8px",
                  borderRadius: "6px"
                }}
              >
                Extracted vendor terms & original source
              </span>
            </div>

            {/* Extracted Vendor Terms */}
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                fontSize: "13px",
                color: "#334155",
                lineHeight: 1.6
              }}
            >
              {activeExc.whatWasFound.map((item, i) => (
                <li key={i} style={{ marginBottom: "6px" }}>
                  {item}
                </li>
              ))}
            </ul>

            {/* Precise Auditable Source Coordinates Box */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: "8px",
                padding: "10px 14px",
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
                fontSize: "12px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ color: "#64748B", fontWeight: 600 }}>Source:</span>
                  <span style={{ color: "#0F172A", fontWeight: 700, fontFamily: "monospace" }}>
                    {activeExc.sourceCoordinates?.sourceFile || activeExc.sourceDocName}
                  </span>
                </div>

                {(activeExc.sourceCoordinates?.sheet || activeExc.sourceTag.includes("Sheet")) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "#CBD5E1" }}>•</span>
                    <span style={{ color: "#64748B", fontWeight: 600 }}>Sheet:</span>
                    <span style={{ color: "#0F172A", fontWeight: 600 }}>
                      {activeExc.sourceCoordinates?.sheet || "Commercial Quotation"}
                    </span>
                  </div>
                )}

                {(activeExc.sourceCoordinates?.row || activeExc.sourceCoordinates?.cell) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "#CBD5E1" }}>•</span>
                    <span style={{ color: "#64748B", fontWeight: 600 }}>Row:</span>
                    <span style={{ color: "#0F172A", fontWeight: 700 }}>
                      {activeExc.sourceCoordinates?.row || "18"}
                    </span>
                  </div>
                )}

                {(activeExc.sourceCoordinates?.column || activeExc.sourceCoordinates?.cell) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "#CBD5E1" }}>•</span>
                    <span style={{ color: "#64748B", fontWeight: 600 }}>Column:</span>
                    <span style={{ color: "#0F172A", fontWeight: 600 }}>
                      {activeExc.sourceCoordinates?.column || "Freight / Discount Terms"}
                    </span>
                  </div>
                )}

                {activeExc.sourceCoordinates?.cell && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "#CBD5E1" }}>•</span>
                    <span style={{ color: "#64748B", fontWeight: 600 }}>Cell:</span>
                    <span
                      style={{
                        color: "#1D4ED8",
                        fontWeight: 700,
                        backgroundColor: "#EFF6FF",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        border: "1px solid #BFDBFE"
                      }}
                    >
                      {activeExc.sourceCoordinates.cell}
                    </span>
                  </div>
                )}

                {activeExc.sourceCoordinates?.page && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "#CBD5E1" }}>•</span>
                    <span style={{ color: "#64748B", fontWeight: 600 }}>Page:</span>
                    <span style={{ color: "#0F172A", fontWeight: 600 }}>
                      {activeExc.sourceCoordinates.page}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setProvenanceToast(
                    `Verified Spatial Grounding: Row ${activeExc.sourceCoordinates?.row || "18"} in ${activeExc.sourceDocName} (Page ${activeExc.sourceCoordinates?.page || "1"})`
                  );
                  setTimeout(() => setProvenanceToast(null), 3500);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  color: "#2563EB",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  padding: 0
                }}
              >
                <span>View in original document</span>
                <ExternalLink size={12} />
              </button>
            </div>

            {provenanceToast && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  fontSize: "12px",
                  color: "#166534",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <CheckCircle2 size={14} color="#16A34A" />
                <span>{provenanceToast}</span>
              </div>
            )}
          </div>

          {/* =========================================================================
              SECTION 2: 2. AI interpretation (Why system identified an exception)
             ========================================================================= */}
          <div
            style={{
              backgroundColor: "#F5F3FF",
              border: "1px solid #DDD6FE",
              borderRadius: "12px",
              padding: "16px 20px"
            }}
          >
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: 700,
                color: "#4338CA",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "10px"
              }}
            >
              <Sparkles size={16} color="#6366F1" />
              <span>2. AI Extraction Rationale & Governance Rules</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px" }}>
                <span style={{ fontWeight: 700, color: "#4338CA", minWidth: "115px", flexShrink: 0 }}>📌 Finding:</span>
                <span style={{ color: "#1E293B", lineHeight: 1.5 }}>{activeExc.aiInterpretation}</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px" }}>
                <span style={{ fontWeight: 700, color: "#4338CA", minWidth: "115px", flexShrink: 0 }}>⚖️ Rule Applied:</span>
                <span style={{ color: "#1E293B", lineHeight: 1.5 }}>
                  {activeExc.aiReasoningPoints
                    ? activeExc.aiReasoningPoints.slice(0, 3).join("; ")
                    : "Volume discount rebate validated; Ex-Works rate normalized to DDP delivered terms."}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px" }}>
                <span style={{ fontWeight: 700, color: "#059669", minWidth: "115px", flexShrink: 0 }}>💡 Landed Impact:</span>
                <span style={{ color: "#065F46", fontWeight: 600, lineHeight: 1.5 }}>
                  {activeExc.keyTakeaway || "Landed price adjusted to ensure zero hidden buyer transport liability."}
                </span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 3: 3. Normalization and impact (Scenarios & Destination Freight)
             ========================================================================= */}
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#0F172A",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span>3. Normalization and impact</span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  backgroundColor: "#F1F5F9",
                  color: "#475569",
                  padding: "2px 8px",
                  borderRadius: "6px"
                }}
              >
                Pricing scenarios, financial impact & multi-destination equalization
              </span>
            </div>

            {/* Side-by-Side Scenarios & Key Takeaway */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1.2fr 1fr",
                gap: "16px"
              }}
            >
              {/* Scenario A */}
              <div
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0F172A" }}>
                    {activeExc.scenarioA.title}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748B", marginBottom: "12px" }}>
                    {activeExc.scenarioA.subtitle}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {activeExc.scenarioA.rows.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12.5px",
                          color: r.color || "#334155"
                        }}
                      >
                        <span>{r.label}</span>
                        <span style={{ fontWeight: 600 }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #E2E8F0",
                    paddingTop: "10px",
                    marginTop: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#0F172A" }}>
                    Landed price
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A" }}>
                    {activeExc.scenarioA.landedPrice}
                  </span>
                </div>
              </div>

              {/* Scenario B */}
              <div
                style={{
                  backgroundColor: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  borderRadius: "12px",
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#166534" }}>
                    {activeExc.scenarioB.title}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#15803D", marginBottom: "12px" }}>
                    {activeExc.scenarioB.subtitle}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {activeExc.scenarioB.rows.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12.5px",
                          color: r.color || "#166534"
                        }}
                      >
                        <span>{r.label}</span>
                        <span style={{ fontWeight: 600 }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #BBF7D0",
                    paddingTop: "10px",
                    marginTop: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#166534" }}>
                    Landed price
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#166534" }}>
                    {activeExc.scenarioB.landedPrice}
                  </span>
                </div>
              </div>

              {/* Key Takeaway */}
              <div
                style={{
                  backgroundColor: "#F0F9FF",
                  border: "1px solid #BAE6FD",
                  borderRadius: "12px",
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#0369A1", fontSize: "12.5px", fontWeight: 700 }}>
                  <Info size={15} />
                  <span>Key takeaway</span>
                </div>
                <p style={{ fontSize: "13px", color: "#0C4A6E", lineHeight: 1.55, margin: 0, fontWeight: 700 }}>
                  {activeExc.keyTakeaway}
                </p>
                <div style={{ fontSize: "11px", color: "#0284C7", lineHeight: 1.4 }}>
                  Precise evaluation: savings depend on meeting the contractual volume condition.
                </div>
              </div>
            </div>

            {/* Destination Freight Equalization Matrix (Requirement C) */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                padding: "14px 18px",
                marginTop: "14px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: 700, color: "#0F172A" }}>
                  <Truck size={15} color="#2563EB" />
                  <span>Destination Freight Verification (Bengaluru vs. Mumbai)</span>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    backgroundColor: "#EFF6FF",
                    color: "#1D4ED8",
                    padding: "2px 8px",
                    borderRadius: "6px"
                  }}
                >
                  Ex-Warehouse Pune Origin Verified
                </span>
              </div>

              {/* Destination Breakdown Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B" }}>
                      <th style={{ padding: "8px 12px", fontWeight: 600 }}>Delivery Destination</th>
                      <th style={{ padding: "8px 12px", fontWeight: 600 }}>Distance (Pune Hub)</th>
                      <th style={{ padding: "8px 12px", fontWeight: 600 }}>Allocation Qty</th>
                      <th style={{ padding: "8px 12px", fontWeight: 600 }}>Freight / Unit</th>
                      <th style={{ padding: "8px 12px", fontWeight: 600 }}>Base Rate - 5% Rebate</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700, color: "#0F172A" }}>Normalized Landed Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "9px 12px", fontWeight: 600, color: "#0F172A", display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={13} color="#2563EB" />
                        <span>Bengaluru Tech Center</span>
                      </td>
                      <td style={{ padding: "9px 12px", color: "#64748B" }}>840 km</td>
                      <td style={{ padding: "9px 12px", fontWeight: 600, color: "#0F172A" }}>80 Units</td>
                      <td style={{ padding: "9px 12px", color: "#2563EB", fontWeight: 600 }}>+₹1,200</td>
                      <td style={{ padding: "9px 12px", color: "#16A34A" }}>₹99,275</td>
                      <td style={{ padding: "9px 12px", fontWeight: 700, color: "#0F172A" }}>₹1,00,475 / unit</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "9px 12px", fontWeight: 600, color: "#0F172A", display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={13} color="#059669" />
                        <span>Mumbai Tech Center</span>
                      </td>
                      <td style={{ padding: "9px 12px", color: "#64748B" }}>150 km</td>
                      <td style={{ padding: "9px 12px", fontWeight: 600, color: "#0F172A" }}>40 Units</td>
                      <td style={{ padding: "9px 12px", color: "#059669", fontWeight: 600 }}>+₹450</td>
                      <td style={{ padding: "9px 12px", color: "#16A34A" }}>₹99,275</td>
                      <td style={{ padding: "9px 12px", fontWeight: 700, color: "#0F172A" }}>₹99,725 / unit</td>
                    </tr>
                    <tr style={{ backgroundColor: "#F0FDF4" }}>
                      <td style={{ padding: "9px 12px", fontWeight: 700, color: "#166534" }}>
                        Weighted Lot Total (DDP Equalized)
                      </td>
                      <td style={{ padding: "9px 12px", color: "#166534" }}>Inter-state + Regional</td>
                      <td style={{ padding: "9px 12px", fontWeight: 700, color: "#166534" }}>120 Units</td>
                      <td style={{ padding: "9px 12px", color: "#166534", fontWeight: 700 }}>+₹950 (Blended)</td>
                      <td style={{ padding: "9px 12px", color: "#166534" }}>₹99,275</td>
                      <td style={{ padding: "9px 12px", fontWeight: 800, color: "#166534" }}>₹1,00,225 / unit</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: "11px", color: "#64748B", marginTop: "8px" }}>
                * Source quotation states <em>Ex-Warehouse Pune</em>. Sourcing requirements cover Bengaluru (80u) and Mumbai (40u); separate freight tariffs avoid miscalculating landed total.
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 4: 4. Commercial assumptions (Collapsible Accordion)
             ========================================================================= */}
          <div
            style={{
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              overflow: "hidden"
            }}
          >
            <button
              onClick={() => setIsAssumptionsOpen(prev => !prev)}
              style={{
                width: "100%",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#F8FAFC",
                border: "none",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={16} color="#2563EB" />
                <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#0F172A" }}>
                  4. Commercial assumptions
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    backgroundColor: "#FFFFFF",
                    color: "#475569",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    border: "1px solid #E2E8F0"
                  }}
                >
                  Expand for detailed arithmetic calculations
                </span>
              </div>
              <ChevronDown
                size={16}
                color="#64748B"
                style={{
                  transform: isAssumptionsOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease"
                }}
              />
            </button>

            {isAssumptionsOpen && (
              <div style={{ padding: "14px 20px 18px 20px", borderTop: "1px solid #E2E8F0", backgroundColor: "#FFFFFF" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", color: "#334155", lineHeight: 1.6 }}>
                  {(activeExc.normalizationAssumptions || [
                    "The 120-unit order qualifies for the 5% rebate (order volume 120 ≥ threshold 100 units).",
                    "The rebate applies to the base rate (₹1,04,500), not freight.",
                    "The ₹1,200 freight amount is the vendor-stated freight cost for Bengaluru delivery (840 km).",
                    "The Mumbai Tech Center freight is adjusted to ₹450/unit based on regional short-haul transit (150 km).",
                    "Blended weighted average landed price is ₹1,00,225 across the combined 120-unit split."
                  ]).map((asmp, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <span style={{ color: "#2563EB", fontWeight: 700 }}>•</span>
                      <span>{asmp}</span>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "10px", fontStyle: "italic" }}>
                  * Explicitly stating these assumptions avoids presenting contractual estimates as verified facts.
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              SECTION 5: 5. Buyer decision (Radio Selector + Contextual Primary Action)
             ========================================================================= */}
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#0F172A",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span>5. Buyer decision</span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  backgroundColor: "#F1F5F9",
                  color: "#475569",
                  padding: "2px 8px",
                  borderRadius: "6px"
                }}
              >
                Select decision to update primary action
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "14px"
              }}
            >
              {/* Option 1: Confirm finding */}
              <label
                onClick={() => handleActionChange("confirm")}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "14px",
                  borderRadius: "10px",
                  backgroundColor: activeExc.selectedAction === "confirm" ? "#EFF6FF" : "#FFFFFF",
                  border: activeExc.selectedAction === "confirm" ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <input
                  type="radio"
                  name="buyerAction"
                  checked={activeExc.selectedAction === "confirm"}
                  onChange={() => handleActionChange("confirm")}
                  style={{ marginTop: "3px", accentColor: "#2563EB" }}
                />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                    Confirm finding
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "2px" }}>
                    Finding verified & correct
                  </div>
                </div>
              </label>

              {/* Option 2: Edit extracted data */}
              <label
                onClick={() => handleActionChange("edit")}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "14px",
                  borderRadius: "10px",
                  backgroundColor: activeExc.selectedAction === "edit" ? "#EFF6FF" : "#FFFFFF",
                  border: activeExc.selectedAction === "edit" ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <input
                  type="radio"
                  name="buyerAction"
                  checked={activeExc.selectedAction === "edit"}
                  onChange={() => handleActionChange("edit")}
                  style={{ marginTop: "3px", accentColor: "#2563EB" }}
                />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                    Edit extracted data
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "2px" }}>
                    Update terms or override rate
                  </div>
                </div>
              </label>

              {/* Option 3: Accept deviation */}
              <label
                onClick={() => handleActionChange("accept")}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "14px",
                  borderRadius: "10px",
                  backgroundColor: activeExc.selectedAction === "accept" ? "#EFF6FF" : "#FFFFFF",
                  border: activeExc.selectedAction === "accept" ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <input
                  type="radio"
                  name="buyerAction"
                  checked={activeExc.selectedAction === "accept"}
                  onChange={() => handleActionChange("accept")}
                  style={{ marginTop: "3px", accentColor: "#2563EB" }}
                />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                    Accept deviation
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "2px" }}>
                    Proceed with quoted variance
                  </div>
                </div>
              </label>

              {/* Option 4: Request clarification */}
              <label
                onClick={() => handleActionChange("clarify")}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "14px",
                  borderRadius: "10px",
                  backgroundColor: activeExc.selectedAction === "clarify" ? "#EFF6FF" : "#FFFFFF",
                  border: activeExc.selectedAction === "clarify" ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <input
                  type="radio"
                  name="buyerAction"
                  checked={activeExc.selectedAction === "clarify"}
                  onChange={() => handleActionChange("clarify")}
                  style={{ marginTop: "3px", accentColor: "#2563EB" }}
                />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                    Request clarification
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "2px" }}>
                    Ask vendor for formal schedule
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Navigation Bar with Dynamic Contextual Action */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 0 20px 0",
          borderTop: "1px solid #E2E8F0"
        }}
      >
        <button
          onClick={onBackToIngest}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#FFFFFF",
            color: "#334155",
            border: "1px solid #CBD5E1",
            borderRadius: "8px",
            padding: "9px 20px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
        >
          <ArrowLeft size={15} />
          <span>Back to Uploads</span>
        </button>

        {/* Dynamic Contextual Action Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {pendingCount > 0 && (
            <button
              onClick={handleBatchVerifyAll}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#ECFDF5",
                color: "#047857",
                border: "1px solid #A7F3D0",
                borderRadius: "8px",
                padding: "9px 16px",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#D1FAE5")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#ECFDF5")}
            >
              <CheckCircle2 size={14} color="#059669" />
              <span>Verify All Documents ({pendingCount})</span>
            </button>
          )}

          {activeExc.isResolved && (
            <button
              onClick={handleReopenForReview}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#FFFFFF",
                color: "#64748B",
                border: "1px solid #CBD5E1",
                borderRadius: "8px",
                padding: "9px 16px",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
            >
              <RotateCcw size={14} />
              <span>Re-open for Review</span>
            </button>
          )}

          <button
            onClick={handlePrimaryContextualAction}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: primaryMeta.bg,
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              padding: "10px 24px",
              fontSize: "13.5px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "background-color 0.15s ease"
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = primaryMeta.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = primaryMeta.bg)}
          >
            {primaryMeta.icon}
            <span>{primaryMeta.label}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Clarification Email Modal */}
      {showClarificationModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            backdropFilter: "blur(2px)"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "600px",
              maxWidth: "92vw",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MessageSquare size={18} color="#7C3AED" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  Draft RFx Clarification to {activeExc.supplierName}
                </h3>
              </div>
              <button
                onClick={() => setShowClarificationModal(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94A3B8" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "12px", color: "#64748B" }}>
                Pre-compiled supplier clarification message grounded in verified source quote:
              </div>
              <textarea
                value={clarificationDraft}
                onChange={e => setClarificationDraft(e.target.value)}
                rows={7}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px",
                  fontFamily: "monospace",
                  color: "#1E293B",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div
              style={{
                padding: "14px 24px",
                backgroundColor: "#F8FAFC",
                borderTop: "1px solid #E2E8F0",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px"
              }}
            >
              <button
                onClick={() => setShowClarificationModal(false)}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "6px",
                  padding: "7px 16px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowClarificationModal(false);
                  const updated = exceptions.map(e => {
                    if (e.id === activeExc.id) {
                      return {
                        ...e,
                        isResolved: true,
                        statusBadge: "Clarification requested" as ExceptionStatusBadge,
                        statusColor: "#7C3AED"
                      };
                    }
                    return e;
                  });
                  onUpdateExceptions(updated);
                  advanceToNextException(updated);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#7C3AED",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "7px 18px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                <Send size={13} />
                <span>Dispatch Clarification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Data Modal */}
      {showEditModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            backdropFilter: "blur(2px)"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "480px",
              maxWidth: "92vw",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Edit3 size={18} color="#2563EB" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  Override Extracted Landed Value
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94A3B8" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "12.5px", color: "#64748B" }}>
                Enter custom agreed landed rate per unit (INR) for {activeExc.supplierName}:
              </div>
              <input
                type="text"
                value={customValue}
                onChange={e => setCustomValue(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0F172A",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div
              style={{
                padding: "14px 24px",
                backgroundColor: "#F8FAFC",
                borderTop: "1px solid #E2E8F0",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px"
              }}
            >
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "6px",
                  padding: "7px 16px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  const formattedValue = `₹${Number(customValue).toLocaleString("en-IN")}`;
                  const updated = exceptions.map(e => {
                    if (e.id === activeExc.id) {
                      return {
                        ...e,
                        isResolved: true,
                        statusBadge: "Finding confirmed" as ExceptionStatusBadge,
                        statusColor: "#2563EB",
                        scenarioB: {
                          ...e.scenarioB,
                          landedPrice: formattedValue
                        }
                      };
                    }
                    return e;
                  });
                  onUpdateExceptions(updated);
                  advanceToNextException(updated);
                }}
                style={{
                  backgroundColor: "#2563EB",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "7px 18px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Save Changes & Recalculate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
