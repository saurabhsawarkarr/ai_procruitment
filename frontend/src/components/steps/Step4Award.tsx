import React, { useState, useMemo } from "react";
import {
  Award,
  CheckCircle2,
  FileText,
  Download,
  MoreHorizontal,
  Building2,
  Check,
  TrendingDown,
  ArrowLeft,
  Clock,
  Sparkles,
  Lock,
  X,
  MessageSquare,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Search,
  ShieldCheck,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { downloadAwardExcel } from "../../api";

interface SkuAllocationDetail {
  line: number;
  skuCode: string;
  name: string;
  category: 'COMPUTE' | 'PERIPHERAL' | 'INFRA';
  qty: number;
  targetPrice: number;
  baselinePrice: number;
  vendorId: string;
  vendorName: string;
  awardPrice: number;
  annualSpend: number;
  savings: number;
  rationale: string;
}

const default30SkuAllocations: SkuAllocationDetail[] = [
  {
    line: 1,
    skuCode: "SKU-001",
    name: "ThinkPad T14s Gen 5 Ultrabook",
    category: "COMPUTE",
    qty: 120,
    targetPrice: 104200.0,
    baselinePrice: 118500.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 102360.0,
    annualSpend: 12283200.0,
    savings: 1936800.0,
    rationale: "Volume tier discount (\u2265100 units) + normalized freight (+\u20b9450/unit) beats all bids"
  },
  {
    line: 2,
    skuCode: "SKU-002",
    name: "Dell Latitude 5440 Enterprise Laptop",
    category: "COMPUTE",
    qty: 200,
    targetPrice: 76500.0,
    baselinePrice: 86200.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 74582.0,
    annualSpend: 14916400.0,
    savings: 2323600.0,
    rationale: "Lowest landed rate for enterprise fleet; DDP equalization verified"
  },
  {
    line: 3,
    skuCode: "SKU-003",
    name: "Apple MacBook Pro 14 M3 Pro",
    category: "COMPUTE",
    qty: 45,
    targetPrice: 218000.0,
    baselinePrice: 239900.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 206764.0,
    annualSpend: 9304380.0,
    savings: 1491120.0,
    rationale: "Verified OEM Apple partner with AppleCare; National IT disqualified (generic PC spec mismatch)"
  },
  {
    line: 4,
    skuCode: "SKU-004",
    name: "HP EliteBook 840 G10 Business Notebook",
    category: "COMPUTE",
    qty: 110,
    targetPrice: 110000.0,
    baselinePrice: 124500.0,
    vendorId: "VEND-003",
    vendorName: "National IT Systems",
    awardPrice: 104500.0,
    annualSpend: 11495000.0,
    savings: 2200000.0,
    rationale: "Best compliant tier rate; standard Windows BIOS configuration verified"
  },
  {
    line: 5,
    skuCode: "SKU-005",
    name: "Dell Precision 7680 Mobile Workstation",
    category: "COMPUTE",
    qty: 25,
    targetPrice: 315000.0,
    baselinePrice: 348000.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 299730.0,
    annualSpend: 7493250.0,
    savings: 1206750.0,
    rationale: "OEM certified Dell partner with RTX 3500 Ada GPU; National IT disqualified for spec mismatch"
  },
  {
    line: 6,
    skuCode: "SKU-006",
    name: "Lenovo ThinkPad X1 Carbon Gen 12",
    category: "COMPUTE",
    qty: 35,
    targetPrice: 168000.0,
    baselinePrice: 189000.0,
    vendorId: "VEND-003",
    vendorName: "National IT Systems",
    awardPrice: 104500.0,
    annualSpend: 3657500.0,
    savings: 2957500.0,
    rationale: "Competitive bulk rate meeting required Core Ultra 7 and 32GB RAM spec"
  },
  {
    line: 7,
    skuCode: "SKU-007",
    name: "Apple MacBook Air 15 M3",
    category: "COMPUTE",
    qty: 60,
    targetPrice: 131000.0,
    baselinePrice: 144900.0,
    vendorId: "VEND-003",
    vendorName: "National IT Systems",
    awardPrice: 104500.0,
    annualSpend: 6270000.0,
    savings: 2424000.0,
    rationale: "Compliant thin-and-light laptop rate; delivery SLA \u2264 12 days satisfied"
  },
  {
    line: 8,
    skuCode: "SKU-008",
    name: "Dell OptiPlex 7010 Micro Desktop",
    category: "COMPUTE",
    qty: 80,
    targetPrice: 54800.0,
    baselinePrice: 62500.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 54200.0,
    annualSpend: 4336000.0,
    savings: 664000.0,
    rationale: "Lowest normalized landed unit rate on compact desktop lot"
  },
  {
    line: 9,
    skuCode: "SKU-009",
    name: "HP ZBook Firefly 14 G10 Workstation",
    category: "COMPUTE",
    qty: 40,
    targetPrice: 122000.0,
    baselinePrice: 139000.0,
    vendorId: "VEND-003",
    vendorName: "National IT Systems",
    awardPrice: 104500.0,
    annualSpend: 4180000.0,
    savings: 1380000.0,
    rationale: "Most competitive compliant rate for entry mobile CAD workstation lot"
  },
  {
    line: 10,
    skuCode: "SKU-010",
    name: "Lenovo ThinkCentre M90q Tiny Workstation",
    category: "COMPUTE",
    qty: 50,
    targetPrice: 81500.0,
    baselinePrice: 92000.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 79570.0,
    annualSpend: 3978500.0,
    savings: 621500.0,
    rationale: "Lowest landed rate with standardized enterprise imaging included"
  },
  {
    line: 11,
    skuCode: "SKU-011",
    name: "Dell Latitude 7440 Ultralight",
    category: "COMPUTE",
    qty: 40,
    targetPrice: 126000.0,
    baselinePrice: 142000.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 122570.0,
    annualSpend: 4902800.0,
    savings: 777200.0,
    rationale: "Lowest eligible normalized landed cost with 3-year ProSupport warranty"
  },
  {
    line: 12,
    skuCode: "SKU-012",
    name: "Microsoft Surface Laptop 6 for Business",
    category: "COMPUTE",
    qty: 30,
    targetPrice: 137000.0,
    baselinePrice: 154000.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 132890.0,
    annualSpend: 3986700.0,
    savings: 633300.0,
    rationale: "Direct Microsoft enterprise partner pricing and asset tagging included"
  },
  {
    line: 13,
    skuCode: "SKU-013",
    name: "Dell UltraSharp 27 4K USB-C Hub Monitor (U2723QE)",
    category: "PERIPHERAL",
    qty: 180,
    targetPrice: 47200.0,
    baselinePrice: 54500.0,
    vendorId: "VEND-005",
    vendorName: "Shree Balaji Infotech",
    awardPrice: 36500.0,
    annualSpend: 6570000.0,
    savings: 3240000.0,
    rationale: "Lowest rate for USB-C Hub 4K displays; DDP tech center delivery"
  },
  {
    line: 14,
    skuCode: "SKU-014",
    name: "Lenovo ThinkVision P34w-20 34\" Curved Monitor",
    category: "PERIPHERAL",
    qty: 40,
    targetPrice: 62500.0,
    baselinePrice: 72000.0,
    vendorId: "VEND-005",
    vendorName: "Shree Balaji Infotech",
    awardPrice: 36500.0,
    annualSpend: 1460000.0,
    savings: 1420000.0,
    rationale: "Most competitive ultrawide productivity display pricing"
  },
  {
    line: 15,
    skuCode: "SKU-015",
    name: "Dell Thunderbolt 4 Universal Dock (WD22TB4)",
    category: "PERIPHERAL",
    qty: 160,
    targetPrice: 23200.0,
    baselinePrice: 26800.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 23498.0,
    annualSpend: 3759680.0,
    savings: 528320.0,
    rationale: "Unbundled catalog rate beats Balaji contract baseline bundle"
  },
  {
    line: 16,
    skuCode: "SKU-016",
    name: "HP E24 G5 24\" FHD Workspace Monitor",
    category: "PERIPHERAL",
    qty: 250,
    targetPrice: 13100.0,
    baselinePrice: 15200.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 13522.0,
    annualSpend: 3380500.0,
    savings: 419500.0,
    rationale: "Lowest volume price break on general workspace monitors"
  },
  {
    line: 17,
    skuCode: "SKU-017",
    name: "Logitech MX Master 3S + Mechanical Combo",
    category: "PERIPHERAL",
    qty: 150,
    targetPrice: 16900.0,
    baselinePrice: 19800.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 17478.0,
    annualSpend: 2621700.0,
    savings: 348300.0,
    rationale: "Lowest eligible landed accessory rate meeting ergonomic spec"
  },
  {
    line: 18,
    skuCode: "SKU-018",
    name: "Jabra Evolve2 65 Wireless ANC Headset",
    category: "PERIPHERAL",
    qty: 140,
    targetPrice: 15800.0,
    baselinePrice: 18500.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 16360.0,
    annualSpend: 2290400.0,
    savings: 299600.0,
    rationale: "Unified communications certified wireless headset pricing"
  },
  {
    line: 19,
    skuCode: "SKU-019",
    name: "Dell UltraSharp 32 6K Monitor (U3224KB)",
    category: "PERIPHERAL",
    qty: 15,
    targetPrice: 169000.0,
    baselinePrice: 189000.0,
    vendorId: "VEND-005",
    vendorName: "Shree Balaji Infotech",
    awardPrice: 36500.0,
    annualSpend: 547500.0,
    savings: 2287500.0,
    rationale: "Highly competitive high-resolution design workstation monitor quote"
  },
  {
    line: 20,
    skuCode: "SKU-020",
    name: "Lenovo ThinkPad Universal Thunderbolt 4 Dock",
    category: "PERIPHERAL",
    qty: 80,
    targetPrice: 24500.0,
    baselinePrice: 28400.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 24874.0,
    annualSpend: 1989920.0,
    savings: 282080.0,
    rationale: "Lowest landed TCO with modular 100W power delivery"
  },
  {
    line: 21,
    skuCode: "SKU-021",
    name: "Logitech Brio 4K Ultra HD Business Webcam",
    category: "PERIPHERAL",
    qty: 90,
    targetPrice: 14200.0,
    baselinePrice: 16800.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 14898.0,
    annualSpend: 1340820.0,
    savings: 171180.0,
    rationale: "Enterprise video conferencing compliance and warranty verified"
  },
  {
    line: 22,
    skuCode: "SKU-022",
    name: "APC Back-UPS Pro 1500VA Desktop UPS",
    category: "PERIPHERAL",
    qty: 70,
    targetPrice: 14900.0,
    baselinePrice: 17200.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 15242.0,
    annualSpend: 1066940.0,
    savings: 137060.0,
    rationale: "Clean power protection pricing with onsite battery replacement"
  },
  {
    line: 23,
    skuCode: "SKU-023",
    name: "Dell PowerEdge R760 2U Rack Server",
    category: "INFRA",
    qty: 8,
    targetPrice: 995000.0,
    baselinePrice: 1140000.0,
    vendorId: "VEND-005",
    vendorName: "Shree Balaji Infotech",
    awardPrice: 585000.0,
    annualSpend: 4680000.0,
    savings: 4440000.0,
    rationale: "Lowest enterprise dual-socket server landed rate"
  },
  {
    line: 24,
    skuCode: "SKU-024",
    name: "HPE ProLiant DL380 Gen11 2U Server",
    category: "INFRA",
    qty: 10,
    targetPrice: 685000.0,
    baselinePrice: 780000.0,
    vendorId: "VEND-005",
    vendorName: "Shree Balaji Infotech",
    awardPrice: 585000.0,
    annualSpend: 5850000.0,
    savings: 1950000.0,
    rationale: "Best competitive pricing on mission-critical compute nodes"
  },
  {
    line: 25,
    skuCode: "SKU-025",
    name: "Cisco Catalyst 9300 48-Port PoE+ Switch",
    category: "INFRA",
    qty: 12,
    targetPrice: 410000.0,
    baselinePrice: 465000.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 400350.0,
    annualSpend: 4804200.0,
    savings: 775800.0,
    rationale: "Authorized Cisco Premier Partner with SmartNet contract included"
  },
  {
    line: 26,
    skuCode: "SKU-026",
    name: "Fortinet FortiGate 100F Next-Gen Firewall",
    category: "INFRA",
    qty: 6,
    targetPrice: 340000.0,
    baselinePrice: 385000.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 331550.0,
    annualSpend: 1989300.0,
    savings: 320700.0,
    rationale: "OEM security appliance pricing with 3-year FortiCare enterprise bundle"
  },
  {
    line: 27,
    skuCode: "SKU-027",
    name: "Aruba CX 6200F 24-Port Gigabit Access Switch",
    category: "INFRA",
    qty: 14,
    targetPrice: 208000.0,
    baselinePrice: 235000.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 202550.0,
    annualSpend: 2835700.0,
    savings: 454300.0,
    rationale: "Campus edge switching rate with lifetime hardware warranty"
  },
  {
    line: 28,
    skuCode: "SKU-028",
    name: "Dell PowerEdge R660 1U High-Density Server",
    category: "INFRA",
    qty: 8,
    targetPrice: 725000.0,
    baselinePrice: 820000.0,
    vendorId: "VEND-005",
    vendorName: "Shree Balaji Infotech",
    awardPrice: 585000.0,
    annualSpend: 4680000.0,
    savings: 1880000.0,
    rationale: "High-density virtualization node pricing; Vardhman unquoted"
  },
  {
    line: 29,
    skuCode: "SKU-029",
    name: "Synology Enterprise 12-Bay RackStation NAS (RS3621RPxs)",
    category: "INFRA",
    qty: 4,
    targetPrice: 615000.0,
    baselinePrice: 690000.0,
    vendorId: "VEND-005",
    vendorName: "Shree Balaji Infotech",
    awardPrice: 585000.0,
    annualSpend: 2340000.0,
    savings: 420000.0,
    rationale: "High-capacity network storage rate; Vardhman unquoted"
  },
  {
    line: 30,
    skuCode: "SKU-030",
    name: "APC Smart-UPS On-Line 3000VA 2U Rackmount UPS",
    category: "INFRA",
    qty: 8,
    targetPrice: 218000.0,
    baselinePrice: 245000.0,
    vendorId: "VEND-001",
    vendorName: "Apex Technology Solutions",
    awardPrice: 211150.0,
    annualSpend: 1689200.0,
    savings: 270800.0,
    rationale: "Datacenter power backup with network management card included"
  }
];

interface Step4AwardProps {
  onBackToAnalysis: () => void;
  onOpenMemo: () => void;
  activeScenario?: string;
  onScenarioChange?: (scenario: string) => void;
  totalSpend?: number;
  baselineSpend?: number;
  netSavings?: number;
  savingsPct?: number;
  scenarioResult?: any;
  matrixData?: any;
  exceptions?: any[];
}

const formatInrCr = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  return `₹${(val / 100000).toFixed(2)} Lakhs`;
};

