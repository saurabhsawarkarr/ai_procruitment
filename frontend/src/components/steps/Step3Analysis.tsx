import React, { useState } from "react";
import {
  Table as TableIcon,
  ShieldCheck,
  Sparkles,
  Truck,
  Clock,
  Coins,
  ChevronDown,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Info,
  ArrowRight,
  ChevronLeft,
  X,
  FileText,
  AlertTriangle,
  RotateCcw,
  AlertOctagon,
  HelpCircle,
  Check
} from "lucide-react";
import { AeraCopilot } from "../AeraCopilot";

interface Step3AnalysisProps {
  onBackToReview: () => void;
  onProceedToAward: () => void;
  matrixData: any;
  vendorProfiles: any;
  activeScenario: string;
  onScenarioChange: (scenario: string) => void;
  scenarioResult: any;
  totalSpend: number;
  baselineSpend: number;
  netSavings: number;
  savingsPct: number;
  isCustomMode?: boolean;
  onResetToDefault?: () => void;
  onSelectCell: (item: any, vendorId: string, quote: any) => void;
  exceptions?: any[];
}

interface SkuRow {
  line: number;
  skuCode: string;
  name: string;
  spec: string;
  category: "COMPUTE" | "PERIPHERAL" | "INFRA";
  qty: number;
  targetPrice: number;
  apex: { landed: number; raw: number; isBest?: boolean; bidPresent: boolean };
  compuzone: { landed: number; raw: number; isBest?: boolean; bidPresent: boolean };
  national: {
    landed: number;
    raw: number;
    isBest?: boolean;
    bidPresent: boolean;
    isSpecMismatch?: boolean;
    specMismatchReason?: string;
  };
  vardhman: { landed: number; raw: number; isBest?: boolean; bidPresent: boolean; isSlaBreach?: boolean };
  balaji: { landed: number; raw: number; isBest?: boolean; bidPresent: boolean };
  recommendedVendor: string;
  recommendedPrice: number;
  rationale: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "aera";
  text: string;
  timestamp: string;
}

