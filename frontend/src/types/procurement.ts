export interface SupplierRow {
  id: string;
  name: string;
  file: string;
  fileType: "pdf" | "xlsx" | "docx" | "jpg" | "eml" | "csv" | "json";
  itemsExtracted: string;
  status: "Processed" | "Processing" | "Needs review";
  incoterms: string;
  paymentTerms: string;
  notes: string;
  flagType?: "success" | "warning" | "info";
}

export type ActionChoice = "confirm" | "edit" | "accept" | "clarify";

export type ExceptionStatusBadge =
  | "Pending review"
  | "Finding confirmed"
  | "Deviation accepted"
  | "Clarification requested"
  | "Resolved"
  | "Non-compliant";

export interface DestinationFreightBreakdown {
  destination: string;
  distanceKm: number;
  allocationQty: number;
  freightPerUnit: number;
  baseRate: number;
  rebatePerUnit: number;
  landedPricePerUnit: number;
}

export interface SourceCoordinates {
  sourceFile: string;
  sheet?: string;
  row?: number | string;
  column?: string;
  cell?: string;
  page?: number | string;
  clause?: string;
}

export interface ExceptionData {
  id: string;
  exceptionNumber: number;
  supplierName: string;
  category: string;
  iconType: "terms" | "bundle" | "missing" | "delivery" | "warranty" | "tier";
  sourceTag: string;
  sourceDocName: string;
  sourceCoordinates?: SourceCoordinates;
  statusBadge: ExceptionStatusBadge;
  statusColor: string;
  whatWasFound: string[];
  aiInterpretation: string;
  aiReasoningPoints?: string[];
  normalizationAssumptions?: string[];
  destinationFreight?: DestinationFreightBreakdown[];
  blendedLandedPrice?: string;
  scenarioA: {
    title: string;
    subtitle: string;
    rows: { label: string; value: string; color?: string }[];
    landedPrice: string;
  };
  scenarioB: {
    title: string;
    subtitle: string;
    rows: { label: string; value: string; color?: string }[];
    landedPrice: string;
  };
  keyTakeaway: string;
  selectedAction: ActionChoice;
  isResolved: boolean;
}