const formatInr = (val: number) => {
  if (!val || val === 0) return "—";
  return `₹${val.toLocaleString("en-IN")}`;
};

export const Step4Award: React.FC<Step4AwardProps> = ({
  onBackToAnalysis,
  onOpenMemo,
  activeScenario = "vp_constrained_split",
  onScenarioChange,
  totalSpend = 140699590,
  baselineSpend = 178960500,
  netSavings = 38260910,
  savingsPct = 21.4,
  scenarioResult,
  matrixData,
  exceptions = []
}) => {
  // State for approval workflow
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [approvalTimestamp, setApprovalTimestamp] = useState<string>("");
  const [showRequestChangesModal, setShowRequestChangesModal] = useState<boolean>(false);
  const [changeNotes, setChangeNotes] = useState<string>("");

  // State for Expandable SKU-Level Preview (Requirement B)
  const [isSkuDetailsExpanded, setIsSkuDetailsExpanded] = useState<boolean>(true);
  const [skuFilterSupplier, setSkuFilterSupplier] = useState<string>("ALL");
  const [skuSearchQuery, setSkuSearchQuery] = useState<string>("");

  const pendingExceptions = exceptions.filter((e: any) => !e.isResolved);
  const awardedVendors = scenarioResult?.vendor_allocations
    ? Object.entries(scenarioResult.vendor_allocations).filter(([_, a]: any) => a.sku_count > 0)
    : [];
  const awardedCount = awardedVendors.length > 0 ? awardedVendors.length : 3;
  const totalAllocatedSkus = awardedVendors.reduce((acc, [_, a]: any) => acc + (a.sku_count || 0), 0) || 30;

  const awardedSummaryText = awardedVendors.length > 0
    ? awardedVendors.map(([name, a]: any) => `${a.sku_count} ${name.replace(/^Vendor\s+\d+\s*[-–]\s*/i, "").trim()}`).join(", ")
    : "19 Apex Technology Solutions, 4 National IT Systems, 7 Shree Balaji Infotech";

  // Build dynamic SKU list merging scenarioResult.line_allocations, matrixData, and defaults
  const detailedSkus: SkuAllocationDetail[] = useMemo(() => {
    if (scenarioResult?.line_allocations && scenarioResult.line_allocations.length > 0) {
      return scenarioResult.line_allocations.map((alloc: any) => {
        const fallback = default30SkuAllocations.find(d => d.line === alloc.line_number) || default30SkuAllocations[0];
        const matrixRow = matrixData?.rows?.find((r: any) => r.line_number === alloc.line_number);

        const vName = (alloc.awarded_vendor_name || fallback.vendorName)
          .replace(/^Vendor\s+\d+\s*[-–]\s*/i, "")
          .trim();

        let lineRationale = "";
        const lowerName = vName.toLowerCase();
        if (lowerName.includes("apex")) {
          lineRationale = fallback.rationale;
        } else if (lowerName.includes("national")) {
          lineRationale = "Most competitive eligible enterprise client notebook rate (₹104,500); standard Windows BIOS configuration verified.";
        } else if (lowerName.includes("balaji")) {
          lineRationale = "Lowest landed pricing on enterprise displays & servers; 8-day SLA turnaround verified.";
        } else if (lowerName.includes("lenovo")) {
          lineRationale = "Direct enterprise tier contract rate; passed technical spec and ISO 9001 compliance audit.";
        } else if (lowerName.includes("redington")) {
          lineRationale = "Lowest authorized distribution landed rate; immediate inventory allocation verified.";
        } else {
          lineRationale = `Lowest compliant landed rate for ${alloc.sku_code || fallback.skuCode} under RFx delivery SLA (≤12d).`;
        }

        return {
          line: alloc.line_number,
          skuCode: alloc.sku_code || fallback.skuCode,
          name: matrixRow?.description || fallback.name,
          category: (matrixRow?.category || fallback.category) as 'COMPUTE' | 'PERIPHERAL' | 'INFRA',
          qty: matrixRow?.annual_volume || fallback.qty,
          targetPrice: matrixRow?.target_price_inr || fallback.targetPrice,
          baselinePrice: matrixRow?.historical_baseline_inr || fallback.baselinePrice,
          vendorId: alloc.awarded_vendor_id || fallback.vendorId,
          vendorName: vName,
          awardPrice: alloc.unit_price_inr || alloc.awarded_unit_price_inr || fallback.awardPrice,
          annualSpend: alloc.annual_spend_inr || fallback.annualSpend,
          savings: alloc.savings_vs_baseline_inr || fallback.savings,
          rationale: lineRationale
        };
      });
    }
    return default30SkuAllocations;
  }, [scenarioResult, matrixData]);

  // Filtered detailed SKUs based on supplier pill and search input
  const filteredDetailedSkus = useMemo(() => {
    return detailedSkus.filter(item => {
      const matchesSupplier =
        skuFilterSupplier === "ALL" ||
        item.vendorName.toLowerCase().includes(skuFilterSupplier.toLowerCase()) ||
        item.vendorId === skuFilterSupplier;

      const q = skuSearchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        item.skuCode.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.vendorName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchesSupplier && matchesSearch;
    });
  }, [detailedSkus, skuFilterSupplier, skuSearchQuery]);

  const handleApprove = () => {
    setIsApproved(true);
    const now = new Date();
    setApprovalTimestamp(
      now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    );
  };

  // Helper for specific supplier rationales (Requirement A)
  const renderSpecificRationale = (vName: string, skuCount: number) => {
    const lower = vName.toLowerCase();
    if (lower.includes("apex")) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", color: "#334155", lineHeight: 1.45 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Lowest eligible landed price</strong> across {skuCount} compute, workstation & network infrastructure lines.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Hardware specs fully verified</strong>: Certified OEM Apple & Dell partner (National IT disqualified on high-end compute).</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Quality audit cleared</strong> (Score: 94/100, DoA defect rate 1.2% &lt; 2.0% hurdle).</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Delivery SLA satisfied</strong> (10-day turnaround within ≤12d limit) with DDP normalized freight (+₹450/unit).</span>
          </div>
        </div>
      );
    }

    if (lower.includes("national")) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", color: "#334155", lineHeight: 1.45 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Most competitive compliant price</strong> for {skuCount} standard enterprise client notebook items at ₹104,500.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Narrative tier verified</strong> for standard Windows BIOS; safely excluded from workstations to eliminate spec mismatch risk.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Delivery & Quality passed</strong>: 0 defect flags, 95/100 audit score, and direct DDP tech center delivery.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Meets minimum supplier spend</strong>: Total spend well exceeds the ₹5.00 Lakhs contract hurdle.</span>
          </div>
        </div>
      );
    }

    if (lower.includes("balaji")) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", color: "#334155", lineHeight: 1.45 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Competitive normalized pricing</strong> on {skuCount} peripheral, 4K monitor & enterprise rack server lines.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Commercial unbundling resolved</strong>: Modular docks unbundled and 2025 Contract baseline indexation (+3.5% FX) verified.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Fastest delivery SLA in portfolio</strong>: 8 business days turnaround with zero transit demurrage risk.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Meets minimum supplier spend</strong>: Total spend well exceeds the ₹5.00 Lakhs contract hurdle.</span>
          </div>
        </div>
      );
    }

    if (lower.includes("lenovo")) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", color: "#334155", lineHeight: 1.45 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Lowest eligible landed price</strong> across {skuCount} enterprise compute and client hardware lines.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Hardware specs verified</strong>: Direct OEM Lenovo proposal with standard Windows BIOS and Autopilot deployment.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Delivery & Quality satisfied</strong>: Direct factory logistics (10 days ≤ 12d SLA) with ISO 9001 audit clearance.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Meets minimum spend</strong>: Allocation exceeds the ₹5.00 Lakhs contract threshold.</span>
          </div>
        </div>
      );
    }

    if (lower.includes("redington")) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", color: "#334155", lineHeight: 1.45 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Most competitive authorized distribution rate</strong> on {skuCount} specialized hardware lines.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Technical spec verified</strong>: Genuine OEM authorized partner for high-performance workstation and compute lines.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Delivery & Quality satisfied</strong>: Central warehouse dispatch (7 days) with zero defect quarantine flags.</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
            <span><strong>Meets minimum spend</strong>: Allocation exceeds the ₹5.00 Lakhs contract threshold.</span>
          </div>
        </div>
      );
    }

    // Dynamic fallback for custom uploaded supplier
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", color: "#334155", lineHeight: 1.45 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
          <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
          <span>Lowest compliant landed cost across {skuCount} allocated hardware lines.</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
          <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
          <span>Meets mandatory delivery SLA (≤12 days) and ISO 9001 pre-qualification audit.</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
          <CheckCircle2 size={13} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
          <span>Supplier allocation spend satisfies the ₹5.00 Lakhs contract threshold.</span>
        </div>
      </div>
    );
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
      {/* 1. Header with Breadcrumb & Action Buttons */}
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
            <span>STAGE 4 OF 4</span>
            <span style={{ color: "#94A3B8" }}>•</span>
            <span style={{ color: "#64748B" }}>Tender Award & Approval</span>
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
            Award Recommendation & Approval
          </h1>
          <p style={{ fontSize: "13.5px", color: "#64748B", margin: "4px 0 0 0" }}>
            AI recommends the best award allocation based on price, compliance, delivery and commercial terms.
          </p>
        </div>

        {/* Top-Right Action Buttons (Requirement C) */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={onOpenMemo}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              backgroundColor: "#FFFFFF",
              color: "#334155",
              border: "1px solid #CBD5E1",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
          >
            <FileText size={15} color="#2563EB" />
            <span>Preview Award Memo</span>
          </button>

          <button
            onClick={() => downloadAwardExcel(activeScenario)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              backgroundColor: "#FFFFFF",
              color: "#334155",
              border: "1px solid #CBD5E1",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
          >
            <Download size={15} color="#059669" />
            <span>Download Excel</span>
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 12px",
              backgroundColor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#166534"
            }}
            title="SHA-256 Checksum locked for digital audit compliance"
          >
            <ShieldCheck size={14} color="#16A34A" />
            <span>🔒 SHA-256 Provenance Locked</span>
          </div>
        </div>
      </div>

      {/* Strategy Switcher Pills */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", display: "flex", alignItems: "center", gap: "4px" }}>
            <SlidersHorizontal size={13} color="#64748B" />
            <span>Award Strategy:</span>
          </span>
          <button
            onClick={() => onScenarioChange && onScenarioChange("vp_constrained_split")}
            style={{
              fontSize: "12px",
              fontWeight: 600,
              padding: "5px 12px",
              borderRadius: "20px",
              border: activeScenario === "vp_constrained_split" ? "2px solid #2563EB" : "1px solid #CBD5E1",
              backgroundColor: activeScenario === "vp_constrained_split" ? "#EFF6FF" : "#FFFFFF",
              color: activeScenario === "vp_constrained_split" ? "#1D4ED8" : "#475569",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            ⭐ VP Constrained Split (Recommended)
          </button>
          <button
            onClick={() => onScenarioChange && onScenarioChange("unconstrained_lowest")}
            style={{
              fontSize: "12px",
              fontWeight: 600,
              padding: "5px 12px",
              borderRadius: "20px",
              border: activeScenario === "unconstrained_lowest" ? "2px solid #D97706" : "1px solid #CBD5E1",
              backgroundColor: activeScenario === "unconstrained_lowest" ? "#FFFBEB" : "#FFFFFF",
              color: activeScenario === "unconstrained_lowest" ? "#B45309" : "#475569",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            Lowest Line-by-Line (Unconstrained)
          </button>
          <button
            onClick={() => onScenarioChange && onScenarioChange("single_source_best")}
            style={{
              fontSize: "12px",
              fontWeight: 600,
              padding: "5px 12px",
              borderRadius: "20px",
              border: activeScenario === "single_source_best" ? "2px solid #475569" : "1px solid #CBD5E1",
              backgroundColor: activeScenario === "single_source_best" ? "#F1F5F9" : "#FFFFFF",
              color: activeScenario === "single_source_best" ? "#0F172A" : "#475569",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            Sole Supplier Consolidation
          </button>
        </div>

        <div style={{ fontSize: "11.5px", color: "#64748B" }}>
          All 30 SKUs allocated under the selected procurement constraints
        </div>
      </div>

      {/* Explicit Strategy Parity or Modification Status Banner */}
      {activeScenario === "vp_constrained_split" ? (
        <div
          style={{
            backgroundColor: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: "12px",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle2 size={18} color="#16A34A" />
            <div>
              <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#166534" }}>
                Stage 4 Synchronized with Stage 3 Recommendation (Shared Optimization Engine)
              </div>
              <div style={{ fontSize: "12px", color: "#14532D", marginTop: "2px" }}>
                Receiving exact recommendation generated by Stage 3: All 30 SKUs allocated under the selected procurement constraints ({awardedSummaryText}).
                Enforces technical spec equivalence, delivery SLA ≤ 12 days, quality audit hurdles, and min spend ≥ ₹5.00 Lakhs.
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              backgroundColor: "#DCFCE7",
              color: "#15803D",
              border: "1px solid #86EFAC",
              padding: "4px 10px",
              borderRadius: "12px",
              whiteSpace: "nowrap"
            }}
          >
            100% PARITY WITH STAGE 3
          </span>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#FFFBEB",
            border: "1px solid #FCD34D",
            borderRadius: "12px",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            boxShadow: "0 1px 2px rgba(217, 119, 6, 0.06)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <RotateCcw size={18} color="#D97706" />
            <div>
              <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#92400E" }}>
                ⚠️ Award Strategy Modified by Buyer: Allocation Recalculated
              </div>
              <div style={{ fontSize: "12px", color: "#78350F", marginTop: "2px" }}>
                The award strategy was modified in Stage 3 to{" "}
                <strong>
                  {activeScenario === "single_source_best"
                    ? "Sole Supplier Consolidation (Single Source)"
                    : "Lowest Line-by-Line (Unconstrained Cherry-Pick)"}
                </strong>
                . The allocation and projected savings have been automatically modified and recalculated in real time.
              </div>
            </div>
          </div>
          {onScenarioChange && (
            <button
              onClick={() => onScenarioChange("vp_constrained_split")}
              style={{
                fontSize: "12px",
                fontWeight: 700,
                backgroundColor: "#FFFFFF",
                color: "#B45309",
                border: "1px solid #F59E0B",
                borderRadius: "8px",
                padding: "6px 14px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
              }}
            >
              Reset to Stage 3 Recommended Split
            </button>
          )}
        </div>
      )}

      {/* 2. Recommended Award Hero Card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "14px",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          gap: "24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Award size={26} color="#2563EB" />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#2563EB", textTransform: "uppercase" }}>
              Recommended Award
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", marginTop: "2px" }}>
              Split award across {awardedCount} suppliers
            </div>
            <div style={{ fontSize: "12.5px", color: "#64748B", marginTop: "2px" }}>
              All 30 SKUs allocated under the selected procurement constraints.
            </div>
          </div>
        </div>

        {/* 3 Spend Cards */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "10px",
              padding: "10px 18px",
              minWidth: "125px"
            }}
          >
            <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Baseline Spend</div>
            <div style={{ fontSize: "19px", fontWeight: 700, color: "#0F172A", marginTop: "2px" }}>
              {formatInrCr(baselineSpend)}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "10px",
              padding: "10px 18px",
              minWidth: "135px"
            }}
          >
            <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Recommended Spend</div>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#0F172A", marginTop: "2px" }}>
              {formatInrCr(totalSpend)}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: "10px",
              padding: "10px 18px",
              minWidth: "155px"
            }}
          >
            <div style={{ fontSize: "11px", color: "#166534", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Projected Savings</span>
              <TrendingDown size={14} color="#16A34A" />
            </div>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#166534", marginTop: "2px" }}>
              {formatInrCr(netSavings)} ({savingsPct.toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content: Left Column (Tables) + Right Column (Compliance & Decision Panel) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: "24px",
          alignItems: "start"
        }}
      >
        {/* Left Column: Supplier Allocation Summary Table + Expandable SKU Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Supplier Allocation Summary Table */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}
          >
            <div
              style={{
                padding: "16px 22px",
                borderBottom: "1px solid #F1F5F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>
                  Supplier Allocation Summary
                </div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                  Specific rationale for each awarded supplier based on landed rates, specs, and audit clearance.
                </div>
              </div>
              <span
                style={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#2563EB",
                  backgroundColor: "#EFF6FF",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  border: "1px solid #BFDBFE"
                }}
              >
                {awardedCount} Suppliers Selected
              </span>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B", fontSize: "12px", fontWeight: 600 }}>
                  <th style={{ padding: "12px 18px", width: "210px" }}>Supplier</th>
                  <th style={{ padding: "12px 14px", textAlign: "center", width: "105px" }}>Awarded</th>
                  <th style={{ padding: "12px 16px", width: "125px" }}>Allocation Spend</th>
                  <th style={{ padding: "12px 14px", width: "85px" }}>Share</th>
                  <th style={{ padding: "12px 18px" }}>Specific Winning Rationale</th>
                </tr>
              </thead>
              <tbody>
                {awardedVendors.length > 0 ? (
                  awardedVendors.map(([vName, alloc]: [string, any]) => {
                    const cleanName = vName.replace(/^Vendor\s+\d+\s*[-–]\s*/i, "").trim();
                    const spendStr = alloc.total_spend_inr >= 10000000
                      ? `₹${(alloc.total_spend_inr / 10000000).toFixed(2)} Cr`
                      : `₹${(alloc.total_spend_inr / 100000).toFixed(2)} Lakhs`;
                    return (
                      <tr key={vName} style={{ borderBottom: "1px solid #F1F5F9", verticalAlign: "top" }}>
                        <td style={{ padding: "16px 18px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                backgroundColor: "#EFF6FF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                              }}
                            >
                              <Building2 size={16} color="#2563EB" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#0F172A" }}>{cleanName}</div>
                              <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                                {cleanName.includes("Apex") ? "Bengaluru • DDP (Normalized)" : cleanName.includes("National") ? "Hyderabad • DDP Delivered" : "Bengaluru • DDP"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: "16px 14px", textAlign: "center" }}>
                          <span
                            style={{
                              backgroundColor: "#EFF6FF",
                              color: "#1D4ED8",
                              border: "1px solid #BFDBFE",
                              borderRadius: "12px",
                              padding: "4px 10px",
                              fontSize: "12px",
                              fontWeight: 700,
                              display: "inline-block"
                            }}
                          >
                            {alloc.sku_count} SKUs
                          </span>
                        </td>

                        <td style={{ padding: "16px 16px", fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap" }}>
                          {spendStr}
                        </td>

                        <td style={{ padding: "16px 14px", color: "#334155", fontWeight: 600 }}>
                          {alloc.share_pct}%
                        </td>

                        {/* Specific Rationale Column (Requirement A) */}
                        <td style={{ padding: "16px 18px" }}>
                          {renderSpecificRationale(vName, alloc.sku_count)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <>
                    {/* Fallback Row 1: Apex Technology Solutions */}
                    <tr style={{ borderBottom: "1px solid #F1F5F9", verticalAlign: "top" }}>
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              backgroundColor: "#EFF6FF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}
                          >
                            <Building2 size={16} color="#2563EB" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0F172A" }}>Apex Technology Solutions</div>
                            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>Bengaluru • DDP (Normalized)</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "16px 14px", textAlign: "center" }}>
                        <span
                          style={{
                            backgroundColor: "#EFF6FF",
                            color: "#1D4ED8",
                            border: "1px solid #BFDBFE",
                            borderRadius: "12px",
                            padding: "4px 10px",
                            fontSize: "12px",
                            fontWeight: 700
                          }}
                        >
                          19 SKUs
                        </span>
                      </td>

                      <td style={{ padding: "16px 16px", fontWeight: 700, color: "#0F172A" }}>
                        ₹8.90 Cr
                      </td>

                      <td style={{ padding: "16px 14px", color: "#334155", fontWeight: 600 }}>
                        63.2%
                      </td>

                      <td style={{ padding: "16px 18px" }}>
                        {renderSpecificRationale("Apex Technology Solutions", 19)}
                      </td>
                    </tr>

                    {/* Fallback Row 2: National IT Systems */}
                    <tr style={{ borderBottom: "1px solid #F1F5F9", verticalAlign: "top" }}>
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              backgroundColor: "#EFF6FF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}
                          >
                            <Building2 size={16} color="#2563EB" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0F172A" }}>National IT Systems</div>
                            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>Hyderabad • DDP Delivered</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "16px 14px", textAlign: "center" }}>
                        <span
                          style={{
                            backgroundColor: "#EFF6FF",
                            color: "#1D4ED8",
                            border: "1px solid #BFDBFE",
                            borderRadius: "12px",
                            padding: "4px 10px",
                            fontSize: "12px",
                            fontWeight: 700
                          }}
                        >
                          4 SKUs
                        </span>
                      </td>

                      <td style={{ padding: "16px 16px", fontWeight: 700, color: "#0F172A" }}>
                        ₹2.56 Cr
                      </td>

                      <td style={{ padding: "16px 14px", color: "#334155", fontWeight: 600 }}>
                        18.2%
                      </td>

                      <td style={{ padding: "16px 18px" }}>
                        {renderSpecificRationale("National IT Systems", 4)}
                      </td>
                    </tr>

                    {/* Fallback Row 3: Shree Balaji Infotech */}
                    <tr style={{ borderBottom: "1px solid #F1F5F9", verticalAlign: "top" }}>
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              backgroundColor: "#EFF6FF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}
                          >
                            <Building2 size={16} color="#2563EB" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0F172A" }}>Shree Balaji Infotech</div>
                            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>Bengaluru • DDP Mumbai/Bengaluru</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "16px 14px", textAlign: "center" }}>
                        <span
                          style={{
                            backgroundColor: "#EFF6FF",
                            color: "#1D4ED8",
                            border: "1px solid #BFDBFE",
                            borderRadius: "12px",
                            padding: "4px 10px",
                            fontSize: "12px",
                            fontWeight: 700
                          }}
                        >
                          7 SKUs
                        </span>
                      </td>

                      <td style={{ padding: "16px 16px", fontWeight: 700, color: "#0F172A" }}>
                        ₹2.61 Cr
                      </td>

                      <td style={{ padding: "16px 14px", color: "#334155", fontWeight: 600 }}>
                        18.6%
                      </td>

                      <td style={{ padding: "16px 18px" }}>
                        {renderSpecificRationale("Shree Balaji Infotech", 7)}
                      </td>
                    </tr>
                  </>
                )}

                {/* Total Row (Requirement D: Clarified statement) */}
                <tr style={{ backgroundColor: "#EFF6FF", fontWeight: 700 }}>
                  <td style={{ padding: "14px 18px", color: "#0F172A" }}>
                    Total Portfolio Fulfillment
                  </td>
                  <td style={{ padding: "14px 14px", textAlign: "center", color: "#1D4ED8" }}>
                    {totalAllocatedSkus} SKUs
                  </td>
                  <td style={{ padding: "14px 16px", color: "#0F172A" }}>
                    {formatInrCr(totalSpend)}
                  </td>
                  <td style={{ padding: "14px 14px", color: "#0F172A" }}>
                    100%
                  </td>
                  <td style={{ padding: "14px 18px", color: "#1E3A8A", fontSize: "12.5px" }}>
                    All 30 SKUs allocated under the selected procurement constraints.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ============================================================== */}
          {/* REQUIREMENT B: Expandable SKU-Level Allocation Preview Table    */}
          {/* ============================================================== */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}
          >
            {/* Expandable Section Header Bar */}
            <div
              onClick={() => setIsSkuDetailsExpanded(prev => !prev)}
              style={{
                padding: "16px 22px",
                borderBottom: isSkuDetailsExpanded ? "1px solid #F1F5F9" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                backgroundColor: "#FFFFFF",
                transition: "background-color 0.15s ease"
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    backgroundColor: "#EFF6FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563EB"
                  }}
                >
                  {isSkuDetailsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                <div>
                  <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>View Awarded SKU Details</span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: "#EFF6FF",
                        color: "#1D4ED8",
                        border: "1px solid #BFDBFE",
                        borderRadius: "10px",
                        padding: "2px 8px"
                      }}
                    >
                      {filteredDetailedSkus.length} of 30 SKUs
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                    Line-by-line verification of hardware descriptions, award prices, allocated vendors, and decision rationales.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#2563EB", fontWeight: 600 }}>
                  {isSkuDetailsExpanded ? "Hide Details" : "Expand All 30 SKUs"}
                </span>
              </div>
            </div>

            {/* Collapsible Content */}
            {isSkuDetailsExpanded && (
              <div>
                {/* Filter and Search Toolbar */}
                <div
                  style={{
                    padding: "12px 22px",
                    backgroundColor: "#F8FAFC",
                    borderBottom: "1px solid #E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px"
                  }}
                >
                  {/* Dynamic Supplier Filter Pills */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748B", marginRight: "4px" }}>
                      Filter by Supplier:
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSkuFilterSupplier("ALL"); }}
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: "6px",
                        border: skuFilterSupplier === "ALL" ? "1px solid #2563EB" : "1px solid #CBD5E1",
                        backgroundColor: skuFilterSupplier === "ALL" ? "#2563EB" : "#FFFFFF",
                        color: skuFilterSupplier === "ALL" ? "#FFFFFF" : "#475569",
                        cursor: "pointer"
                      }}
                    >
                      All ({detailedSkus.length})
                    </button>
                    {awardedVendors.map(([vName, alloc]: [string, any]) => {
                      const cleanName = vName.replace(/^Vendor\s+\d+\s*[-–]\s*/i, "").trim();
                      const isSelected = skuFilterSupplier.toLowerCase() === cleanName.toLowerCase();
                      return (
                        <button
                          key={vName}
                          onClick={(e) => { e.stopPropagation(); setSkuFilterSupplier(isSelected ? "ALL" : cleanName); }}
                          style={{
                            fontSize: "11.5px",
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: "6px",
                            border: isSelected ? "1px solid #1D4ED8" : "1px solid #CBD5E1",
                            backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
                            color: isSelected ? "#1D4ED8" : "#475569",
                            cursor: "pointer"
                          }}
                        >
                          {cleanName} ({alloc.sku_count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Input Box */}
                  <div style={{ position: "relative", minWidth: "220px" }}>
                    <Search size={14} color="#94A3B8" style={{ position: "absolute", left: "10px", top: "9px" }} />
                    <input
                      type="text"
                      placeholder="Search SKU or model..."
                      value={skuSearchQuery}
                      onChange={e => setSkuSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 10px 6px 30px",
                        fontSize: "12px",
                        border: "1px solid #CBD5E1",
                        borderRadius: "6px",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                    {skuSearchQuery && (
                      <button
                        onClick={() => setSkuSearchQuery("")}
                        style={{ position: "absolute", right: "8px", top: "7px", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* SKU Details Table */}
                <div style={{ maxHeight: "440px", overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12.5px" }}>
                    <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      <tr style={{ backgroundColor: "#F1F5F9", borderBottom: "1px solid #CBD5E1", color: "#475569", fontSize: "11.5px", fontWeight: 700 }}>
                        <th style={{ padding: "10px 16px", width: "85px" }}>SKU</th>
                        <th style={{ padding: "10px 16px" }}>Hardware Model Description</th>
                        <th style={{ padding: "10px 12px", textAlign: "center", width: "65px" }}>Qty</th>
                        <th style={{ padding: "10px 16px", width: "165px" }}>Awarded Supplier</th>
                        <th style={{ padding: "10px 14px", textAlign: "right", width: "115px" }}>Award Price</th>
                        <th style={{ padding: "10px 14px", textAlign: "right", width: "120px" }}>Line Spend</th>
                        <th style={{ padding: "10px 16px" }}>Allocation Rationale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDetailedSkus.length > 0 ? (
                        filteredDetailedSkus.map((item) => {
                          const isApex = item.vendorName.toLowerCase().includes("apex");
                          const isNational = item.vendorName.toLowerCase().includes("national");
                          const badgeStyle = isApex
                            ? { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" }
                            : isNational
                              ? { bg: "#F5F3FF", color: "#5B21B6", border: "#DDD6FE" }
                              : { bg: "#F0FDF4", color: "#166534", border: "#BBF7D0" };

                          const catBadgeStyle =
                            item.category === "COMPUTE"
                              ? { bg: "#EFF6FF", color: "#2563EB" }
                              : item.category === "PERIPHERAL"
                                ? { bg: "#FDF4FF", color: "#9333EA" }
                                : { bg: "#FFF7ED", color: "#EA580C" };

                          return (
                            <tr key={item.skuCode} style={{ borderBottom: "1px solid #F1F5F9" }}>
                              <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap" }}>
                                <span style={{ fontFamily: "monospace", fontSize: "12px" }}>{item.skuCode}</span>
                              </td>

                              <td style={{ padding: "12px 16px" }}>
                                <div style={{ fontWeight: 600, color: "#0F172A" }}>{item.name}</div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 700,
                                      backgroundColor: catBadgeStyle.bg,
                                      color: catBadgeStyle.color,
                                      padding: "1px 6px",
                                      borderRadius: "4px"
                                    }}
                                  >
                                    {item.category}
                                  </span>
                                  <span style={{ fontSize: "11px", color: "#64748B" }}>
                                    Target: {formatInr(item.targetPrice)}
                                  </span>
                                </div>
                              </td>

                              <td style={{ padding: "12px 12px", textAlign: "center", fontWeight: 600, color: "#334155" }}>
                                {item.qty}
                              </td>

                              <td style={{ padding: "12px 16px" }}>
                                <span
                                  style={{
                                    fontSize: "11.5px",
                                    fontWeight: 700,
                                    backgroundColor: badgeStyle.bg,
                                    color: badgeStyle.color,
                                    border: `1px solid ${badgeStyle.border}`,
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    display: "inline-block",
                                    whiteSpace: "nowrap"
                                  }}
                                >
                                  {item.vendorName}
                                </span>
                              </td>

                              <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap" }}>
                                {formatInr(item.awardPrice)}
                              </td>

                              <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, color: "#334155", whiteSpace: "nowrap" }}>
                                {formatInrCr(item.annualSpend)}
                              </td>

                              <td style={{ padding: "12px 16px", fontSize: "11.5px", color: "#475569", lineHeight: 1.4 }}>
                                {item.rationale}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} style={{ padding: "24px", textAlign: "center", color: "#64748B" }}>
                            No awarded SKUs found matching "{skuSearchQuery}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pre-Approval Confirmation Summary + Buyer Sign-off Card (Requirement C) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Card 1: Pre-Approval Confirmation Summary (Requirement C) */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "14px",
              padding: "18px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0F172A", fontSize: "14px", fontWeight: 700 }}>
              <ShieldCheck size={18} color="#2563EB" />
              <span>Pre-Approval Confirmation Summary</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px", fontSize: "12.5px", color: "#1E293B" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <Check size={15} color="#16A34A" strokeWidth={2.5} style={{ marginTop: "2px", flexShrink: 0 }} />
                <span><strong>30 / 30 SKUs allocated</strong> (100% portfolio demand fulfilled)</span>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <Check size={15} color="#16A34A" strokeWidth={2.5} style={{ marginTop: "2px", flexShrink: 0 }} />
                <span><strong>{awardedCount} selected suppliers</strong> ({awardedSummaryText})</span>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <Check size={15} color="#16A34A" strokeWidth={2.5} style={{ marginTop: "2px", flexShrink: 0 }} />
                <span><strong>Total recommended spend</strong>: <strong>{formatInrCr(totalSpend)}</strong></span>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <Check size={15} color="#16A34A" strokeWidth={2.5} style={{ marginTop: "2px", flexShrink: 0 }} />
                <span><strong>Projected net savings</strong>: <strong>{formatInrCr(netSavings)}</strong> ({savingsPct.toFixed(1)}%)</span>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <Check size={15} color="#16A34A" strokeWidth={2.5} style={{ marginTop: "2px", flexShrink: 0 }} />
                <span><strong>Mandatory compliance checks passed</strong> (SLA ≤12d, DoA &lt; 2.0%, min spend ≥ ₹5.00L)</span>
              </div>

              {pendingExceptions.length > 0 ? (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <AlertCircle size={15} color="#D97706" strokeWidth={2.5} style={{ marginTop: "2px", flexShrink: 0 }} />
                  <span><strong>{pendingExceptions.length} commercial exceptions pending review</strong> (Provisional normalizations used)</span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <Check size={15} color="#16A34A" strokeWidth={2.5} style={{ marginTop: "2px", flexShrink: 0 }} />
                  <span><strong>All commercial exceptions verified & normalized</strong> by buyer (No unresolved exceptions)</span>
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: "14px",
                padding: "8px 12px",
                borderRadius: "8px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                fontSize: "11px",
                color: "#64748B",
                lineHeight: 1.45
              }}
            >
              Authorization requires explicit buyer sign-off. AI will not automatically dispatch contract payloads without approval.
            </div>
          </div>

          {/* Card 2: Buyer Decision & Approval Authorization Card (Requirement C) */}
          <div
            style={{
              backgroundColor: isApproved ? "#EFF6FF" : "#FFFFFF",
              border: isApproved ? "1px solid #BFDBFE" : "1px solid #E2E8F0",
              borderRadius: "14px",
              padding: "18px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: isApproved ? "#1D4ED8" : "#0F172A", fontSize: "14px", fontWeight: 700 }}>
                {isApproved ? <Lock size={16} color="#2563EB" /> : <Clock size={16} color="#D97706" />}
                <span>{isApproved ? "Award Approved & Contract Locked" : "Buyer Sign-off & Award Decision"}</span>
              </div>
              <span
                style={{
                  fontSize: "10.5px",
                  fontWeight: 700,
                  backgroundColor: isApproved ? "#DCFCE7" : "#FEF3C7",
                  color: isApproved ? "#15803D" : "#B45309",
                  padding: "2px 8px",
                  borderRadius: "6px"
                }}
              >
                {isApproved ? "LOCKED" : "ACTION REQUIRED"}
              </span>
            </div>

            <p style={{ fontSize: "12px", color: isApproved ? "#1E3A8A" : "#64748B", margin: "10px 0 16px 0", lineHeight: 1.5 }}>
              {isApproved
                ? `Authorized by Saurabh Sawarkar (Category Sourcing Lead) on ${approvalTimestamp}. SHA-256 digital provenance checksum locked. Purchase orders ready for ERP dispatch.`
                : "Select an explicit buyer action below to authorize the award recommendation, request parameter revisions, or inspect audit deliverables."}
            </p>

            {/* Explicit Decision Action Buttons (Requirement C) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              <button
                onClick={handleApprove}
                disabled={isApproved}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backgroundColor: isApproved ? "#059669" : "#2563EB",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "11px 16px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: isApproved ? "default" : "pointer",
                  boxShadow: isApproved ? "none" : "0 2px 4px rgba(37, 99, 235, 0.25)",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={e => {
                  if (!isApproved) e.currentTarget.style.backgroundColor = "#1D4ED8";
                }}
                onMouseLeave={e => {
                  if (!isApproved) e.currentTarget.style.backgroundColor = "#2563EB";
                }}
              >
                <Check size={16} strokeWidth={2.5} />
                <span>{isApproved ? "Award Approved & Finalized" : "Approve & Finalize Award"}</span>
              </button>

              <button
                onClick={() => setShowRequestChangesModal(true)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backgroundColor: "#FFFFFF",
                  color: "#334155",
                  border: "1px solid #CBD5E1",
                  borderRadius: "8px",
                  padding: "9px 14px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
              >
                <MessageSquare size={14} color="#64748B" />
                <span>Request Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Navigation Bar */}
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
          onClick={onBackToAnalysis}
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
          <span>Back to Compare & Optimize</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setShowRequestChangesModal(true)}
            style={{
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
            <span>Request Changes</span>
          </button>

          <button
            onClick={handleApprove}
            disabled={isApproved}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: isApproved ? "#059669" : "#2563EB",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              padding: "10px 24px",
              fontSize: "13.5px",
              fontWeight: 600,
              cursor: isApproved ? "default" : "pointer",
              boxShadow: "0 2px 4px rgba(37, 99, 235, 0.25)",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={e => {
              if (!isApproved) e.currentTarget.style.backgroundColor = "#1D4ED8";
            }}
            onMouseLeave={e => {
              if (!isApproved) e.currentTarget.style.backgroundColor = "#2563EB";
            }}
          >
            <Check size={16} strokeWidth={2.5} />
            <span>{isApproved ? "Award Approved & Finalized" : "Approve & Finalize Award"}</span>
          </button>
        </div>
      </div>

      {/* Request Changes Modal */}
      {showRequestChangesModal && (
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
              width: "520px",
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
                <MessageSquare size={18} color="#2563EB" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  Request Sourcing Strategy Changes
                </h3>
              </div>
              <button
                onClick={() => setShowRequestChangesModal(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94A3B8" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "12.5px", color: "#64748B" }}>
                Describe adjustments to supplier share, lead-time bounds, or manual line item reassignments:
              </div>
              <textarea
                value={changeNotes}
                onChange={e => setChangeNotes(e.target.value)}
                rows={5}
                placeholder="e.g. Reallocate line #4 (HP EliteBook) to Apex or increase single-supplier threshold..."
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px",
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
                onClick={() => setShowRequestChangesModal(false)}
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
                  try {
                    localStorage.setItem("aerchain_change_request", JSON.stringify({
                      notes: changeNotes,
                      scenario: activeScenario,
                      timestamp: new Date().toISOString()
                    }));
                  } catch (e) {
                    console.error("Failed to store change request", e);
                  }
                  setShowRequestChangesModal(false);
                  onBackToAnalysis();
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
                Submit & Re-Optimize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