export const Step3Analysis: React.FC<Step3AnalysisProps> = ({
  onBackToReview,
  onProceedToAward,
  matrixData,
  vendorProfiles,
  activeScenario,
  onScenarioChange,
  scenarioResult,
  totalSpend = 140699590,
  baselineSpend = 178960500,
  netSavings = 38260910,
  savingsPct = 21.4,
  isCustomMode = false,
  onResetToDefault,
  onSelectCell,
  exceptions = []
}) => {
  const pendingExceptions = exceptions.filter((e: any) => !e.isResolved);
  const awardedVendorsList = scenarioResult?.vendor_allocations
    ? Object.entries(scenarioResult.vendor_allocations).filter(([_, a]: any) => a.sku_count > 0)
    : [];
  const dynamicAwardedCount = awardedVendorsList.length > 0 ? awardedVendorsList.length : 3;

  const strategyTitle =
    activeScenario === "single_source_best"
      ? "Recommended Strategy: Sole Supplier Consolidation (1 qualified supplier)"
      : activeScenario === "unconstrained_lowest"
      ? `Recommended Strategy: Unconstrained Line-by-Line (${dynamicAwardedCount} suppliers)`
      : `Recommended Strategy: Split award across ${dynamicAwardedCount} qualified suppliers`;
  // Navigation Sub-tabs: "matrix" | "compliance"
  const [activeSubTab, setActiveSubTab] = useState<"matrix" | "compliance">("matrix");

  // Category Filter & Price Mode Toggle
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "COMPUTE" | "PERIPHERAL" | "INFRA">("ALL");
  const [priceMode, setPriceMode] = useState<"landed" | "raw">("landed");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Modal / Drawer state for "Ask AI"
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Modal state for "Why Winner Won" explainable decision popover (Issue 4)
  const [winnerExplanationSku, setWinnerExplanationSku] = useState<SkuRow | null>(null);

  // Canonical 5 Vendors for the main demo (Issue 2)
  const canonical5Vendors = [
    { id: "VEND-001", name: "Apex Technology Solutions", isDisqualified: false, statusBadge: "DDP", badgeColor: "#2563EB", qualityStatus: "Passed", qualityScore: 94 },
    { id: "VEND-002", name: "CompuZone India", isDisqualified: false, statusBadge: "DDP", badgeColor: "#2563EB", qualityStatus: "Passed", qualityScore: 98 },
    { id: "VEND-003", name: "National IT Systems", isDisqualified: false, statusBadge: "DDP", badgeColor: "#2563EB", qualityStatus: "Passed", qualityScore: 95 },
    { id: "VEND-004", name: "Vardhman Infotech", isDisqualified: true, statusBadge: "SLA ✗", badgeColor: "#DC2626", qualityStatus: "Failed / pending", qualityScore: 58 },
    { id: "VEND-005", name: "Shree Balaji Infotech", isDisqualified: false, statusBadge: "DDP", badgeColor: "#2563EB", qualityStatus: "Passed", qualityScore: 91 }
  ];

  // Helper to sanitize vendor labels (stripping file codes like "Vend 003 03" or "Vendor 1 -")
  const cleanVendorName = (rawName: string): string => {
    if (!rawName) return "Supplier";
    return rawName
      .replace(/^Vend(?:or)?\s*[\d\s_-]+/i, "")
      .replace(/^[-–—:\s]+/, "")
      .trim() || rawName;
  };

  // Dynamic Vendors extracted from live matrix data or fallback to canonical 5
  const dynamicVendors = React.useMemo(() => {
    if (isCustomMode && matrixData && matrixData.rows && matrixData.rows.length > 0) {
      const allVIds = new Set<string>();
      matrixData.rows.forEach((r: any) => {
        if (r.quotes) {
          Object.keys(r.quotes).forEach(vid => allVIds.add(vid));
        }
      });
      return Array.from(allVIds).map(vId => {
        const prof = (vendorProfiles && vendorProfiles[vId]) || (matrixData.vendor_profiles && matrixData.vendor_profiles[vId]) || {};
        const firstQuote = matrixData.rows[0]?.quotes?.[vId] || {};
        const rawName = prof.vendor_name || firstQuote.vendor_name || vId;
        const name = cleanVendorName(rawName);
        const isDisqualified = prof.audit_status === "DISQUALIFIED" || (prof.lead_time_days && prof.lead_time_days > 12) || prof.quality_questionnaire_status === "Failed / pending";
        return {
          id: vId,
          name: name,
          isDisqualified: isDisqualified,
          statusBadge: isDisqualified ? "SLA ✗" : (prof.incoterms ? `${prof.incoterms.split(" ")[0]}` : "DDP"),
          badgeColor: isDisqualified ? "#DC2626" : "#2563EB",
          qualityStatus: prof.quality_questionnaire_status || "Passed",
          qualityScore: prof.quality_score || 90
        };
      });
    }
    // Main demo strictly displays 5 canonical vendors
    return canonical5Vendors;
  }, [matrixData, vendorProfiles, isCustomMode]);

  const isAwarded = (skuLine: number, vendorId: string) => {
    if (!scenarioResult || !scenarioResult.line_allocations) return false;
    const alloc = scenarioResult.line_allocations.find((a: any) => a.line_number === skuLine);
    return alloc && alloc.awarded_vendor_id === vendorId;
  };

  const getVendorCellData = (sku: any, vendorId: string) => {
    if (matrixData && matrixData.rows) {
      const row = matrixData.rows.find((r: any) => r.line_number === sku.line);
      if (row && row.quotes && row.quotes[vendorId]) {
        const q = row.quotes[vendorId];
        const isSpecMismatch = q.is_technically_eligible === false || q.technical_spec_status === "NON_EQUIVALENT_SPEC_MISMATCH";
        return {
          landed: q.landed_cost_unit_inr || 0,
          raw: q.base_unit_price_inr || 0,
          bidPresent: q.is_bid_present && q.landed_cost_unit_inr > 0,
          isBest: (q.pricing_status === "WINNING_GREEN" || isAwarded(sku.line, vendorId)) && !isSpecMismatch,
          isSpecMismatch: isSpecMismatch,
          specMismatchReason: q.technical_check_reason || "Technical specification mismatch"
        };
      }
    }
    if (vendorId === "VEND-001" && sku.apex) return { ...sku.apex, isSpecMismatch: false };
    if (vendorId === "VEND-002" && sku.compuzone) return { ...sku.compuzone, isSpecMismatch: false };
    if (vendorId === "VEND-003" && sku.national) return sku.national;
    if (vendorId === "VEND-004" && sku.vardhman) return { ...sku.vardhman, isSpecMismatch: false };
    if (vendorId === "VEND-005" && sku.balaji) return { ...sku.balaji, isSpecMismatch: false };
    return { landed: 0, raw: 0, bidPresent: false, isBest: false, isSpecMismatch: false };
  };

  // Single Source of Truth for Winning Allocation (Guarantees Cell & Recommendation Column Agree 100%)
  const getWinningAllocation = (sku: SkuRow) => {
    // 1. Check MILP scenarioResult first
    if (scenarioResult && scenarioResult.line_allocations && scenarioResult.line_allocations.length > 0) {
      const alloc = scenarioResult.line_allocations.find((a: any) => a.line_number === sku.line);
      if (alloc && alloc.awarded_vendor_id) {
        const v = dynamicVendors.find(vend => vend.id === alloc.awarded_vendor_id);
        const cell = getVendorCellData(sku, alloc.awarded_vendor_id);
        const landedPrice = alloc.allocated_unit_price_inr || cell.landed || sku.recommendedPrice;
        const vName = v ? v.name : (alloc.awarded_vendor_name ? cleanVendorName(alloc.awarded_vendor_name) : "Recommended Supplier");

        let rat = alloc.allocation_rationale || "";
        if (!rat || rat.trim() === "") {
          if (alloc.awarded_vendor_id === "VEND-001") {
            rat = "Lowest eligible normalized landed price; verified OEM partner & quality cleared";
          } else if (alloc.awarded_vendor_id === "VEND-003") {
            rat = "Volume discount tier landed pricing; meets 12d SLA and quality hurdles";
          } else if (alloc.awarded_vendor_id === "VEND-005") {
            rat = "Competitive peripheral rate with immediate stock availability";
          } else {
            rat = `Optimal MILP constrained award; ₹${Math.round(landedPrice).toLocaleString("en-IN")} landed TCO`;
          }
        }
        return {
          vendorId: alloc.awarded_vendor_id,
          vendorName: vName,
          price: landedPrice,
          rationale: rat,
          isEligible: true
        };
      }
    }

    // 2. If no line_allocations found, determine lowest eligible vendor dynamically among dynamicVendors
    let bestVendorId = "";
    let bestPrice = Infinity;
    let bestName = "";

    for (const v of dynamicVendors) {
      if (v.isDisqualified) continue;
      const cell = getVendorCellData(sku, v.id);
      if (cell.bidPresent && !cell.isSpecMismatch && cell.landed > 0) {
        if (cell.landed < bestPrice) {
          bestPrice = cell.landed;
          bestVendorId = v.id;
          bestName = v.name;
        }
      }
    }

    if (bestVendorId && bestPrice < Infinity) {
      return {
        vendorId: bestVendorId,
        vendorName: bestName,
        price: bestPrice,
        rationale: "Lowest eligible landed quote among suppliers meeting quality & delivery hurdles",
        isEligible: true
      };
    }

    // 3. Fallback to static sku recommendation if matches canonical vendors
    const fallbackV = dynamicVendors.find(v => v.name.toLowerCase().includes(sku.recommendedVendor.toLowerCase().split(" ")[0])) || dynamicVendors[0];
    return {
      vendorId: fallbackV ? fallbackV.id : "VEND-001",
      vendorName: fallbackV ? fallbackV.name : sku.recommendedVendor,
      price: sku.recommendedPrice,
      rationale: sku.rationale,
      isEligible: true
    };
  };

  const canonical30Skus: SkuRow[] = [
    {
      line: 1,
      skuCode: "SKU-001",
      name: "ThinkPad T14s Gen 5 Ultrabook",
      spec: "14\" WUXGA / Ultra 7 155U / 32GB / 1TB SSD",
      category: "COMPUTE",
      qty: 120,
      targetPrice: 104200.0,
      apex: { landed: 102360.0, raw: 101910.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 104500.0, raw: 104500.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 105130.0, raw: 104280.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 117741.6, raw: 117741.6, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 102360.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 2,
      skuCode: "SKU-002",
      name: "Dell Latitude 5440 Enterprise Laptop",
      spec: "14\" FHD / Core i5-1345U / 16GB / 512GB SSD",
      category: "COMPUTE",
      qty: 200,
      targetPrice: 76500.0,
      apex: { landed: 74582.0, raw: 74132.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 104500.0, raw: 104500.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 76706.0, raw: 75856.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 85648.32, raw: 85648.32, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 74582.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 3,
      skuCode: "SKU-003",
      name: "Apple MacBook Pro 14 M3 Pro",
      spec: "14\" Liquid Retina XDR / M3 Pro / 36GB / 1TB SSD",
      category: "COMPUTE",
      qty: 45,
      targetPrice: 218000.0,
      apex: { landed: 206764.0, raw: 206314.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 104500.0, raw: 104500.0, isBest: false, bidPresent: true, isSpecMismatch: true, specMismatchReason: "Spec Mismatch: Blanket generic PC rate fails Apple MacBook Pro M3 Pro spec" },
      vardhman: { landed: 211962.0, raw: 211112.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 238364.64, raw: 238364.64, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 206764.0,
      rationale: "OEM authorized Apple direct partner; National IT disqualified due to MacBook Pro spec mismatch (-52%)"
    },
    {
      line: 4,
      skuCode: "SKU-004",
      name: "HP EliteBook 840 G10 Business Notebook",
      spec: "14\" WUXGA Privacy / Core i7-1365U / 32GB / 1TB",
      category: "COMPUTE",
      qty: 110,
      targetPrice: 110000.0,
      apex: { landed: 107520.0, raw: 107070.0, isBest: false, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 104500.0, raw: 104500.0, isBest: true, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 110410.0, raw: 109560.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 123703.2, raw: 123703.2, isBest: false, bidPresent: true },
      recommendedVendor: "National IT Systems",
      recommendedPrice: 104500.0,
      rationale: "Volume discount tier landed pricing; meets 12d SLA and quality hurdles"
    },
    {
      line: 5,
      skuCode: "SKU-005",
      name: "Dell Precision 7680 Mobile Workstation",
      spec: "16\" OLED / Core i9-13950HX / 64GB / RTX 3500 Ada",
      category: "COMPUTE",
      qty: 25,
      targetPrice: 315000.0,
      apex: { landed: 299730.0, raw: 299280.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 104500.0, raw: 104500.0, isBest: false, bidPresent: true, isSpecMismatch: true, specMismatchReason: "Spec Mismatch: Blanket generic PC rate fails Dell Precision RTX GPU spec" },
      vardhman: { landed: 307090.0, raw: 306240.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 345772.8, raw: 345772.8, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 299730.0,
      rationale: "OEM authorized Dell partner; National IT disqualified due to Precision Workstation GPU spec mismatch"
    },
    {
      line: 6,
      skuCode: "SKU-006",
      name: "Lenovo ThinkPad X1 Carbon Gen 12",
      spec: "14\" 2.8K OLED / Ultra 7 165H / 32GB / 1.09kg",
      category: "COMPUTE",
      qty: 35,
      targetPrice: 168000.0,
      apex: { landed: 162990.0, raw: 162540.0, isBest: false, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 104500.0, raw: 104500.0, isBest: true, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 167170.0, raw: 166320.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 187790.4, raw: 187790.4, isBest: false, bidPresent: true },
      recommendedVendor: "National IT Systems",
      recommendedPrice: 104500.0,
      rationale: "Volume discount tier landed pricing; meets 12d SLA and quality hurdles"
    },
    {
      line: 7,
      skuCode: "SKU-007",
      name: "Apple MacBook Air 15 M3",
      spec: "15\" Liquid Retina / Apple M3 / 16GB / 512GB SSD",
      category: "COMPUTE",
      qty: 60,
      targetPrice: 131000.0,
      apex: { landed: 125064.0, raw: 124614.0, isBest: false, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 104500.0, raw: 104500.0, isBest: true, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 128362.0, raw: 127512.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 143972.64, raw: 143972.64, isBest: false, bidPresent: true },
      recommendedVendor: "National IT Systems",
      recommendedPrice: 104500.0,
      rationale: "Volume discount tier landed pricing; meets 12d SLA and quality hurdles"
    },
    {
      line: 8,
      skuCode: "SKU-008",
      name: "Dell OptiPlex 7010 Micro Desktop",
      spec: "Micro Desktop / Core i5-13500T / 16GB / 512GB SSD",
      category: "COMPUTE",
      qty: 80,
      targetPrice: 54800.0,
      apex: { landed: 54200.0, raw: 53750.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 104500.0, raw: 104500.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 55850.0, raw: 55000.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 62100.0, raw: 62100.0, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 54200.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 9,
      skuCode: "SKU-009",
      name: "HP ZBook Firefly 14 G10 Workstation",
      spec: "14\" QHD / Ryzen 7 PRO / 32GB / RTX A500",
      category: "COMPUTE",
      qty: 40,
      targetPrice: 122000.0,
      apex: { landed: 119990.0, raw: 119540.0, isBest: false, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 104500.0, raw: 104500.0, isBest: true, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 123170.0, raw: 122320.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 138110.4, raw: 138110.4, isBest: false, bidPresent: true },
      recommendedVendor: "National IT Systems",
      recommendedPrice: 104500.0,
      rationale: "Volume discount tier landed pricing; meets 12d SLA and quality hurdles"
    },
    {
      line: 10,
      skuCode: "SKU-010",
      name: "Lenovo ThinkCentre M90q Tiny Workstation",
      spec: "Tiny 1L Workstation / Core i7-13700 / 32GB / 1TB",
      category: "COMPUTE",
      qty: 50,
      targetPrice: 81500.0,
      apex: { landed: 79570.0, raw: 79120.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 104500.0, raw: 104500.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 81810.0, raw: 80960.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 91411.2, raw: 91411.2, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 79570.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 11,
      skuCode: "SKU-011",
      name: "Dell Latitude 7440 Ultralight",
      spec: "14\" FHD+ Magnesium / Core i7-1365U / 32GB / 1.05kg",
      category: "COMPUTE",
      qty: 40,
      targetPrice: 126000.0,
      apex: { landed: 122570.0, raw: 122120.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 130640.0, raw: 130640.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 125810.0, raw: 124960.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 141091.2, raw: 141091.2, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 122570.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 12,
      skuCode: "SKU-012",
      name: "Microsoft Surface Laptop 6 for Business",
      spec: "13.5\" Touch / Ultra 7 165H / 16GB / 512GB SSD",
      category: "COMPUTE",
      qty: 30,
      targetPrice: 137000.0,
      apex: { landed: 132890.0, raw: 132440.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 141680.0, raw: 141680.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 136370.0, raw: 135520.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 153014.4, raw: 153014.4, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 132890.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 13,
      skuCode: "SKU-013",
      name: "Dell UltraSharp 27 4K USB-C Hub Monitor (U2723QE)",
      spec: "27\" 4K UHD IPS Black / 90W USB-C PD / RJ45",
      category: "PERIPHERAL",
      qty: 180,
      targetPrice: 47200.0,
      apex: { landed: 47320.0, raw: 46870.0, isBest: false, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 50140.0, raw: 50140.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 48810.0, raw: 47960.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 36500.0, raw: 36500.0, isBest: true, bidPresent: true },
      recommendedVendor: "Shree Balaji Infotech",
      recommendedPrice: 36500.0,
      rationale: "Competitive peripheral / storage rate with immediate stock availability & DDP delivery"
    },
    {
      line: 14,
      skuCode: "SKU-014",
      name: "Lenovo ThinkVision P34w-20 34\" Curved Monitor",
      spec: "34\" Curved WQHD Ultrawide / Built-in KVM / 100W PD",
      category: "PERIPHERAL",
      qty: 40,
      targetPrice: 62500.0,
      apex: { landed: 62370.0, raw: 61920.0, isBest: false, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 66240.0, raw: 66240.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 64210.0, raw: 63360.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 36500.0, raw: 36500.0, isBest: true, bidPresent: true },
      recommendedVendor: "Shree Balaji Infotech",
      recommendedPrice: 36500.0,
      rationale: "Competitive peripheral / storage rate with immediate stock availability & DDP delivery"
    },
    {
      line: 15,
      skuCode: "SKU-015",
      name: "Dell Thunderbolt 4 Universal Dock (WD22TB4)",
      spec: "Thunderbolt 4 / 130W PD / Modular / Dual 4K 60Hz",
      category: "PERIPHERAL",
      qty: 160,
      targetPrice: 23200.0,
      apex: { landed: 23498.0, raw: 23048.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 24656.0, raw: 24656.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 24434.0, raw: 23584.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 36500.0, raw: 36500.0, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 23498.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 16,
      skuCode: "SKU-016",
      name: "HP E24 G5 24\" FHD Workspace Monitor",
      spec: "24\" FHD IPS / Ergonomic Stand / Low Blue Light",
      category: "PERIPHERAL",
      qty: 250,
      targetPrice: 13100.0,
      apex: { landed: 13522.0, raw: 13072.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 13984.0, raw: 13984.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 14226.0, raw: 13376.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 36500.0, raw: 36500.0, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 13522.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 17,
      skuCode: "SKU-017",
      name: "Logitech MX Master 3S + Mechanical Combo",
      spec: "Wireless MX Master 3S Mouse + MX Mechanical Keyboard",
      category: "PERIPHERAL",
      qty: 150,
      targetPrice: 16900.0,
      apex: { landed: 17478.0, raw: 17028.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 18216.0, raw: 18216.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 18274.0, raw: 17424.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 36500.0, raw: 36500.0, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 17478.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 18,
      skuCode: "SKU-018",
      name: "Jabra Evolve2 65 Wireless ANC Headset",
      spec: "Wireless Bluetooth Headset / ANC / 37hr Battery",
      category: "PERIPHERAL",
      qty: 140,
      targetPrice: 15800.0,
      apex: { landed: 16360.0, raw: 15910.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 17020.0, raw: 17020.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 17130.0, raw: 16280.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 36500.0, raw: 36500.0, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 16360.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 19,
      skuCode: "SKU-019",
      name: "Dell UltraSharp 32 6K Monitor (U3224KB)",
      spec: "32\" 6K IPS Black / Integrated 4K Webcam / 140W TB4",
      category: "PERIPHERAL",
      qty: 15,
      targetPrice: 169000.0,
      apex: { landed: 162990.0, raw: 162540.0, isBest: false, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 173880.0, raw: 173880.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 167170.0, raw: 166320.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 36500.0, raw: 36500.0, isBest: true, bidPresent: true },
      recommendedVendor: "Shree Balaji Infotech",
      recommendedPrice: 36500.0,
      rationale: "Competitive peripheral / storage rate with immediate stock availability & DDP delivery"
    },
    {
      line: 20,
      skuCode: "SKU-020",
      name: "Lenovo ThinkPad Universal Thunderbolt 4 Dock",
      spec: "Universal TB4 Dock / 100W PD / vPro Pass-through",
      category: "PERIPHERAL",
      qty: 80,
      targetPrice: 24500.0,
      apex: { landed: 24874.0, raw: 24424.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 26128.0, raw: 26128.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 25842.0, raw: 24992.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 36500.0, raw: 36500.0, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 24874.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 21,
      skuCode: "SKU-021",
      name: "Logitech Brio 4K Ultra HD Business Webcam",
      spec: "4K HDR Pro Webcam / Windows Hello IR / Dual Mics",
      category: "PERIPHERAL",
      qty: 90,
      targetPrice: 14200.0,
      apex: { landed: 14898.0, raw: 14448.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 15456.0, raw: 15456.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 15634.0, raw: 14784.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 36500.0, raw: 36500.0, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 14898.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 22,
      skuCode: "SKU-022",
      name: "APC Back-UPS Pro 1500VA Desktop UPS",
      spec: "1500VA / 865W / LCD Screen / Automatic Voltage Reg",
      category: "PERIPHERAL",
      qty: 70,
      targetPrice: 14900.0,
      apex: { landed: 15242.0, raw: 14792.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 15824.0, raw: 15824.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 15986.0, raw: 15136.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 36500.0, raw: 36500.0, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 15242.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 23,
      skuCode: "SKU-023",
      name: "Dell PowerEdge R760 2U Rack Server",
      spec: "2U Rack / 2x Xeon Gold 6430 / 256GB RAM / 15TB NVMe",
      category: "INFRA",
      qty: 8,
      targetPrice: 995000.0,
      apex: { landed: 980850.0, raw: 980400.0, isBest: false, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 1048800.0, raw: 1048800.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 1004050.0, raw: 1003200.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 585000.0, raw: 585000.0, isBest: true, bidPresent: true },
      recommendedVendor: "Shree Balaji Infotech",
      recommendedPrice: 585000.0,
      rationale: "Competitive peripheral / storage rate with immediate stock availability & DDP delivery"
    },
    {
      line: 24,
      skuCode: "SKU-024",
      name: "HPE ProLiant DL380 Gen11 2U Server",
      spec: "2U Rack / 2x Xeon Silver 4410Y / 128GB / HPE iLO 6",
      category: "INFRA",
      qty: 10,
      targetPrice: 685000.0,
      apex: { landed: 671250.0, raw: 670800.0, isBest: false, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 717600.0, raw: 717600.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 687250.0, raw: 686400.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 585000.0, raw: 585000.0, isBest: true, bidPresent: true },
      recommendedVendor: "Shree Balaji Infotech",
      recommendedPrice: 585000.0,
      rationale: "Competitive peripheral / storage rate with immediate stock availability & DDP delivery"
    },
    {
      line: 25,
      skuCode: "SKU-025",
      name: "Cisco Catalyst 9300 48-Port PoE+ Switch",
      spec: "48-Port PoE+ L3 Switch / 4x 10G SFP+ / DNA Advantage",
      category: "INFRA",
      qty: 12,
      targetPrice: 410000.0,
      apex: { landed: 400350.0, raw: 399900.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 427800.0, raw: 427800.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 410050.0, raw: 409200.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 585000.0, raw: 585000.0, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 400350.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 26,
      skuCode: "SKU-026",
      name: "Fortinet FortiGate 100F Next-Gen Firewall",
      spec: "100F NGFW / 1Gbps Threat Protection / 3yr License",
      category: "INFRA",
      qty: 6,
      targetPrice: 340000.0,
      apex: { landed: 331550.0, raw: 331100.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 354200.0, raw: 354200.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 339650.0, raw: 338800.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 585000.0, raw: 585000.0, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 331550.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 27,
      skuCode: "SKU-027",
      name: "Aruba CX 6200F 24-Port Gigabit Access Switch",
      spec: "24G PoE+ Switch / 4x 10G SFP+ / Aruba AOS-CX",
      category: "INFRA",
      qty: 14,
      targetPrice: 208000.0,
      apex: { landed: 202550.0, raw: 202100.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 216200.0, raw: 216200.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 207650.0, raw: 206800.0, isBest: false, bidPresent: true, isSlaBreach: true },
      balaji: { landed: 585000.0, raw: 585000.0, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 202550.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    },
    {
      line: 28,
      skuCode: "SKU-028",
      name: "Dell PowerEdge R660 1U High-Density Server",
      spec: "1U High-Density / Xeon Gold 5418Y / 128GB / 7.6TB NVMe",
      category: "INFRA",
      qty: 8,
      targetPrice: 725000.0,
      apex: { landed: 705650.0, raw: 705200.0, isBest: false, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 754400.0, raw: 754400.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 0, raw: 0, isBest: false, bidPresent: false, isSlaBreach: true },
      balaji: { landed: 585000.0, raw: 585000.0, isBest: true, bidPresent: true },
      recommendedVendor: "Shree Balaji Infotech",
      recommendedPrice: 585000.0,
      rationale: "Competitive peripheral / storage rate with immediate stock availability & DDP delivery"
    },
    {
      line: 29,
      skuCode: "SKU-029",
      name: "Synology Enterprise 12-Bay RackStation NAS (RS3621RPxs)",
      spec: "12-Bay 2U NAS / 192TB Raw Storage / Dual 10GbE",
      category: "INFRA",
      qty: 4,
      targetPrice: 615000.0,
      apex: { landed: 593850.0, raw: 593400.0, isBest: false, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 634800.0, raw: 634800.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 0, raw: 0, isBest: false, bidPresent: false, isSlaBreach: true },
      balaji: { landed: 585000.0, raw: 585000.0, isBest: true, bidPresent: true },
      recommendedVendor: "Shree Balaji Infotech",
      recommendedPrice: 585000.0,
      rationale: "Competitive peripheral / storage rate with immediate stock availability & DDP delivery"
    },
    {
      line: 30,
      skuCode: "SKU-030",
      name: "APC Smart-UPS On-Line 3000VA 2U Rackmount UPS",
      spec: "3kVA / 2.7kW Double-Conversion Online 2U UPS",
      category: "INFRA",
      qty: 8,
      targetPrice: 218000.0,
      apex: { landed: 211150.0, raw: 210700.0, isBest: true, bidPresent: true },
      compuzone: { landed: 0, raw: 0, isBest: false, bidPresent: true },
      national: { landed: 225400.0, raw: 225400.0, isBest: false, bidPresent: true, isSpecMismatch: false, specMismatchReason: "" },
      vardhman: { landed: 0, raw: 0, isBest: false, bidPresent: false, isSlaBreach: true },
      balaji: { landed: 585000.0, raw: 585000.0, isBest: false, bidPresent: true },
      recommendedVendor: "Apex Technology Solutions",
      recommendedPrice: 211150.0,
      rationale: "Lowest eligible normalized landed price; verified OEM partner & quality cleared"
    }
  ];

  // Dynamically map all 30 rows from matrixData when available, or fall back to canonical30Skus
  const allSkus: SkuRow[] = React.useMemo(() => {
    if (matrixData && matrixData.rows && matrixData.rows.length > 0) {
      return matrixData.rows.map((row: any) => {
        let cat: "COMPUTE" | "PERIPHERAL" | "INFRA" = "COMPUTE";
        const catLower = (row.category || "").toLowerCase();
        if (catLower.includes("laptop") || catLower.includes("compute") || catLower.includes("desktop") || row.line_number <= 12) {
          cat = "COMPUTE";
        } else if (catLower.includes("display") || catLower.includes("monitor") || catLower.includes("peripheral") || catLower.includes("dock") || (row.line_number >= 13 && row.line_number <= 22)) {
          cat = "PERIPHERAL";
        } else {
          cat = "INFRA";
        }

        const qApex = row.quotes?.["VEND-001"] || {};
        const qCompu = row.quotes?.["VEND-002"] || {};
        const qNat = row.quotes?.["VEND-003"] || {};
        const qVard = row.quotes?.["VEND-004"] || {};
        const qBal = row.quotes?.["VEND-005"] || {};

        const baseItem = canonical30Skus.find(b => b.line === row.line_number);
        const alloc = scenarioResult?.line_allocations?.find((a: any) => a.line_number === row.line_number);
        const recVendor = alloc?.awarded_vendor_name
          ? cleanVendorName(alloc.awarded_vendor_name)
          : (baseItem?.recommendedVendor || "Apex Technology Solutions");
        const recPrice = alloc?.unit_price_inr || alloc?.allocated_unit_price_inr || baseItem?.recommendedPrice || row.target_price_inr || 0;
        const recRat = alloc?.allocation_rationale || baseItem?.rationale || "Normalized lowest landed eligible award.";

        return {
          line: row.line_number,
          skuCode: row.sku_code || `SKU-${String(row.line_number).padStart(3, "0")}`,
          name: row.description || baseItem?.name || `Enterprise Item ${row.line_number}`,
          spec: row.specs_summary || baseItem?.spec || "",
          category: cat,
          qty: row.annual_volume || baseItem?.qty || 1,
          targetPrice: row.target_price_inr || baseItem?.targetPrice || 0,
          apex: {
            landed: qApex.landed_cost_unit_inr || 0,
            raw: qApex.base_unit_price_inr || 0,
            bidPresent: !!(qApex.is_bid_present && qApex.landed_cost_unit_inr > 0),
            isBest: isAwarded(row.line_number, "VEND-001") || qApex.pricing_status === "WINNING_GREEN"
          },
          compuzone: {
            landed: qCompu.landed_cost_unit_inr || 0,
            raw: qCompu.base_unit_price_inr || 0,
            bidPresent: !!(qCompu.is_bid_present && qCompu.landed_cost_unit_inr > 0),
            isBest: isAwarded(row.line_number, "VEND-002") || qCompu.pricing_status === "WINNING_GREEN"
          },
          national: {
            landed: qNat.landed_cost_unit_inr || 0,
            raw: qNat.base_unit_price_inr || 0,
            bidPresent: !!(qNat.is_bid_present && qNat.landed_cost_unit_inr > 0),
            isBest: isAwarded(row.line_number, "VEND-003") || qNat.pricing_status === "WINNING_GREEN",
            isSpecMismatch: qNat.is_technically_eligible === false,
            specMismatchReason: qNat.technical_check_reason
          },
          vardhman: {
            landed: qVard.landed_cost_unit_inr || 0,
            raw: qVard.base_unit_price_inr || 0,
            bidPresent: !!(qVard.is_bid_present && qVard.landed_cost_unit_inr > 0),
            isBest: false,
            isSlaBreach: true
          },
          balaji: {
            landed: qBal.landed_cost_unit_inr || 0,
            raw: qBal.base_unit_price_inr || 0,
            bidPresent: !!(qBal.is_bid_present && qBal.landed_cost_unit_inr > 0),
            isBest: isAwarded(row.line_number, "VEND-005") || qBal.pricing_status === "WINNING_GREEN"
          },
          recommendedVendor: recVendor,
          recommendedPrice: recPrice,
          rationale: recRat
        };
      });
    }
    return canonical30Skus;
  }, [matrixData, scenarioResult]);

  // Filtering
  const filteredSkus = allSkus.filter(sku => {
    if (selectedCategory === "COMPUTE") return sku.category === "COMPUTE";
    if (selectedCategory === "PERIPHERAL") return sku.category === "PERIPHERAL";
    if (selectedCategory === "INFRA") return sku.category === "INFRA";
    return true;
  });

  const totalPages = Math.ceil(filteredSkus.length / itemsPerPage);
  const displayedSkus = filteredSkus.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatInr = (val: number) => {
    if (!val || val === 0) return "— No Bid";
    return `₹${val.toLocaleString("en-IN")}`;
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
      {/* 1. Header with Breadcrumb & KPI Cards */}
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
            <span>STAGE 3 OF 4</span>
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
            Compare & Optimize
          </h1>
          <p style={{ fontSize: "13.5px", color: "#64748B", margin: "4px 0 0 0" }}>
            AI compares normalized quotes, enforces quality questionnaire eligibility, and recommends the explainable award strategy.
          </p>
        </div>

        {/* 3 KPI Spend Cards */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "10px 18px",
              minWidth: "125px"
            }}
          >
            <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Baseline Spend</div>
            <div style={{ fontSize: "19px", fontWeight: 700, color: "#0F172A", marginTop: "2px" }}>
              ₹{(baselineSpend / 10000000).toFixed(2)} Cr
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "10px 18px",
              minWidth: "125px"
            }}
          >
            <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Optimized Spend</div>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#0F172A", marginTop: "2px" }}>
              ₹{(totalSpend / 10000000).toFixed(2)} Cr
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: "12px",
              padding: "10px 18px",
              minWidth: "155px"
            }}
          >
            <div style={{ fontSize: "11px", color: "#166534", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Projected Savings</span>
              <TrendingDown size={14} color="#16A34A" />
            </div>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#166534", marginTop: "2px" }}>
              ₹{(netSavings / 10000000).toFixed(2)} Cr ({savingsPct.toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Exception Status Banner: Verified vs Pending */}
      {pendingExceptions.length > 0 ? (
        <div
          style={{
            backgroundColor: "#FFFBEB",
            border: "1px solid #FCD34D",
            borderRadius: "12px",
            padding: "10px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertTriangle size={18} color="#D97706" />
            <div>
              <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#92400E" }}>
                Stage 2 Exceptions Pending Buyer Verification ({pendingExceptions.length} pending review)
              </div>
              <div style={{ fontSize: "11.5px", color: "#78350F", marginTop: "1px" }}>
                Optimization solver is evaluating provisional AI normalizations for {pendingExceptions.map((e: any) => e.supplierName).slice(0, 3).join(", ")}{pendingExceptions.length > 3 ? "..." : ""}. Unverified rates are marked provisional.
              </div>
            </div>
          </div>
          <button
            onClick={onBackToReview}
            style={{
              fontSize: "11.5px",
              fontWeight: 700,
              backgroundColor: "#FFFFFF",
              color: "#B45309",
              border: "1px solid #F59E0B",
              borderRadius: "6px",
              padding: "5px 12px",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            Review Exceptions in Stage 2
          </button>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: "12px",
            padding: "8px 18px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <CheckCircle2 size={16} color="#16A34A" />
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#166534" }}>
            All commercial exceptions verified & normalized by buyer. Full audit provenance established for optimization.
          </div>
        </div>
      )}

      {/* 2. Recommended Strategy Banner Card with all 4 Constraints (Issue 1) */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #DBEAFE",
          borderRadius: "14px",
          padding: "16px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(37, 99, 235, 0.04)",
          gap: "20px",
          flexWrap: "wrap"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              backgroundColor: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563EB",
              flexShrink: 0
            }}
          >
            <Coins size={22} color="#2563EB" />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
              {strategyTitle}
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
              Meets all 4 constraints — Quality questionnaire passed, DDP delivery terms normalized, SLA ≤ 12 days, and minimum supplier spend ≥ ₹5.00 Lakhs.
            </div>
          </div>
        </div>

        {/* 4 Strategy Constraints + Ask AI button (Issue 1) */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          {/* Constraint 1: Quality Questionnaire Pre-Qualification (Issue 1) */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
            <ShieldCheck size={18} color="#16A34A" />
            <div>
              <div style={{ fontWeight: 700, color: "#0F172A" }}>All Awarded Passed</div>
              <div style={{ fontSize: "10.5px", color: "#64748B" }}>Quality questionnaire</div>
            </div>
          </div>

          {/* Constraint 2: DDP Delivery */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
            <Truck size={17} color="#2563EB" />
            <div>
              <div style={{ fontWeight: 700, color: "#0F172A" }}>Delivery Normalized</div>
              <div style={{ fontSize: "10.5px", color: "#64748B" }}>DDP delivery terms</div>
            </div>
          </div>

          {/* Constraint 3: Delivery SLA */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
            <Clock size={17} color="#0284C7" />
            <div>
              <div style={{ fontWeight: 700, color: "#0F172A" }}>Within 12 Days</div>
              <div style={{ fontSize: "10.5px", color: "#64748B" }}>Delivery SLA</div>
            </div>
          </div>

          {/* Constraint 4: Spend Threshold */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
            <Coins size={17} color="#059669" />
            <div>
              <div style={{ fontWeight: 700, color: "#0F172A" }}>≥ ₹5.00 Lakhs</div>
              <div style={{ fontSize: "10.5px", color: "#64748B" }}>Minimum spend</div>
            </div>
          </div>

          {/* Reset to 5 Canonical Benchmark Quotes Button (Issue 2) */}
          {onResetToDefault && (
            <button
              onClick={onResetToDefault}
              title="Reset matrix to canonical 5 benchmark vendors (Apex, CompuZone, National IT, Vardhman, Shree Balaji)"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: isCustomMode ? "#FEF3C7" : "#F8FAFC",
                color: isCustomMode ? "#92400E" : "#475569",
                border: isCustomMode ? "1.5px solid #FCD34D" : "1px solid #CBD5E1",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isCustomMode ? "0 1px 3px rgba(217, 119, 6, 0.15)" : "none"
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = isCustomMode ? "#FDE68A" : "#F1F5F9")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = isCustomMode ? "#FEF3C7" : "#F8FAFC")}
            >
              <RotateCcw size={14} color={isCustomMode ? "#B45309" : "#64748B"} />
              <span>{isCustomMode ? "Reset to 5 Benchmark Quotes" : "Reload Benchmark Quotes"}</span>
            </button>
          )}

          {/* Ask AI button */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(37, 99, 235, 0.3)",
              transition: "background-color 0.15s ease"
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1D4ED8")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#2563EB")}
          >
            <span>Ask AI</span>
            <Sparkles size={14} />
          </button>
        </div>
      </div>

      {/* 3. Sub-Tabs Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #E2E8F0",
          paddingBottom: "8px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* Tab 1: Matrix */}
          <button
            onClick={() => setActiveSubTab("matrix")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              borderBottom: activeSubTab === "matrix" ? "2.5px solid #2563EB" : "2.5px solid transparent",
              paddingBottom: "8px",
              color: activeSubTab === "matrix" ? "#2563EB" : "#64748B",
              fontSize: "13.5px",
              fontWeight: activeSubTab === "matrix" ? 700 : 500,
              cursor: "pointer"
            }}
          >
            <TableIcon size={16} />
            <span>Quote Comparison Matrix (30 SKUs)</span>
          </button>

          {/* Tab 2: Supplier Evaluation & Questionnaire (Issue 1) */}
          <button
            onClick={() => setActiveSubTab("compliance")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              borderBottom: activeSubTab === "compliance" ? "2.5px solid #2563EB" : "2.5px solid transparent",
              paddingBottom: "8px",
              color: activeSubTab === "compliance" ? "#2563EB" : "#64748B",
              fontSize: "13.5px",
              fontWeight: activeSubTab === "compliance" ? 700 : 500,
              cursor: "pointer"
            }}
          >
            <ShieldCheck size={16} />
            <span>Supplier Evaluation & Quality Questionnaire</span>
          </button>
        </div>
      </div>

      {/* 4. Controls: Category Filters & Landed/Raw Toggle */}
      {activeSubTab === "matrix" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Quick Scenario Optimization Switcher */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            <div
              onClick={() => onScenarioChange("vp_constrained_split")}
              style={{
                border: activeScenario === "vp_constrained_split" ? "2px solid #2563EB" : "1px solid #E2E8F0",
                backgroundColor: activeScenario === "vp_constrained_split" ? "#EFF6FF" : "#FFFFFF",
                borderRadius: "10px",
                padding: "12px 16px",
                cursor: "pointer",
                boxShadow: activeScenario === "vp_constrained_split" ? "0 2px 6px rgba(37,99,235,0.12)" : "0 1px 2px rgba(0,0,0,0.02)",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#2563EB", textTransform: "uppercase" }}>⭐ Recommended Strategy</span>
                {activeScenario === "vp_constrained_split" && (
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#1D4ED8", backgroundColor: "#DBEAFE", padding: "1px 6px", borderRadius: "8px" }}>Selected</span>
                )}
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0F172A", marginTop: "3px" }}>VP Constrained Split Award</div>
              <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                Quality passed • SLA ≤12d • DDP normalized • Min ₹5L spend
              </div>
            </div>

            <div
              onClick={() => onScenarioChange("unconstrained_lowest")}
              style={{
                border: activeScenario === "unconstrained_lowest" ? "2px solid #D97706" : "1px solid #E2E8F0",
                backgroundColor: activeScenario === "unconstrained_lowest" ? "#FFFBEB" : "#FFFFFF",
                borderRadius: "10px",
                padding: "12px 16px",
                cursor: "pointer",
                boxShadow: activeScenario === "unconstrained_lowest" ? "0 2px 6px rgba(217,119,6,0.12)" : "0 1px 2px rgba(0,0,0,0.02)",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#D97706", textTransform: "uppercase" }}>⚠️ Unconstrained Risk</span>
                {activeScenario === "unconstrained_lowest" && (
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#B45309", backgroundColor: "#FDE68A", padding: "1px 6px", borderRadius: "8px" }}>Selected</span>
                )}
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0F172A", marginTop: "3px" }}>Lowest Line-by-Line</div>
              <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                Sticker price cherry-pick ignoring SLA (16d delay risk)
              </div>
            </div>

            <div
              onClick={() => onScenarioChange("single_source_best")}
              style={{
                border: activeScenario === "single_source_best" ? "2px solid #475569" : "1px solid #E2E8F0",
                backgroundColor: activeScenario === "single_source_best" ? "#F1F5F9" : "#FFFFFF",
                borderRadius: "10px",
                padding: "12px 16px",
                cursor: "pointer",
                boxShadow: activeScenario === "single_source_best" ? "0 2px 6px rgba(71,85,105,0.12)" : "0 1px 2px rgba(0,0,0,0.02)",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>🏢 Sole Supplier</span>
                {activeScenario === "single_source_best" && (
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#1E293B", backgroundColor: "#E2E8F0", padding: "1px 6px", borderRadius: "8px" }}>Selected</span>
                )}
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0F172A", marginTop: "3px" }}>Sole Supplier Consolidation</div>
              <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                100% awarded to Apex Technology (leaves ₹1.41 Cr savings on table)
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          {/* Left: Filter Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>Category:</span>

            <button
              onClick={() => { setSelectedCategory("ALL"); setCurrentPage(1); }}
              style={{
                padding: "5px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: selectedCategory === "ALL" ? 700 : 500,
                backgroundColor: selectedCategory === "ALL" ? "#F1F5F9" : "#FFFFFF",
                color: selectedCategory === "ALL" ? "#0F172A" : "#64748B",
                border: "1px solid #CBD5E1",
                cursor: "pointer"
              }}
            >
              All Items ({allSkus.length}) ▾
            </button>

            <button
              onClick={() => { setSelectedCategory("COMPUTE"); setCurrentPage(1); }}
              style={{
                padding: "5px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: selectedCategory === "COMPUTE" ? 700 : 500,
                backgroundColor: selectedCategory === "COMPUTE" ? "#EFF6FF" : "#FFFFFF",
                color: selectedCategory === "COMPUTE" ? "#1D4ED8" : "#64748B",
                border: selectedCategory === "COMPUTE" ? "1px solid #BFDBFE" : "1px solid #E2E8F0",
                cursor: "pointer"
              }}
            >
              Laptops & Compute ({allSkus.filter(s => s.category === "COMPUTE").length})
            </button>

            <button
              onClick={() => { setSelectedCategory("PERIPHERAL"); setCurrentPage(1); }}
              style={{
                padding: "5px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: selectedCategory === "PERIPHERAL" ? 700 : 500,
                backgroundColor: selectedCategory === "PERIPHERAL" ? "#EFF6FF" : "#FFFFFF",
                color: selectedCategory === "PERIPHERAL" ? "#1D4ED8" : "#64748B",
                border: selectedCategory === "PERIPHERAL" ? "1px solid #BFDBFE" : "1px solid #E2E8F0",
                cursor: "pointer"
              }}
            >
              Displays & Docks ({allSkus.filter(s => s.category === "PERIPHERAL").length})
            </button>

            <button
              onClick={() => { setSelectedCategory("INFRA"); setCurrentPage(1); }}
              style={{
                padding: "5px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: selectedCategory === "INFRA" ? 700 : 500,
                backgroundColor: selectedCategory === "INFRA" ? "#EFF6FF" : "#FFFFFF",
                color: selectedCategory === "INFRA" ? "#1D4ED8" : "#64748B",
                border: selectedCategory === "INFRA" ? "1px solid #BFDBFE" : "1px solid #E2E8F0",
                cursor: "pointer"
              }}
            >
              Enterprise Servers ({allSkus.filter(s => s.category === "INFRA").length})
            </button>
          </div>

          {/* Right: Adjusted Landed vs Raw Quoted Price Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#F1F5F9",
              borderRadius: "8px",
              padding: "3px",
              border: "1px solid #E2E8F0"
            }}
          >
            <button
              onClick={() => setPriceMode("landed")}
              style={{
                padding: "4px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: priceMode === "landed" ? 700 : 500,
                backgroundColor: priceMode === "landed" ? "#2563EB" : "transparent",
                color: priceMode === "landed" ? "#FFFFFF" : "#64748B",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              Adjusted Landed Price (TCO)
            </button>
            <button
              onClick={() => setPriceMode("raw")}
              style={{
                padding: "4px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: priceMode === "raw" ? 700 : 500,
                backgroundColor: priceMode === "raw" ? "#2563EB" : "transparent",
                color: priceMode === "raw" ? "#FFFFFF" : "#64748B",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              Raw Quoted Price
            </button>
          </div>
        </div>
      </div>
      )}

      {/* 5. Master Quote Comparison Table (Exactly 5 Suppliers - Issue 2) */}
      {activeSubTab === "matrix" && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12.5px" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B" }}>
                  <th style={{ padding: "12px 14px", width: "35px" }}>#</th>
                  <th style={{ padding: "12px 14px", minWidth: "220px" }}>SKU & Description</th>
                  <th style={{ padding: "12px 14px", width: "50px" }}>Qty</th>
                  <th style={{ padding: "12px 14px", minWidth: "105px" }}>
                    Target Price <Info size={11} style={{ display: "inline", verticalAlign: "middle" }} />
                    <div style={{ fontSize: "10px", color: "#94A3B8" }}>(Benchmark)</div>
                  </th>

                  {/* 5 Canonical Vendors Column Headers (Issue 2) */}
                  {dynamicVendors.map(v => (
                    <th
                      key={v.id}
                      style={{
                        padding: "12px 14px",
                        backgroundColor: v.id === "VEND-001" ? "#EFF6FF" : "inherit",
                        color: v.isDisqualified ? "#DC2626" : v.id === "VEND-001" ? "#1D4ED8" : "#0F172A",
                        minWidth: "135px"
                      }}
                    >
                      <div>{v.name}</div>
                      <div style={{ fontSize: "10px", color: v.badgeColor, fontWeight: 600 }}>
                        ({v.statusBadge} • {v.qualityStatus === "Passed" ? "Qual ✓" : "Qual ✗"})
                      </div>
                    </th>
                  ))}

                  <th style={{ padding: "12px 14px", minWidth: "230px" }}>
                    Recommended Winner & Rationale <span style={{ fontSize: "10.5px", color: "#2563EB", fontWeight: 400 }}>(Click for full analysis)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedSkus.map((sku, idx) => {
                  const winningAlloc = getWinningAllocation(sku);
                  return (
                    <tr
                      key={sku.line}
                      style={{
                        borderBottom: idx < displayedSkus.length - 1 ? "1px solid #F1F5F9" : "none",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#FBFDFF")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* # */}
                      <td style={{ padding: "14px", color: "#64748B", fontWeight: 600 }}>
                        {sku.line}
                      </td>

                      {/* SKU & Description */}
                      <td style={{ padding: "14px" }}>
                        <div style={{ fontWeight: 700, color: "#0F172A" }}>
                          {sku.name}
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "1px" }}>
                          {sku.spec}
                        </div>
                      </td>

                      {/* Qty */}
                      <td style={{ padding: "14px", color: "#0F172A", fontWeight: 600 }}>
                        {sku.qty}
                      </td>

                      {/* Target Price */}
                      <td style={{ padding: "14px", color: "#334155", fontWeight: 600 }}>
                        ₹{sku.targetPrice.toLocaleString("en-IN")}
                      </td>

                      {/* Dynamic Vendor Pricing Cells with Spec Mismatch Checks (Issue 3) */}
                      {dynamicVendors.map(v => {
                        const cell = getVendorCellData(sku, v.id);
                        const price = priceMode === "landed" ? cell.landed : cell.raw;
                        const isWon = winningAlloc.vendorId === v.id;
                        const isMismatch = cell.isSpecMismatch;

                        return (
                          <td
                            key={v.id}
                            style={{
                              padding: "14px",
                              backgroundColor: isWon ? "#ECFDF5" : v.id === "VEND-001" ? "#F8FAFC" : "inherit",
                              cursor: isWon ? "pointer" : "default"
                            }}
                            onClick={() => {
                              if (isWon) {
                                setWinnerExplanationSku(sku);
                              }
                            }}
                          >
                            {cell.bidPresent && price > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span
                                    style={{
                                      fontWeight: 700,
                                      color: isMismatch ? "#DC2626" : isWon ? "#166534" : v.isDisqualified ? "#B91C1C" : "#0F172A",
                                      textDecoration: (v.isDisqualified || isMismatch) ? "line-through" : "none"
                                    }}
                                  >
                                    {formatInr(price)}
                                  </span>

                                  {/* Badges */}
                                  {isWon && !isMismatch ? (
                                    <span style={{ fontSize: "9.5px", fontWeight: 700, backgroundColor: "#DCFCE7", color: "#15803D", padding: "1px 5px", borderRadius: "4px" }}>
                                      Awarded ▾
                                    </span>
                                  ) : isMismatch ? (
                                    <span style={{ fontSize: "9.5px", fontWeight: 700, backgroundColor: "#FEE2E2", color: "#B91C1C", padding: "1px 5px", borderRadius: "4px" }}>
                                      Spec Mismatch ✗
                                    </span>
                                  ) : v.isDisqualified ? (
                                    <span style={{ fontSize: "9.5px", fontWeight: 700, backgroundColor: "#FEE2E2", color: "#B91C1C", padding: "1px 5px", borderRadius: "4px" }}>
                                      SLA ✗
                                    </span>
                                  ) : null}
                                </div>

                                {isMismatch && (
                                  <span style={{ fontSize: "10px", color: "#DC2626", maxWidth: "120px", lineHeight: 1.2 }}>
                                    Generic rate does not match specs
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: "#94A3B8" }}>— No Bid</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Recommended Supplier & Rationale (Issue 4 Explainability - Dynamically Aligned with Winner) */}
                      <td style={{ padding: "14px" }}>
                        <div
                          onClick={() => setWinnerExplanationSku(sku)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            padding: "6px 10px",
                            borderRadius: "8px",
                            backgroundColor: "#F0FDF4",
                            border: "1px solid #BBF7D0",
                            transition: "all 0.15s ease"
                          }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#DCFCE7")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#F0FDF4")}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <CheckCircle2 size={14} color="#16A34A" />
                              <span style={{ fontWeight: 700, color: "#166534" }}>
                                {winningAlloc.vendorName}
                              </span>
                            </div>
                            <div style={{ fontSize: "11px", color: "#15803D", marginTop: "2px" }}>
                              {winningAlloc.rationale}
                            </div>
                          </div>
                          <ChevronRight size={15} color="#16A34A" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar with Page Size Control */}
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "#64748B",
              backgroundColor: "#F8FAFC",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div>
                Showing {filteredSkus.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} – {Math.min(currentPage * itemsPerPage, filteredSkus.length)} of {filteredSkus.length} SKUs
              </div>

              {/* Page size toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11.5px", color: "#94A3B8" }}>Show:</span>
                {[10, 15, 30].map(sz => (
                  <button
                    key={sz}
                    onClick={() => { setItemsPerPage(sz); setCurrentPage(1); }}
                    style={{
                      border: itemsPerPage === sz ? "1.5px solid #2563EB" : "1px solid #CBD5E1",
                      backgroundColor: itemsPerPage === sz ? "#EFF6FF" : "#FFFFFF",
                      color: itemsPerPage === sz ? "#1D4ED8" : "#64748B",
                      borderRadius: "6px",
                      padding: "2px 8px",
                      fontSize: "11px",
                      fontWeight: itemsPerPage === sz ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {sz === 30 ? "All 30" : `${sz} / page`}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  color: currentPage === 1 ? "#CBD5E1" : "#334155"
                }}
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      border: currentPage === pageNum ? "1px solid #2563EB" : "1px solid #E2E8F0",
                      backgroundColor: currentPage === pageNum ? "#2563EB" : "#FFFFFF",
                      color: currentPage === pageNum ? "#FFFFFF" : "#334155",
                      borderRadius: "6px",
                      padding: "3px 9px",
                      fontSize: "12px",
                      fontWeight: currentPage === pageNum ? 700 : 500,
                      cursor: "pointer"
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  color: currentPage === totalPages ? "#CBD5E1" : "#334155"
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Evaluation & Quality Questionnaire Tab (Issue 1) */}
      {activeSubTab === "compliance" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Main Quality Questionnaire Matrix Table */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "14px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  Supplier Quality Questionnaire & Pre-Qualification Evaluation Matrix
                </h3>
                <p style={{ fontSize: "12.5px", color: "#64748B", margin: "4px 0 0 0" }}>
                  Evaluates ISO 9001 certification, historical Dead-on-Arrival (DoA) defect rates (≤2.0% hurdle), delivery turnaround SLAs, and overall eligibility.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#166534", backgroundColor: "#DCFCE7", padding: "4px 10px", borderRadius: "6px" }}>
                  4 Suppliers Eligible
                </span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#991B1B", backgroundColor: "#FEE2E2", padding: "4px 10px", borderRadius: "6px" }}>
                  1 Supplier Excluded
                </span>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569" }}>
                    <th style={{ padding: "12px 14px", fontWeight: 700 }}>Supplier</th>
                    <th style={{ padding: "12px 14px", fontWeight: 700 }}>Quality Questionnaire</th>
                    <th style={{ padding: "12px 14px", fontWeight: 700 }}>Audit Score & Evidence</th>
                    <th style={{ padding: "12px 14px", fontWeight: 700 }}>Delivery Terms</th>
                    <th style={{ padding: "12px 14px", fontWeight: 700 }}>Delivery SLA</th>
                    <th style={{ padding: "12px 14px", fontWeight: 700 }}>Eligibility Status</th>
                    <th style={{ padding: "12px 14px", fontWeight: 700 }}>Audit Rationale / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "Apex Technology Solutions",
                      qq: "Passed",
                      score: "94 / 100",
                      evidence: "ISO 9001:2015 Verified • 1.4% DoA Defect Rate • Tier-1 Lenovo/Dell Partner",
                      terms: "Ex-Works Bhiwandi (Normalized to DDP +₹450/unit)",
                      sla: "7 Days (Within 12d SLA)",
                      eligibility: "Eligible",
                      notes: "Cleared quality questionnaire and technical criteria; awarded 19 compute & server SKUs.",
                      isEligible: true
                    },
                    {
                      name: "CompuZone India Pvt Ltd",
                      qq: "Passed",
                      score: "98 / 100",
                      evidence: "ISO 27001 & ISO 9001 • 0.8% Defect Rate • Direct OEM Partner for Apple, Dell & Lenovo",
                      terms: "DDP Tech Centers (4.5% Turnover Rebate)",
                      sla: "9 Days (Within 12d SLA)",
                      eligibility: "Eligible",
                      notes: "Highest audit score; eligible for award; unbid on standard client compute line items.",
                      isEligible: true
                    },
                    {
                      name: "National IT Systems",
                      qq: "Passed",
                      score: "95 / 100",
                      evidence: "ISO 9001:2015 • 1.2% Defect Rate • Dedicated Autopilot & Staging Labs",
                      terms: "DDP Hinjawadi/Bengaluru Tech Centers",
                      sla: "10 Days (Within 12d SLA)",
                      eligibility: "Eligible",
                      notes: "Cleared quality questionnaire; awarded 4 display & laptop lines; disqualified on MacBook Pro due to spec mismatch.",
                      isEligible: true
                    },
                    {
                      name: "Vardhman Infotech",
                      qq: "Failed / pending",
                      score: "58 / 100",
                      evidence: "Uncertified distribution depot • 2.8% DoA Defect Rate (Breaches ≤2.0% hurdle)",
                      terms: "Ex-Works Surat (Partial Bid - Lines 28-30 unquoted)",
                      sla: "16 Days (Breaches ≤ 12d SLA)",
                      eligibility: "Excluded",
                      notes: "Disqualified: Failed quality questionnaire, breached 12-day SLA hurdle, and omitted enterprise rack servers.",
                      isEligible: false
                    },
                    {
                      name: "Shree Balaji Infotech",
                      qq: "Passed",
                      score: "91 / 100",
                      evidence: "Spotless 3-Yr Enterprise Track Record • 1.1% Defect Rate • Incumbent Partner",
                      terms: "DDP Mumbai/Bengaluru (+3.5% FX escalation)",
                      sla: "8 Days (Within 12d SLA)",
                      eligibility: "Eligible",
                      notes: "Cleared quality questionnaire; rapid 8-day turnaround; awarded 7 Thunderbolt dock & peripheral SKUs.",
                      isEligible: true
                    }
                  ].map((v, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F1F5F9", backgroundColor: v.isEligible ? "transparent" : "#FEF2F2" }}>
                      <td style={{ padding: "14px", fontWeight: 700, color: "#0F172A" }}>{v.name}</td>
                      <td style={{ padding: "14px" }}>
                        <span style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          backgroundColor: v.isEligible ? "#DCFCE7" : "#FEE2E2",
                          color: v.isEligible ? "#15803D" : "#991B1B"
                        }}>
                          {v.qq}
                        </span>
                      </td>
                      <td style={{ padding: "14px", color: "#334155" }}>
                        <strong>{v.score}</strong>
                        <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{v.evidence}</div>
                      </td>
                      <td style={{ padding: "14px", color: "#334155" }}>{v.terms}</td>
                      <td style={{ padding: "14px", color: v.isEligible ? "#166534" : "#DC2626", fontWeight: 600 }}>{v.sla}</td>
                      <td style={{ padding: "14px" }}>
                        <span style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          backgroundColor: v.isEligible ? "#EFF6FF" : "#FEE2E2",
                          color: v.isEligible ? "#1D4ED8" : "#991B1B"
                        }}>
                          {v.eligibility}
                        </span>
                      </td>
                      <td style={{ padding: "14px", fontSize: "11.5px", color: "#475569" }}>{v.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* 6. Bottom Allocation Bar */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "14px",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: "4px" }}>
            <span>Supplier Allocation (Projected)</span>
            <Info size={13} color="#94A3B8" />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {scenarioResult?.vendor_allocations && Object.keys(scenarioResult.vendor_allocations).length > 0 ? (
              Object.entries(scenarioResult.vendor_allocations)
                .filter(([_, alloc]: [string, any]) => alloc.sku_count > 0)
                .map(([vName, alloc]: [string, any], idx: number) => {
                  const palette = [
                    { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
                    { bg: "#F5F3FF", color: "#5B21B6", border: "#DDD6FE" },
                    { bg: "#F0FDF4", color: "#166534", border: "#BBF7D0" },
                    { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" }
                  ];
                  const c = palette[idx % palette.length];
                  const spendStr = alloc.total_spend_inr >= 10000000
                    ? `₹${(alloc.total_spend_inr / 10000000).toFixed(2)} Cr`
                    : `₹${(alloc.total_spend_inr / 100000).toFixed(2)} Lakhs`;
                  const cleanName = vName.replace(/^Vendor\s+\d+\s*[-–]\s*/i, "").trim();
                  return (
                    <span
                      key={vName}
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        backgroundColor: c.bg,
                        color: c.color,
                        padding: "4px 10px",
                        borderRadius: "8px",
                        border: `1px solid ${c.border}`
                      }}
                    >
                      {cleanName}: {spendStr} ({alloc.sku_count} SKUs)
                    </span>
                  );
                })
            ) : (
              <>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    backgroundColor: "#EFF6FF",
                    color: "#1D4ED8",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    border: "1px solid #BFDBFE"
                  }}
                >
                  Apex Technology: ₹8.90 Cr (19 SKUs)
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    backgroundColor: "#F5F3FF",
                    color: "#5B21B6",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    border: "1px solid #DDD6FE"
                  }}
                >
                  National IT Systems: ₹2.56 Cr (4 SKUs)
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    backgroundColor: "#F0FDF4",
                    color: "#166534",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    border: "1px solid #BBF7D0"
                  }}
                >
                  Shree Balaji: ₹2.61 Cr (7 SKUs)
                </span>
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "1px", height: "24px", backgroundColor: "#E2E8F0" }} />

          <button
            onClick={onProceedToAward}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              padding: "9px 22px",
              fontSize: "13.5px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(37, 99, 235, 0.25)",
              transition: "background-color 0.15s ease"
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1D4ED8")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#2563EB")}
          >
            <span>Review Award Recommendation</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ISSUE 4: Explainable Winner Decision Modal ("Why Winner Won")  */}
      {/* ============================================================== */}
      {winnerExplanationSku && (() => {
        const winningAlloc = getWinningAllocation(winnerExplanationSku);
        const otherVendors = dynamicVendors.filter(v => v.id !== winningAlloc.vendorId);

        return (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(15, 23, 42, 0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 110,
              backdropFilter: "blur(3px)"
            }}
          >
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                width: "680px",
                maxWidth: "94vw",
                maxHeight: "90vh",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  backgroundColor: "#F8FAFC"
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    AI Award Explainability Rationale • Line #{winnerExplanationSku.line}
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: "4px 0 0 0" }}>
                    Why {winningAlloc.vendorName} won {winnerExplanationSku.skuCode}
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "#64748B", margin: "2px 0 0 0" }}>
                    {winnerExplanationSku.name} ({winnerExplanationSku.spec})
                  </p>
                </div>
                <button
                  onClick={() => setWinnerExplanationSku(null)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94A3B8" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Winner Verification Card */}
                <div
                  style={{
                    backgroundColor: "#F0FDF4",
                    border: "1.5px solid #86EFAC",
                    borderRadius: "12px",
                    padding: "16px 20px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle2 size={18} color="#16A34A" />
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#166534" }}>
                        Recommended Winner: {winningAlloc.vendorName}
                      </span>
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#166534" }}>
                      {formatInr(winningAlloc.price)} / unit
                    </span>
                  </div>

                  <div style={{ fontSize: "12px", color: "#166534", lineHeight: 1.6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Check size={14} color="#16A34A" />
                      <span><strong>Lowest eligible normalized landed price</strong>: ₹{Math.round(winningAlloc.price).toLocaleString("en-IN")} vs target benchmark ₹{winnerExplanationSku.targetPrice.toLocaleString("en-IN")}.</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                      <Check size={14} color="#16A34A" />
                      <span><strong>Matches required technical configuration</strong>: 100% compliant with {winnerExplanationSku.spec}.</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                      <Check size={14} color="#16A34A" />
                      <span><strong>Passed quality questionnaire</strong>: Verified ISO 9001:2015 certification and defect rate complies with enterprise hurdle.</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                      <Check size={14} color="#16A34A" />
                      <span><strong>Meets delivery SLA</strong>: Committed lead time strictly complies with ≤ 12-day hurdle.</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                      <Check size={14} color="#16A34A" />
                      <span><strong>Commercial terms verified</strong>: Clean DDP normalized terms to tech centers.</span>
                    </div>
                  </div>
                </div>

                {/* Other Supplier Offers Comparison */}
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#334155", margin: "0 0 10px 0" }}>
                    Other Supplier Offers & Disqualification Analysis ({otherVendors.length} Competing Suppliers)
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {otherVendors.map(compVendor => {
                      const cell = getVendorCellData(winnerExplanationSku, compVendor.id);
                      const hasBid = cell.bidPresent && cell.landed > 0;
                      const isMismatch = cell.isSpecMismatch;
                      const isDisqualified = compVendor.isDisqualified;
                      const priceDiff = hasBid ? cell.landed - winningAlloc.price : 0;

                      return (
                        <div
                          key={compVendor.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            backgroundColor: (isMismatch || isDisqualified) ? "#FEF2F2" : "#F8FAFC",
                            border: (isMismatch || isDisqualified) ? "1px solid #FECACA" : "1px solid #E2E8F0",
                            borderRadius: "8px",
                            fontSize: "12px"
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 700, color: (isMismatch || isDisqualified) ? "#991B1B" : "#0F172A" }}>
                              {compVendor.name}:{" "}
                            </span>
                            <span>{hasBid ? formatInr(cell.landed) : "— No Bid"}</span>

                            {isMismatch ? (
                              <div style={{ fontSize: "11px", color: "#DC2626", marginTop: "2px" }}>
                                ⚠️ <strong>Technically Disqualified</strong>: {cell.specMismatchReason || "Generic PC quote fails spec match"}
                              </div>
                            ) : isDisqualified ? (
                              <div style={{ fontSize: "11px", color: "#DC2626", marginTop: "2px" }}>
                                ⚠️ <strong>Excluded</strong>: Lead time breaches ≤ 12-day delivery SLA or failed quality questionnaire audit.
                              </div>
                            ) : hasBid ? (
                              <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                                Technically compliant; higher landed cost than winning offer (+₹{Math.round(priceDiff).toLocaleString("en-IN")})
                              </div>
                            ) : (
                              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                                Item unquoted in supplier tender submission
                              </div>
                            )}
                          </div>

                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: isMismatch ? "#DC2626" : isDisqualified ? "#DC2626" : hasBid ? "#64748B" : "#94A3B8"
                            }}
                          >
                            {isMismatch
                              ? "Spec Mismatch ✗"
                              : isDisqualified
                                ? "SLA / Audit Fail ✗"
                                : hasBid
                                  ? "+ Higher Cost"
                                  : "No Bid"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: "14px 24px", backgroundColor: "#F8FAFC", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setWinnerExplanationSku(null)}
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                >
                  Close Explanation
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* Interactive Ask AI Modal (Aera AI Sourcing Copilot) */}
      {/* ============================================================== */}
      {isAiModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 120,
            backdropFilter: "blur(3px)"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAiModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              width: "780px",
              maxWidth: "94vw",
              height: "750px",
              maxHeight: "90vh",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <AeraCopilot
              onSelectScenario={onScenarioChange}
              activeScenario={activeScenario}
              currentSavings={netSavings}
              currentSpend={totalSpend}
              matrixData={matrixData}
              vendorProfiles={vendorProfiles}
              isCustomMode={isCustomMode}
              onClose={() => setIsAiModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
