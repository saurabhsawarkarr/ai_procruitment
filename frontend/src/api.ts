const getApiBase = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== "undefined") {
    // If running in Vite local dev server (port 5173/5174/3000), talk to local FastAPI port 8000
    if (window.location.port === "5173" || window.location.port === "5174" || window.location.port === "3000") {
      return `http://${window.location.hostname}:8000`;
    }
    // In production or when served directly from FastAPI / public tunnel, use same origin
    return "";
  }
  return "http://localhost:8000";
};

const API_BASE = getApiBase();

export async function fetchQuoteMatrix() {
  try {
    const res = await fetch(`${API_BASE}/api/rfx/matrix`);
    if (!res.ok) throw new Error("Backend response error");
    return await res.json();
  } catch (err) {
    console.warn("FastAPI offline or loading, using internal cached state:", err);
    return null;
  }
}

export async function fetchVendorProfiles() {
  try {
    const res = await fetch(`${API_BASE}/api/rfx/vendors`);
    if (!res.ok) throw new Error("Backend response error");
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function solveScenario(params: {
  scenario_type: string;
  require_quality_audit?: boolean;
  prefer_delivered_ddp?: boolean;
  max_lead_time_days?: number;
  min_vendor_spend_inr?: number;
  excluded_vendor_ids?: string[];
}) {
  try {
    const res = await fetch(`${API_BASE}/api/scenarios/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Scenario optimization failed");
    return await res.json();
  } catch (err) {
    console.error("Error solving scenario via FastAPI:", err);
    return null;
  }
}

export async function fetchQuarantineItems() {
  try {
    const res = await fetch(`${API_BASE}/api/rfx/quarantine`);
    if (!res.ok) throw new Error("Quarantine fetch failed");
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchAwardMemo(scenario: string = "vp_constrained_split") {
  try {
    const res = await fetch(`${API_BASE}/api/export/memo?scenario=${scenario}`);
    if (!res.ok) throw new Error("Memo fetch failed");
    return await res.text();
  } catch (err) {
    return null;
  }
}

export function downloadAwardExcel(scenario: string = "vp_constrained_split") {
  window.open(`${API_BASE}/api/export/excel?scenario=${scenario}`, "_blank");
}

export async function sendChatMessageToAera(message: string, activeScenario: string) {
  try {
    const res = await fetch(`${API_BASE}/api/aera/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, active_scenario: activeScenario }),
    });
    if (!res.ok) throw new Error("Aera chat API error");
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchSampleQuestions() {
  try {
    const res = await fetch(`${API_BASE}/api/aera/sample-questions`);
    if (!res.ok) throw new Error("Failed to fetch sample questions");
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchIngestionStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/ingestion/status`);
    if (!res.ok) throw new Error("Ingestion status fetch failed");
    return await res.json();
  } catch (err) {
    return null;
  }
}

export function downloadSampleBenchmarkPack() {
  window.open(`${API_BASE}/api/ingestion/download-sample-pack`, "_blank");
}

export function download10FormatsPack() {
  window.open(`${API_BASE}/api/ingestion/download-10-formats-pack`, "_blank");
}

export function downloadSampleFile(filename: string) {
  window.open(`${API_BASE}/api/ingestion/download-sample/${encodeURIComponent(filename)}`, "_blank");
}

export async function fetchSampleFormatsList() {
  try {
    const res = await fetch(`${API_BASE}/api/ingestion/sample-formats-list`);
    if (!res.ok) throw new Error("Failed to fetch sample formats list");
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function resetToBenchmarkDefaults() {
  try {
    const res = await fetch(`${API_BASE}/api/ingestion/reset`, { method: "POST" });
    if (!res.ok) throw new Error("Reset failed");
    return await res.json();
  } catch (err) {
    console.error("Reset error:", err);
    return null;
  }
}

export async function uploadBatchFiles(files: File[]) {
  const formData = new FormData();
  files.forEach(f => formData.append("files", f));
  try {
    const res = await fetch(`${API_BASE}/api/ingestion/upload-batch`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Batch upload failed");
    return await res.json();
  } catch (err) {
    console.error("Batch upload error:", err);
    return null;
  }
}

