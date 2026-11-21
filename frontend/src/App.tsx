import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { StepNavigationHeader } from "./components/StepNavigationHeader";
import { Step1Ingestion } from "./components/steps/Step1Ingestion";
import { Step2Review } from "./components/steps/Step2Review";
import { Step3Analysis } from "./components/steps/Step3Analysis";
import { Step4Award } from "./components/steps/Step4Award";
import { SourceViewerDrawer } from "./components/SourceViewerDrawer";
import { AwardMemoModal } from "./components/AwardMemoModal";
import { AeraCopilot } from "./components/AeraCopilot";
import type { SupplierRow, ExceptionData } from "./types/procurement";
import {
  fetchQuoteMatrix,
  fetchVendorProfiles,
  solveScenario,
  fetchQuarantineItems,
  fetchAwardMemo,
  resetToBenchmarkDefaults
} from "./api";

const initialSuppliers: SupplierRow[] = [
  {
    id: "VEND-001",
    name: "Apex Technology Solutions",
    file: "vendor_1_apex_quote.xlsx",
    fileType: "xlsx",
    itemsExtracted: "30/30",
    status: "Processed",
    incoterms: "Ex-Works Bhiwandi",
    paymentTerms: "Net 30 Days",
    notes: "Multi-tab workbook with Tier-2 quantity breaks; freight normalized to DDP (+₹450/unit). Cleared Quality Questionnaire (Score: 94).",
    flagType: "info"
  },
  {
    id: "VEND-002",
    name: "CompuZone India Pvt Ltd",
    file: "vendor_2_compuzone_quote.pdf",
    fileType: "pdf",
    itemsExtracted: "30/30",
    status: "Processed",
    incoterms: "DDP Tech Centers",
    paymentTerms: "Net 60 Days",
    notes: "Footnote #3 indicates conditional 4.5% annual turnover rebate (> ₹1.5 Cr) and +8% handling surcharge. Cleared Quality Questionnaire (Score: 98).",
    flagType: "warning"
  },
  {
    id: "VEND-003",
    name: "National IT Systems",
    file: "vendor_3_national_quote.docx",
    fileType: "docx",
    itemsExtracted: "30/30",
    status: "Processed",
    incoterms: "DDP Delivered",
    paymentTerms: "Net 45 Days",
    notes: "Narrative prose tier (₹104,500). Technical eligibility check required on high-end hardware. Cleared Quality Questionnaire (Score: 95).",
    flagType: "success"
  },
  {
    id: "VEND-004",
    name: "Vardhman Infotech",
    file: "vendor_4_vardhman_quote.jpg",
    fileType: "jpg",
    itemsExtracted: "27/30",
    status: "Needs review",
    incoterms: "Ex-Works Surat",
    paymentTerms: "Net 15 Days",
    notes: "Physical scan with handwritten margin annotations; 3 enterprise server lines missing; 16-day SLA; Quality Questionnaire Failed/Pending.",
    flagType: "warning"
  },
  {
    id: "VEND-005",
    name: "Shree Balaji Infotech",
    file: "vendor_5_balaji_quote.eml",
    fileType: "eml",
    itemsExtracted: "30/30",
    status: "Processed",
    incoterms: "DDP Mumbai/Bengaluru",
    paymentTerms: "Net 45 Days",
    notes: "Quoted 2025 Contract baseline indexed to +3.5% FX escalation; bundled modular docks. Cleared Quality Questionnaire (Score: 91).",
    flagType: "warning"
  }
];

const initialExceptions: ExceptionData[] = [
  {
    id: "EXC-001",
    exceptionNumber: 1,
    supplierName: "CompuZone India Pvt Ltd",
    category: "Hidden commercial terms",
    iconType: "terms",
    sourceTag: "vendor_2_compuzone_quote.pdf • Page 4 • Footnote 3",
    sourceDocName: "vendor_2_compuzone_quote.pdf",
    sourceCoordinates: {
      sourceFile: "vendor_2_compuzone_quote.pdf",
      page: 4,
      clause: "Footnote #3 (Rebates & Staging)",
      column: "Commercial Annexure"
    },
    statusBadge: "Pending review",
    statusColor: "#D97706",
    whatWasFound: [
      "4.5% annual turnover rebate (if total spend > ₹1.50 Cr)",
      "8% staging, imaging and integration handling charge (added to Ex-Warehouse rates)"
    ],
    aiInterpretation:
      "Both terms affect the final landed price. The rebate is conditional on achieving the ₹1.50 Cr threshold, and the handling charge is an additional cost, not a fixed flat rate.",
    aiReasoningPoints: [
      "RFx annual spend target: ₹17.90 Cr.",
      "Vendor's rebate threshold: ₹1.50 Cr annual spend.",
      "Quoted delivery term: DDP with unbundled depot handling (+8%).",
      "RFx delivery requirement: DDP Bengaluru and Mumbai (inclusive of offloading).",
      "Normalization required: Disallow unbundled handling fee and apply contractually verified rebate."
    ],
    normalizationAssumptions: [
      "The projected spend comfortably qualifies for the 4.5% annual turnover rebate (> ₹1.50 Cr threshold).",
      "The 4.5% rebate applies to the base unit rate (₹1,00,000), not handling or taxes.",
      "The +8% handling fee is vendor-stated for depot staging and ESD palletization.",
      "The calculation assumes delivery is direct DDP to tech centers, making offloading fees disallowable under RFx terms."
    ],
    scenarioA: {
      title: "Scenario A: Without rebate",
      subtitle: "(Conservative)",
      rows: [
        { label: "Base price", value: "₹1,00,000" },
        { label: "Handling (8%)", value: "+₹8,000" }
      ],
      landedPrice: "₹1,08,000"
    },
    scenarioB: {
      title: "Scenario B: If rebate threshold is achieved",
      subtitle: "(> ₹1.50 Cr)",
      rows: [
        { label: "Base price", value: "₹1,00,000" },
        { label: "Turnover rebate (4.5%)", value: "-₹4,500", color: "#16A34A" },
        { label: "Handling (8%)", value: "+₹8,000" }
      ],
      landedPrice: "₹1,03,500"
    },
    keyTakeaway:
      "Potential saving: ₹4,500 per unit (4.5%) with ₹8,000 handling fee disallowed under RFx terms.",
    selectedAction: "confirm",
    isResolved: false
  },
  {
    id: "EXC-002",
    exceptionNumber: 2,
    supplierName: "Apex Technology Solutions",
    category: "Tiered volume pricing & Ex-Works freight",
    iconType: "tier",
    sourceTag: "vendor_1_apex_quote.xlsx • Tab 1 • Row 18",
    sourceDocName: "vendor_1_apex_quote.xlsx",
    sourceCoordinates: {
      sourceFile: "vendor_1_apex_quote.xlsx",
      sheet: "Commercial Quotation",
      row: 18,
      column: "Freight / Discount Terms",
      cell: "E18:F18"
    },
    statusBadge: "Pending review",
    statusColor: "#D97706",
    whatWasFound: [
      "Volume tier parsed: Orders ≥ 100 units qualify for enterprise price breaks",
      "Ex-Warehouse Bhiwandi logistics: Requires destination freight equalization (+₹450 Mumbai / +₹1,200 Bengaluru)"
    ],
    aiInterpretation:
      "For our 120-unit laptop lot (Line 1 ThinkPad T14s), the volume discount activates. Because the quote is Ex-Warehouse Bhiwandi, freight is normalized to DDP delivered terms (+₹450/unit average).",
    aiReasoningPoints: [
      "RFx quantity: 120 units.",
      "Vendor's rebate threshold: 100 units.",
      "Quoted delivery term: Ex-Warehouse Bhiwandi.",
      "RFx delivery requirement: DDP Bengaluru and Mumbai.",
      "Normalization required: Freight normalization to DDP equivalent."
    ],
    normalizationAssumptions: [
      "The 120-unit order qualifies for volume tier pricing.",
      "Logistics normalization adds ₹450/unit blended freight to tech centers.",
      "Landed price becomes ₹1,02,360, beating all competing eligible bids on ThinkPad T14s."
    ],
    scenarioA: {
      title: "Standard baseline rate",
      subtitle: "(Raw unadjusted quote)",
      rows: [
        { label: "Raw base price", value: "₹1,01,910" },
        { label: "Freight (Un-normalized)", value: "Ex-Warehouse" }
      ],
      landedPrice: "₹1,01,910"
    },
    scenarioB: {
      title: "Normalized DDP Delivered Rate",
      subtitle: "(TCO Landed Parity)",
      rows: [
        { label: "Raw base price", value: "₹1,01,910" },
        { label: "Freight equalization", value: "+₹450" }
      ],
      landedPrice: "₹1,02,360"
    },
    keyTakeaway: "Normalized landed price is ₹1,02,360, making Apex the lowest compliant bidder on Line 1.",
    selectedAction: "confirm",
    isResolved: false
  },
  {
    id: "EXC-003",
    exceptionNumber: 3,
    supplierName: "National IT Systems",
    category: "Technical Spec Equivalence (Suspicious Blanket Price)",
    iconType: "tier",
    sourceTag: "vendor_3_national_quote.docx • Paragraph 2 • Narrative Clause",
    sourceDocName: "vendor_3_national_quote.docx",
    sourceCoordinates: {
      sourceFile: "vendor_3_national_quote.docx",
      clause: "Paragraph 2 (Narrative Volume Tier)",
      column: "Client Compute Pricing"
    },
    statusBadge: "Pending review",
    statusColor: "#D97706",
    whatWasFound: [
      "Narrative clause proposes a blanket fixed rate of ₹104,500.00 for all Items 1 through 10",
      "Severe price anomaly on SKU-003 (Apple MacBook Pro 14 M3 Pro, Target ₹2,18,000) and SKU-005 (Precision Workstation, Target ₹315,000)"
    ],
    aiInterpretation:
      "National IT quoted a generic PC laptop rate across Items 1-10. This quote does NOT match technical specifications for Apple MacBook Pro (macOS/M3 Pro 18GB) or Dell Precision Workstations (i9/RTX 3500 GPU). System must enforce technical equivalence check to avoid improper award.",
    aiReasoningPoints: [
      "SKU-003 Target Price: ₹2,18,000. National IT quote: ₹1,04,500 (-52.1% anomaly).",
      "Hardware mismatch: Apple MacBook Pro requires macOS M3 Pro 18GB/512GB and AppleCare enterprise support.",
      "National IT clause specifies standard PC Windows BIOS imaging and asset tagging.",
      "Risk: Awarding this item at ₹104,500 will result in delivery rejection or wrong configuration.",
      "Technical Eligibility Check: Mark National IT as Technically Disqualified for SKU-003 and SKU-005."
    ],
    normalizationAssumptions: [
      "National IT's ₹104,500 quote is valid and awarded for standard enterprise laptops (e.g. SKU-004 HP EliteBook 840).",
      "For SKU-003 and SKU-005, National IT is disqualified due to severe technical spec mismatch.",
      "Winner for SKU-003 is Apex Technology at ₹2,06,764 (OEM authorized Apple partner)."
    ],
    scenarioA: {
      title: "Unvalidated Lowest Price (High Risk)",
      subtitle: "(Automatically award lowest number)",
      rows: [
        { label: "National IT rate", value: "₹1,04,500" },
        { label: "Spec Equivalence", value: "Failed / Mismatch", color: "#DC2626" },
        { label: "Configuration Risk", value: "Severe (Wrong OS/CPU)" }
      ],
      landedPrice: "Invalid Award"
    },
    scenarioB: {
      title: "Technical Eligibility Validation (Safe)",
      subtitle: "(Award verified compliant winner)",
      rows: [
        { label: "Apex Technology", value: "₹2,06,764", color: "#16A34A" },
        { label: "Spec Equivalence", value: "100% Compliant (M3 Pro)" },
        { label: "OEM Authorization", value: "Apple Direct Partner" }
      ],
      landedPrice: "₹2,06,764"
    },
    keyTakeaway:
      "Technical eligibility check prevents misallocation of MacBook Pro to generic PC quote, safely awarding to Apex Technology.",
    selectedAction: "confirm",
    isResolved: false
  },
  {
    id: "EXC-004",
    exceptionNumber: 4,
    supplierName: "Shree Balaji Infotech",
    category: "Historical pricing & bundle",
    iconType: "bundle",
    sourceTag: "vendor_5_balaji_quote.eml • Email Body • Line 12",
    sourceDocName: "vendor_5_balaji_quote.eml",
    sourceCoordinates: {
      sourceFile: "vendor_5_balaji_quote.eml",
      sheet: "Proposal Memo",
      row: 12,
      column: "Contract Baseline Clause"
    },
    statusBadge: "Pending review",
    statusColor: "#D97706",
    whatWasFound: [
      "Quoted 2025 Master Contract baseline + 3.5% USD/INR currency escalation",
      "Bundled executive docking stations (WD22TB4) with laptops without separate line breakout"
    ],
    aiInterpretation:
      "Vendor referenced previous contract indexing rather than firm spot bid. Peripheral docks must be unbundled into SKU-015 to evaluate against open market docks.",
    aiReasoningPoints: [
      "RFx baseline contract year: FY2026 spot tender.",
      "Quoted indexing: FY2025 contract + 3.5% FX escalation.",
      "Scope bundling: Laptops and Thunderbolt 4 docks blended in one rate.",
      "RFx requirement: Itemized SKU rates for compute and peripherals.",
      "Normalization required: Unbundle WD22TB4 modular docks into discrete SKU-015 line."
    ],
    normalizationAssumptions: [
      "The 3.5% escalation reflects the USD/INR currency adjustment specified in Clause 4.",
      "Docking station standalone catalog benchmark is ₹23,100.",
      "Unbundled laptop baseline price is ₹81,435.",
      "The calculation assumes delivery terms remain DDP Tech Centers."
    ],
    scenarioA: {
      title: "Scenario A: Bundled as quoted",
      subtitle: "(Contract baseline indexing)",
      rows: [
        { label: "2025 Contract base", value: "₹1,01,000" },
        { label: "Currency escalation (3.5%)", value: "+₹3,535" }
      ],
      landedPrice: "₹1,04,535"
    },
    scenarioB: {
      title: "Scenario B: Unbundled peripherals",
      subtitle: "(Catalog separation)",
      rows: [
        { label: "ThinkPad T14s standalone", value: "₹81,435" },
        { label: "Modular TB4 Dock (SKU-015)", value: "₹23,100" }
      ],
      landedPrice: "₹1,04,535"
    },
    keyTakeaway:
      "Indexation factor (+3.5%) matches RBI enterprise forex trend. Unbundling enables itemized comparison on displays & docks.",
    selectedAction: "confirm",
    isResolved: false
  },
  {
    id: "EXC-005",
    exceptionNumber: 5,
    supplierName: "Vardhman Infotech",
    category: "Delivery SLA Breach & Quality Audit Risk",
    iconType: "delivery",
    sourceTag: "vendor_4_vardhman_quote.jpg • Header Margin Note",
    sourceDocName: "vendor_4_vardhman_quote.jpg",
    sourceCoordinates: {
      sourceFile: "vendor_4_vardhman_quote.jpg",
      page: 1,
      clause: "Top Margin Handwritten Annotation",
      column: "Delivery SLA Notes"
    },
    statusBadge: "Pending review",
    statusColor: "#D97706",
    whatWasFound: [
      "Vendor committed delivery lead time: 16 working days Ex-Works Surat (breaches ≤ 12-day SLA)",
      "Quality Questionnaire: Failed / pending (Missing ISO 9001 certification, 2.8% DoA rate exceeding 2.0% hurdle)",
      "Partial bid: Enterprise rack servers SKU-028 through SKU-030 unquoted"
    ],
    aiInterpretation:
      "Quoted lead time breaches the corporate 12-day SLA threshold by +4 working days, and supplier failed the quality questionnaire. The optimizer excludes Vardhman from the strategic split award.",
    aiReasoningPoints: [
      "RFx mandatory delivery SLA: ≤ 12 working days.",
      "Vendor's quoted lead time: 16 working days Ex-Works.",
      "Quality Questionnaire Status: Failed / pending (Score: 58/100, DoA rate 2.8% > 2.0% hurdle).",
      "Discrepancy: +4 working days delivery delay risk & quality failure.",
      "Impact: Delayed developer onboarding and unverified field reliability.",
      "Optimization action: Exclude Vardhman from allocation."
    ],
    normalizationAssumptions: [
      "Vendor states 16 working days from receipt of purchase order.",
      "Inter-state surface road freight from Surat requires 3-4 days transit.",
      "Quality Questionnaire failure bars supplier under mandatory pre-qualification hurdles."
    ],
    scenarioA: {
      title: "Scenario A: Enforce 12-day SLA & Quality Audit",
      subtitle: "(Mandatory Pre-qualification Hurdle)",
      rows: [
        { label: "Delivery SLA hurdle", value: "12 Days (Breached: 16d)", color: "#DC2626" },
        { label: "Quality Questionnaire", value: "Failed / pending", color: "#DC2626" }
      ],
      landedPrice: "Excluded (Disqualified)"
    },
    scenarioB: {
      title: "Scenario B: Relax Constraints (Unconstrained)",
      subtitle: "(High operational risk)",
      rows: [
        { label: "Landed cost savings", value: "-₹5.8 Lakhs", color: "#16A34A" },
        { label: "Deployment buffer", value: "+4 Days lead time" }
      ],
      landedPrice: "Eligible (Deviation)"
    },
    keyTakeaway:
      "Strict SLA and Quality Questionnaire enforcement protects project go-live deadlines and field hardware reliability.",
    selectedAction: "accept",
    isResolved: false
  }
];

export function App() {
  // 4-Step Sourcing Workflow (Step 1: Collect / Ingest ➔ Step 2: Verify / Normalize ➔ Step 3: Optimize / Compare ➔ Step 4: Approve / Award)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Custom Upload Mode (false = showing default demo dataset, true = default demo purged, showing only uploaded files)
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Dynamic Suppliers & Exceptions state across Workflow Steps
  const [suppliers, setSuppliers] = useState<SupplierRow[]>(initialSuppliers);
  const [exceptions, setExceptions] = useState<ExceptionData[]>(initialExceptions);
  const [selectedExceptionId, setSelectedExceptionId] = useState<string>("EXC-001");

  // RFx State Data
  const [matrixData, setMatrixData] = useState<any>(null);
  const [vendorProfiles, setVendorProfiles] = useState<any>(null);
  const [quarantineItems, setQuarantineItems] = useState<any[]>([]);
  const [activeScenario, setActiveScenario] = useState<string>("vp_constrained_split");
  const [scenarioResult, setScenarioResult] = useState<any>(null);

  // Inspection Drawer & Memo Modal & Global Copilot
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [isMemoOpen, setIsMemoOpen] = useState<boolean>(false);
  const [memoText, setMemoText] = useState<string>("");
  const [isGlobalCopilotOpen, setIsGlobalCopilotOpen] = useState<boolean>(false);

  useEffect(() => {
    // Ensure clean initial state aligned with canonical 5-vendor benchmark
    const initialize = async () => {
      try {
        await resetToBenchmarkDefaults();
      } catch (e) {
        console.warn("Reset to benchmark defaults notice:", e);
      }
      await loadData();
    };
    initialize();
  }, []);

  const loadData = async () => {
    const matrix = await fetchQuoteMatrix();
    if (matrix) setMatrixData(matrix);

    const profiles = await fetchVendorProfiles();
    if (profiles) setVendorProfiles(profiles);

    const qItems = await fetchQuarantineItems();
    if (qItems && qItems.items) setQuarantineItems(qItems.items);

    handleScenarioChange("vp_constrained_split");
  };

  const handleScenarioChange = async (scenario: string) => {
    setActiveScenario(scenario);
    let params: any = { scenario_type: scenario };

    if (scenario === "vp_constrained_split") {
      params = {
        scenario_type: "vp_constrained_split",
        require_quality_audit: true,
        max_lead_time_days: 12,
        min_vendor_spend_inr: 500000
      };
    } else if (scenario === "single_source_best") {
      params = {
        scenario_type: "single_source_best",
        single_source_only: true
      };
    } else {
      params = {
        scenario_type: "unconstrained_lowest"
      };
    }

    const res = await solveScenario(params);
    if (res) {
      setScenarioResult(res);
    }
  };

  const handleAddSupplier = (newSupplier: SupplierRow, newException: ExceptionData) => {
    // Append the newly uploaded supplier to the active supplier list
    setSuppliers(prev => {
      const remaining = prev.filter(s => s.file !== newSupplier.file && s.name !== newSupplier.name);
      return [...remaining, newSupplier];
    });

    setExceptions(prev => {
      const remaining = prev.filter(e => e.sourceDocName !== newException.sourceDocName);
      const combined = [...remaining, newException];
      return combined.map((exc, idx) => ({
        ...exc,
        exceptionNumber: idx + 1
      }));
    });

    setSelectedExceptionId(newException.id);
    loadData();
  };

  const handleAddSuppliersBatch = (newSuppliers: SupplierRow[], newExceptions: ExceptionData[]) => {
    // Append the newly uploaded batch of suppliers to the active supplier list
    setSuppliers(prev => {
      const newFiles = new Set(newSuppliers.map(s => s.file));
      const remaining = prev.filter(s => !newFiles.has(s.file));
      return [...remaining, ...newSuppliers];
    });

    setExceptions(prev => {
      const newDocNames = new Set(newExceptions.map(e => e.sourceDocName));
      const remaining = prev.filter(e => !newDocNames.has(e.sourceDocName));
      const combined = [...remaining, ...newExceptions];
      return combined.map((exc, idx) => ({
        ...exc,
        exceptionNumber: idx + 1
      }));
    });

    if (newExceptions.length > 0) {
      setSelectedExceptionId(newExceptions[0].id);
    }
    loadData();
  };

  const handleResetToDefault = async () => {
    await resetToBenchmarkDefaults();
    setIsCustomMode(false);
    setSuppliers(initialSuppliers);
    setExceptions(initialExceptions);
    setSelectedExceptionId("EXC-001");
    await loadData();
  };

  const handleUpdateSupplierStatus = (
    supplierId: string,
    status: "Processed" | "Processing" | "Needs review"
  ) => {
    setSuppliers(prev =>
      prev.map(s =>
        s.id === supplierId
          ? {
              ...s,
              status,
              flagType: status === "Processed" ? "success" : "warning"
            }
          : s
      )
    );
  };

  const handleAutoValidateCleanQuotes = () => {
    setSuppliers(prev =>
      prev.map(s => {
        const ext = s.file.split(".").pop()?.toLowerCase();
        const isScan = ["jpg", "jpeg", "png"].includes(ext || "") || s.name.toLowerCase().includes("vardhman");
        if (!isScan) {
          return { ...s, status: "Processed" as const, flagType: "success" as const };
        }
        return s;
      })
    );
  };

  const handleUpdateExceptions = (updated: ExceptionData[]) => {
    setExceptions(updated);
    // When all exceptions for a supplier are resolved, mark that supplier as Processed in Step 1!
    setSuppliers(prev =>
      prev.map(sup => {
        const supExceptions = updated.filter(e => e.supplierName === sup.name);
        if (supExceptions.length > 0 && supExceptions.every(e => e.isResolved)) {
          return {
            ...sup,
            status: "Processed" as const,
            flagType: "success" as const
          };
        }
        return sup;
      })
    );
  };

  const handleOpenMemo = async () => {
    const memo = await fetchAwardMemo(activeScenario);
    if (memo) setMemoText(memo);
    setIsMemoOpen(true);
  };

  const totalSpend = scenarioResult?.total_spend_inr ?? 140699590.0;
  const baselineSpend = matrixData?.benchmark_spend_inr ?? 178960500.0;
  const netSavings = scenarioResult?.net_savings_inr ?? (baselineSpend - totalSpend);
  const savingsPct = scenarioResult?.savings_percentage ?? 21.4;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", backgroundColor: "#F8FAFC" }}>
      {/* 1. Left Aerchain Brand & Navigation Sidebar */}
      <Sidebar
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
        supplierCount={suppliers.length}
        exceptionCount={exceptions.filter(e => !e.isResolved).length}
        resolvedCount={exceptions.filter(e => e.isResolved).length}
        savingsInr={netSavings}
        savingsPct={savingsPct}
        isCustomMode={isCustomMode}
        onResetToDefault={handleResetToDefault}
        onOpenAiCopilot={() => setIsGlobalCopilotOpen(true)}
      />

      {/* 2. Main Workspace */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Global Stepper Header: (1) Collect > 2 Verify > 3 Optimize > 4 Approve */}
        <StepNavigationHeader
          currentStep={currentStep}
          onSelectStep={setCurrentStep}
          supplierCount={suppliers.length}
          exceptionCount={exceptions.filter(e => !e.isResolved).length}
          totalExceptionCount={exceptions.length}
          resolvedCount={exceptions.filter(e => e.isResolved).length}
          savingsInr={netSavings}
          savingsPct={savingsPct}
          baselineSpend={baselineSpend}
        />

        {/* View Router for Step 1 ➔ Step 2 ➔ Step 3 ➔ Step 4 */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", position: "relative" }}>
          {/* Step 1: Collect / Supplier Quotations */}
          {currentStep === 1 && (
            <Step1Ingestion
              onProceedToReview={() => setCurrentStep(2)}
              onRefreshData={loadData}
              suppliers={suppliers}
              onAddSupplier={handleAddSupplier}
              onAddSuppliersBatch={handleAddSuppliersBatch}
              onUpdateSupplierStatus={handleUpdateSupplierStatus}
              onAutoValidateCleanQuotes={handleAutoValidateCleanQuotes}
              isCustomMode={isCustomMode}
              onResetToDefault={handleResetToDefault}
            />
          )}

          {/* Step 2: Verify / Review & Exceptions */}
          {currentStep === 2 && (
            <Step2Review
              onBackToIngest={() => setCurrentStep(1)}
              onProceedToAnalysis={() => setCurrentStep(3)}
              quarantineItems={quarantineItems}
              exceptions={exceptions}
              onUpdateExceptions={handleUpdateExceptions}
              selectedExceptionId={selectedExceptionId}
              onSelectExceptionId={setSelectedExceptionId}
            />
          )}

          {/* Step 3: Optimize / Compare Quotes & Strategy Optimization */}
          {currentStep === 3 && (
            <Step3Analysis
              onBackToReview={() => setCurrentStep(2)}
              onProceedToAward={() => setCurrentStep(4)}
              matrixData={matrixData}
              vendorProfiles={vendorProfiles}
              activeScenario={activeScenario}
              onScenarioChange={handleScenarioChange}
              scenarioResult={scenarioResult}
              totalSpend={totalSpend}
              baselineSpend={baselineSpend}
              netSavings={netSavings}
              savingsPct={savingsPct}
              isCustomMode={isCustomMode}
              onResetToDefault={handleResetToDefault}
              onSelectCell={(item, vendorId, quote) => setSelectedCell({ item, vendorId, quote })}
              exceptions={exceptions}
            />
          )}

          {/* Step 4: Approve / Final Tender Award & Executive Export */}
          {currentStep === 4 && (
            <Step4Award
              onBackToAnalysis={() => setCurrentStep(3)}
              onOpenMemo={handleOpenMemo}
              activeScenario={activeScenario}
              onScenarioChange={handleScenarioChange}
              totalSpend={totalSpend}
              baselineSpend={baselineSpend}
              netSavings={netSavings}
              savingsPct={savingsPct}
              scenarioResult={scenarioResult}
              matrixData={matrixData}
              exceptions={exceptions}
            />
          )}
        </div>
      </div>

      {/* On-Demand Provenance Drawer */}
      <SourceViewerDrawer
        isOpen={!!selectedCell}
        onClose={() => setSelectedCell(null)}
        selectedCell={selectedCell}
      />

      {/* Board Award Memo Modal */}
      <AwardMemoModal
        isOpen={isMemoOpen}
        onClose={() => setIsMemoOpen(false)}
        memoMarkdown={memoText}
      />

      {/* Global Aera AI Sourcing Copilot Modal */}
      {isGlobalCopilotOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            backdropFilter: "blur(3px)"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsGlobalCopilotOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "780px",
              maxWidth: "94vw",
              height: "750px",
              maxHeight: "92vh",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <AeraCopilot
              onSelectScenario={handleScenarioChange}
              activeScenario={activeScenario}
              currentSavings={netSavings}
              currentSpend={totalSpend}
              matrixData={matrixData}
              vendorProfiles={vendorProfiles}
              isCustomMode={isCustomMode}
              onClose={() => setIsGlobalCopilotOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
