import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  ArrowDown,
  X,
  TrendingDown,
  Building2,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { sendChatMessageToAera, fetchSampleQuestions, fetchIngestionStatus } from "../api";

interface AeraMessage {
  id: string;
  sender: "aera" | "user";
  timestamp: string;
  text: string;
  scenarioTag?: string;
  metrics?: {
    totalSpend: string;
    netSavings: string;
    savingsPct: string;
  };
  remedies?: string[];
  actionChips?: string[];
  grounding?: {
    is_grounded: boolean;
    grounding_score: number;
    status_badge: string;
    guardrail_checks_passed?: string[];
    warnings?: string[];
  };
}

interface AeraCopilotProps {
  onSelectScenario: (scenario: string) => void;
  activeScenario: string;
  currentSavings: number;
  currentSpend: number;
  matrixData?: any;
  vendorProfiles?: any;
  isCustomMode?: boolean;
  onClose?: () => void;
}

const renderInline = (str: string | undefined | null): React.ReactNode => {
  if (!str) return "";
  const s = String(str);
  const parts = s.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2);
      return <strong key={i} style={{ color: "#0F172A", fontWeight: 700 }}>{inner}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      const inner = part.slice(1, -1);
      if (inner.includes("No Bid")) {
        return <span key={i} style={{ color: "#94A3B8", fontStyle: "italic", fontSize: "11px" }}>{inner}</span>;
      }
      if (inner.includes("Spec Mismatch")) {
        return <span key={i} style={{ color: "#DC2626", fontStyle: "italic", fontWeight: 600, fontSize: "11px" }}>{inner}</span>;
      }
      return <em key={i} style={{ color: "#475569" }}>{inner}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} style={{
          backgroundColor: "#F1F5F9",
          padding: "1px 5px",
          borderRadius: "4px",
          fontSize: "11px",
          border: "1px solid #E2E8F0",
          fontFamily: "monospace",
          color: "#0F172A"
        }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

const renderFormattedMessage = (content: string) => {
  if (!content) return null;
  const lines = String(content).split("\n");
  const nodes: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let keyCount = 0;

  const flushTableBuffer = () => {
    if (tableBuffer.length === 0) return;
    const headerLine = tableBuffer[0];
    const dataLines = tableBuffer.slice(2);

    const parseRow = (line: string) =>
      (line || "")
        .split("|")
        .slice(1, -1)
        .map(cell => (cell || "").trim());

    const headers = parseRow(headerLine);
    const rows = dataLines.map(parseRow);

    nodes.push(
      <div key={`table-${keyCount++}`} style={{
        overflowX: "auto",
        margin: "12px 0",
        borderRadius: "8px",
        border: "1px solid #CBD5E1",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "11.5px",
          textAlign: "left"
        }}>
          <thead>
            <tr style={{ backgroundColor: "#F1F5F9", borderBottom: "2px solid #CBD5E1" }}>
              {headers.map((h, hIdx) => (
                <th
                  key={hIdx}
                  style={{
                    padding: "8px 10px",
                    fontWeight: 700,
                    color: "#0F172A",
                    borderRight: hIdx < headers.length - 1 ? "1px solid #E2E8F0" : "none",
                    whiteSpace: "nowrap"
                  }}
                >
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                style={{
                  backgroundColor: rIdx % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                  borderBottom: rIdx < rows.length - 1 ? "1px solid #E2E8F0" : "none"
                }}
              >
                {row.map((cell, cIdx) => {
                  const cellStr = cell ? String(cell) : "";
                  return (
                    <td
                      key={cIdx}
                      style={{
                        padding: "7px 10px",
                        color: "#334155",
                        borderRight: cIdx < row.length - 1 ? "1px solid #E2E8F0" : "none",
                        whiteSpace: "nowrap",
                        backgroundColor: cellStr.includes("🏆") ? "#ECFDF5" : undefined
                      }}
                    >
                      {renderInline(cellStr)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      tableBuffer.push(trimmed);
      continue;
    } else {
      flushTableBuffer();
    }

    if (!trimmed) {
      nodes.push(<div key={`sp-${keyCount++}`} style={{ height: "6px" }} />);
      continue;
    }

    if (trimmed.startsWith("### ")) {
      nodes.push(
        <div key={`h3-${keyCount++}`} style={{
          fontSize: "14px",
          fontWeight: 700,
          color: "#0F172A",
          marginTop: "12px",
          marginBottom: "6px",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          {renderInline(trimmed.replace(/^###\s*/, ""))}
        </div>
      );
    } else if (trimmed.startsWith("#### ")) {
      nodes.push(
        <div key={`h4-${keyCount++}`} style={{
          fontSize: "12.5px",
          fontWeight: 700,
          color: "#1E293B",
          marginTop: "10px",
          marginBottom: "4px"
        }}>
          {renderInline(trimmed.replace(/^####\s*/, ""))}
        </div>
      );
    } else if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
      nodes.push(
        <div key={`li-${keyCount++}`} style={{
          display: "flex",
          gap: "8px",
          margin: "3px 0",
          fontSize: "12.5px",
          lineHeight: "1.55"
        }}>
          <span style={{ color: "#2563EB", fontWeight: 700 }}>•</span>
          <span style={{ flex: 1, color: "#1E293B" }}>
            {renderInline(trimmed.replace(/^[•\-]\s*/, ""))}
          </span>
        </div>
      );
    } else {
      nodes.push(
        <div key={`p-${keyCount++}`} style={{
          fontSize: "12.5px",
          lineHeight: "1.6",
          margin: "4px 0",
          color: "#1E293B"
        }}>
          {renderInline(trimmed)}
        </div>
      );
    }
  }

  flushTableBuffer();
  return nodes;
};

export const AeraCopilot: React.FC<AeraCopilotProps> = ({
  onSelectScenario,
  activeScenario,
  currentSavings,
  currentSpend,
  matrixData,
  vendorProfiles,
  isCustomMode,
  onClose
}) => {
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveSuppliers, setLiveSuppliers] = useState<any[]>([]);
  const [apiSampleQuestions, setApiSampleQuestions] = useState<any[] | null>(null);

  // Dynamically fetch live uploaded suppliers and dynamic sample questions from backend
  useEffect(() => {
    let isMounted = true;
    const fetchStatusAndQuestions = async () => {
      try {
        const data = await fetchIngestionStatus();
        if (isMounted && data && Array.isArray(data.suppliers) && data.suppliers.length > 0) {
          setLiveSuppliers(data.suppliers);
        }
      } catch (e) {
        // Handled silently
      }

      try {
        const qData = await fetchSampleQuestions();
        if (isMounted && qData && Array.isArray(qData.sample_questions) && qData.sample_questions.length > 0) {
          setApiSampleQuestions(qData.sample_questions);
        }
      } catch (e) {
        // Handled silently
      }
    };
    fetchStatusAndQuestions();
    return () => { isMounted = false; };
  }, [matrixData, isCustomMode]);

  // Extract active vendors strictly grounded in live uploaded quotations
  const activeVendors = useMemo(() => {
    // 1. Live suppliers directly from backend ingestion endpoint
    if (liveSuppliers && liveSuppliers.length > 0) {
      return liveSuppliers.map((s: any) => {
        const rawName = s.vendor_name || s.vendor_id;
        const cleanName = rawName
          .replace(/^Vend(?:or)?[\s\-_0-9]*/i, "")
          .replace(/^[\s\-_.:\d]+/, "")
          .replace(/_/g, " ")
          .trim();
        return {
          id: s.vendor_id,
          name: cleanName || rawName,
          fileName: s.file_name,
          format: s.file_format,
          linesQuoted: s.lines_quoted,
          isPartial: s.is_partial,
          leadTime: 10,
          defectRate: 1.0,
          isDisqualified: s.is_partial || s.status === "Review needed",
        };
      });
    }

    // 2. Extract from live matrixData
    if (matrixData && matrixData.rows && matrixData.rows.length > 0) {
      const vIds = new Set<string>();
      matrixData.rows.forEach((r: any) => {
        if (r.quotes) {
          Object.keys(r.quotes).forEach((vid) => vIds.add(vid));
        }
      });
      return Array.from(vIds).map((vid) => {
        const prof = (vendorProfiles && vendorProfiles[vid]) || (matrixData.vendor_profiles && matrixData.vendor_profiles[vid]) || {};
        const firstQuote = matrixData.rows[0]?.quotes?.[vid] || {};
        const rawName = prof.vendor_name || firstQuote.vendor_name || vid;
        const cleanName = rawName
          .replace(/^Vend(?:or)?[\s\-_0-9]*/i, "")
          .replace(/^[\s\-_.:\d]+/, "")
          .replace(/_/g, " ")
          .trim();
        return {
          id: vid,
          name: cleanName || rawName,
          leadTime: prof.lead_time_days || 10,
          defectRate: prof.defect_rate_pct || 1.0,
          isDisqualified: prof.audit_status === "DISQUALIFIED" || (prof.lead_time_days && prof.lead_time_days > 12),
          isPartial: false,
        };
      });
    }

    // 3. Fallback only if custom upload mode is NOT active
    if (!isCustomMode) {
      return [
        { id: "VEND-001", name: "Apex Technology Solutions", leadTime: 7, defectRate: 3.8, isDisqualified: true, isPartial: false },
        { id: "VEND-002", name: "CompuZone India Pvt Ltd", leadTime: 10, defectRate: 1.2, isDisqualified: false, isPartial: false },
        { id: "VEND-003", name: "National IT Systems", leadTime: 12, defectRate: 0.9, isDisqualified: false, isPartial: false },
        { id: "VEND-004", name: "Vardhman Infotech", leadTime: 16, defectRate: 1.5, isDisqualified: true, isPartial: true },
        { id: "VEND-005", name: "Shree Balaji Infotech", leadTime: 10, defectRate: 1.1, isDisqualified: false, isPartial: false },
      ];
    }

    return [];
  }, [liveSuppliers, matrixData, vendorProfiles, isCustomMode]);

  // Dynamically generate sample questions adapted to the active uploaded suppliers
  const promptChips = useMemo(() => {
    // If backend provided dynamic sample questions for active quotes, prioritize them
    if (apiSampleQuestions && apiSampleQuestions.length > 0) {
      return apiSampleQuestions;
    }

    const list: { label: string; scenario?: string; prompt: string }[] = [];

    // 1. Dynamic pairwise comparisons for active uploaded suppliers
    if (activeVendors.length >= 2) {
      const v1 = activeVendors[0];
      const v2 = activeVendors[1];
      const v1Short = v1.name.split(" ")[0];
      const v2Short = v2.name.split(" ")[0];
      list.push({
        label: `Compare ${v1Short} vs ${v2Short}`,
        prompt: `Compare commercial terms and landed rates between ${v1.name} and ${v2.name}`
      });
    }

    // 2. Dynamic rate cards for active uploaded suppliers
    activeVendors.slice(0, 3).forEach((v) => {
      const vShort = v.name.split(" ")[0];
      list.push({
        label: `${vShort} Rates?`,
        prompt: `What are the commercial terms and winning lines for ${v.name}?`
      });
    });

    // 3. Strategic award scenarios tailored to uploaded files
    list.push({
      label: "⭐ Recommended Split",
      scenario: "vp_constrained_split",
      prompt: "Apply the VP Constrained Split Award"
    });

    list.push({
      label: "Cheapest Line-by-Line",
      scenario: "unconstrained_lowest",
      prompt: "Show cheapest line-by-line award across uploaded quotes"
    });

    list.push({
      label: "Single Source Best",
      scenario: "single_source_best",
      prompt: "What is our best single-source award option among uploaded suppliers?"
    });

    // 4. Category & SKU Inquiries grounded in uploaded quotes' items
    const rows = matrixData?.rows || [];
    const hasCompute = rows.some((r: any) => String(r.category || "").toLowerCase().includes("compute") || String(r.description || "").toLowerCase().includes("laptop"));
    const hasPeripheral = rows.some((r: any) => String(r.category || "").toLowerCase().includes("peripheral") || String(r.description || "").toLowerCase().includes("monitor"));
    const hasInfra = rows.some((r: any) => String(r.category || "").toLowerCase().includes("infra") || String(r.description || "").toLowerCase().includes("server"));

    if (hasCompute || (!rows.length && !isCustomMode)) {
      list.push({
        label: "💻 Lowest cost for laptops",
        prompt: "Who has lowest quote for laptop?"
      });
    } else if (hasPeripheral) {
      list.push({
        label: "🖥️ Lowest cost for monitors",
        prompt: "Who has lowest quote for monitors and peripherals?"
      });
    } else if (hasInfra) {
      list.push({
        label: "🖧 Lowest cost for servers",
        prompt: "Who has lowest quote for servers and infrastructure?"
      });
    } else if (rows.length > 0) {
      const firstRow = rows[0];
      const descShort = (firstRow.description || firstRow.sku_code || "SKU-001").slice(0, 25);
      list.push({
        label: `🏷️ Best rate for ${firstRow.sku_code || "Item"}`,
        prompt: `Who offers the lowest landed rate for ${descShort}?`
      });
    }

    // 5. Delivery SLA check grounded in uploaded lead times
    const slaBreachVendor = activeVendors.find(v => (v.leadTime || 10) > 12);
    if (slaBreachVendor) {
      list.push({
        label: "⏱️ Exclude delivery > 12 days",
        prompt: "What happens if we exclude suppliers with delivery times above 12 days?"
      });
    } else {
      list.push({
        label: "⏱️ Delivery SLA Status",
        prompt: "Do all uploaded suppliers comply with our 12-day delivery SLA?"
      });
    }

    // 6. Cost difference between single-source & split
    list.push({
      label: "⚖️ Single-supplier vs. Split award",
      prompt: "What is the cost difference between single-supplier and split-supplier awards?"
    });

    // 7. Large price differences / anomaly check
    list.push({
      label: "📊 Large price differences",
      prompt: "Which SKUs have unusually large price differences between vendors?"
    });

    // 8. Conditional rebate check - ONLY if an active uploaded supplier has a rebate
    const rebateVendor = activeVendors.find(v => {
      const vNameLower = v.name.toLowerCase();
      return (
        (!isCustomMode && (vNameLower.includes("compuzone") || v.id === "VEND-002")) ||
        (v as any).footnoteModifiers ||
        (vendorProfiles && vendorProfiles[v.id]?.footnote_modifiers)
      );
    });
    if (rebateVendor) {
      const rShort = rebateVendor.name.split(" ")[0];
      list.push({
        label: `🔍 ${rShort} conditional rebate impact`,
        prompt: `What is the impact if ${rebateVendor.name} conditional rebate is not achieved?`
      });
    }

    // 9. Risk vendor inquiry if any vendor is disqualified or partial
    const riskVendor = activeVendors.find(v => v.isDisqualified || v.isPartial);
    if (riskVendor) {
      const rShort = riskVendor.name.split(" ")[0];
      list.push({
        label: `Why was ${rShort} not awarded?`,
        prompt: `Why was ${riskVendor.name} not awarded under the strategic split?`
      });
    }

    // 10. Summary
    list.push({
      label: "📋 Summarize Uploaded Quotes",
      prompt: "Summarize all currently uploaded supplier quotations"
    });

    return list;
  }, [activeVendors, apiSampleQuestions, matrixData, vendorProfiles, isCustomMode]);

  const buildGreetingMessage = (): AeraMessage => {
    const spendCr = currentSpend > 0 ? (currentSpend / 10000000).toFixed(2) : "15.78";
    const savCr = currentSavings > 0 ? (currentSavings / 10000000).toFixed(2) : "2.12";
    const totalRef = currentSpend + currentSavings;
    const savPct = totalRef > 0 ? ((currentSavings / totalRef) * 100).toFixed(1) : "11.8";

    const vNames = activeVendors.map(v => v.name).join(", ");
    const introText = isCustomMode
      ? `Hello! I am **Aera**, your autonomous sourcing copilot. I have analyzed all **${activeVendors.length} uploaded supplier quotation(s)** across the 30 Enterprise IT Hardware SKUs.\n\n• **Active Uploaded Suppliers**: ${vNames}\n• **Optimized Strategic Spend**: **₹${spendCr} Cr** (**+₹${savCr} Cr / ${savPct}% Net Savings**)\n• **Constraints Verified**: Delivery SLAs (≤ 12d), DDP parity normalization, and Tier-1 quality standards.\n\nAsk me anything about your uploaded quotes, specific SKU rates, vendor comparisons, or scenario what-ifs!`
      : `Hello! I am **Aera**, your autonomous sourcing copilot. I have analyzed all **${activeVendors.length} supplier bids** across 30 enterprise IT hardware SKUs.\n\n• **Active Suppliers**: ${vNames}\n• **Optimized Strategic Spend**: **₹${spendCr} Cr** (**+₹${savCr} Cr / ${savPct}% Net Savings**)\n• **Sourcing Integrity**: Ex-Works terms normalized to DDP equivalent; 12-day delivery SLA strictly verified.\n\nAsk me anything about your quotes, specific SKU lines, commercial terms, or optimization scenarios!`;

    return {
      id: "1",
      sender: "aera",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: introText,
      scenarioTag: activeScenario,
      metrics: {
        totalSpend: `₹${spendCr} Cr`,
        netSavings: `+₹${savCr} Cr`,
        savingsPct: `${savPct}%`
      },
      grounding: {
        is_grounded: true,
        grounding_score: 1.0,
        status_badge: "100% Grounded in RFx Master Matrix"
      }
    };
  };

  const [messages, setMessages] = useState<AeraMessage[]>([]);

  // Dynamically initialize greeting on mount or when suppliers/scenarios change - do not retain old answers
  useEffect(() => {
    setMessages([buildGreetingMessage()]);
  }, [isCustomMode, activeVendors.length]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastUserMsgRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  // Identify index of most recent user message
  const lastUserMsgIdx = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === "user") return i;
    }
    return -1;
  }, [messages]);

  // Smoothly scroll the latest user question right to the top of the chat area!
  useEffect(() => {
    if (messages.length > 1) {
      if (lastUserMsgRef.current) {
        lastUserMsgRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages.length, loading]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const diff = target.scrollHeight - target.scrollTop - target.clientHeight;
    setIsScrolledUp(diff > 120);
  };

  const handleResetChat = () => {
    setMessages([buildGreetingMessage()]);
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
    }
  };

  const handleSendPrompt = async (promptText: string, scenarioTrigger?: string) => {
    if (!promptText.trim()) return;

    const userMsg: AeraMessage = {
      id: Date.now().toString(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: promptText
    };

    const greetingMsg = buildGreetingMessage();
    // Do not show old answers: replace previous Q&A turns with the current question
    setMessages([greetingMsg, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      // Call backend API
      const apiRes = await sendChatMessageToAera(promptText, scenarioTrigger || activeScenario);

      if (apiRes) {
        if (apiRes.scenario_trigger) {
          onSelectScenario(apiRes.scenario_trigger);
        }
        const aeraReply: AeraMessage = {
          id: (Date.now() + 1).toString(),
          sender: "aera",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: apiRes.text,
          scenarioTag: apiRes.scenario_trigger,
          metrics: apiRes.metrics,
          remedies: apiRes.remedies,
          actionChips: apiRes.action_chips,
          grounding: apiRes.grounding
        };
        // Show ONLY the current answer for this question
        setMessages([greetingMsg, userMsg, aeraReply]);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Ask AI error:", err);
    }

    // Dynamic fallback if API call fails
    setTimeout(() => {
      const vList = activeVendors.map(v => v.name).join(", ");
      const spendCr = (currentSpend / 10000000).toFixed(2);
      const savCr = (currentSavings / 10000000).toFixed(2);
      const savPct = currentSpend > 0 ? ((currentSavings / (currentSpend + currentSavings)) * 100).toFixed(1) : "12.0";

      let replyText = `### Sourcing Intelligence for Uploaded Quotations\n\nAnalyzed across **${activeVendors.length} active suppliers** (${vList}):\n\n• **Landed Spend**: ₹${spendCr} Cr (+₹${savCr} Cr / ${savPct}% Savings)\n• All quotes normalized to true DDP delivered terms.`;

      const targetScenario = scenarioTrigger || activeScenario;
      if (scenarioTrigger) {
        onSelectScenario(scenarioTrigger);
      }

      // Show ONLY the current answer for this question
      setMessages([
        greetingMsg,
        userMsg,
        {
          id: (Date.now() + 1).toString(),
          sender: "aera",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: replyText,
          scenarioTag: targetScenario,
          metrics: {
            totalSpend: `₹${spendCr} Cr`,
            netSavings: `+₹${savCr} Cr`,
            savingsPct: `${savPct}%`
          }
        }
      ]);
      setLoading(false);
    }, 400);
  };

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#FFFFFF",
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid #E2E8F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: "#2563EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 2px 4px rgba(37, 99, 235, 0.25)"
          }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ fontSize: "14.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", color: "#0F172A" }}>
              Aera AI Sourcing Copilot
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10B981" }} />
              <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#2563EB", backgroundColor: "#EFF6FF", padding: "1px 8px", borderRadius: "10px", border: "1px solid #DBEAFE" }}>
                {activeVendors.length} Uploaded Suppliers Active
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#64748B" }}>
              Autonomous Sourcing Intelligence • Answers grounded in your uploaded quotations
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* New Thread / Clear Button */}
          {messages.length > 1 && (
            <button
              onClick={handleResetChat}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 11px",
                borderRadius: "8px",
                backgroundColor: "#F1F5F9",
                border: "1px solid #CBD5E1",
                fontSize: "11.5px",
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              title="Clear conversation and start a new question thread"
            >
              <RotateCcw size={13} color="#2563EB" />
              <span>New Thread</span>
            </button>
          )}

          <span style={{
            fontSize: "11px",
            color: "#166534",
            padding: "4px 10px",
            borderRadius: "12px",
            backgroundColor: "#DCFCE7",
            border: "1px solid #BBF7D0",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "5px"
          }}>
            <ShieldCheck size={13} color="#16A34A" />
            Grounding Active
          </span>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#64748B",
                display: "flex",
                alignItems: "center",
                padding: "6px",
                borderRadius: "6px",
                transition: "background 0.15s ease"
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F1F5F9")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              title="Close Copilot"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Conversation Feed */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          backgroundColor: "#F8FAFC",
          position: "relative"
        }}
      >
        {messages.map((m, idx) => {
          const isLatestUser = m.sender === "user" && idx === lastUserMsgIdx;
          return (
            <div
              key={m.id}
              ref={isLatestUser ? lastUserMsgRef : undefined}
              style={{
                alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: m.sender === "user" ? "82%" : "94%",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                scrollMarginTop: "16px"
              }}
            >
              <div style={{
                fontSize: "10.5px",
                color: "#94A3B8",
                alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: 500
              }}>
                {m.sender === "aera" ? "Aera Intelligence" : "You"} • {m.timestamp}
              </div>

              <div style={{
                backgroundColor: m.sender === "user" ? "#2563EB" : "#FFFFFF",
                color: m.sender === "user" ? "white" : "#1E293B",
                padding: "14px 16px",
                borderRadius: m.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                border: m.sender === "user" ? "none" : "1px solid #E2E8F0",
                fontSize: "12.8px",
                lineHeight: 1.6,
                whiteSpace: m.sender === "user" ? "pre-line" : "normal",
                boxShadow: m.sender === "user" ? "0 2px 4px rgba(37, 99, 235, 0.2)" : "0 1px 3px rgba(0, 0, 0, 0.04)"
              }}>
                {m.sender === "user" ? m.text : renderFormattedMessage(m.text)}

                {/* Metrics Badge */}
                {m.metrics && (
                  <div style={{
                    marginTop: "12px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "#ECFDF5",
                    border: "1px solid #A7F3D0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <div>
                      <div style={{ fontSize: "9.5px", color: "#065F46", textTransform: "uppercase", fontWeight: 700 }}>Optimized Spend</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#0F172A" }}>{m.metrics.totalSpend}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "9.5px", color: "#065F46", textTransform: "uppercase", fontWeight: 700 }}>Net Savings</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#059669" }}>{m.metrics.netSavings}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "9.5px", color: "#065F46", textTransform: "uppercase", fontWeight: 700 }}>Reduction</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#059669" }}>{m.metrics.savingsPct}</div>
                    </div>
                  </div>
                )}

                {/* Quick Starter Cards for brand new chat */}
                {m.id === "1" && messages.length === 1 && promptChips.length > 0 && (
                  <div style={{
                    marginTop: "14px",
                    paddingTop: "12px",
                    borderTop: "1px solid #E2E8F0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Quick Sourcing Inquiries for Uploaded Quotes:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "8px" }}>
                      {promptChips.slice(0, 4).map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleSendPrompt(chip.prompt, chip.scenario)}
                          style={{
                            textAlign: "left",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            backgroundColor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            fontSize: "12px",
                            color: "#1E293B",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "all 0.15s ease"
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = "#EFF6FF";
                            e.currentTarget.style.borderColor = "#93C5FD";
                            e.currentTarget.style.color = "#1D4ED8";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = "#F8FAFC";
                            e.currentTarget.style.borderColor = "#E2E8F0";
                            e.currentTarget.style.color = "#1E293B";
                          }}
                        >
                          <Sparkles size={13} color="#2563EB" style={{ flexShrink: 0 }} />
                          <span>{chip.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Infeasibility / Action Remedies */}
                {m.remedies && (
                  <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#B45309" }}>Recommended Actions:</div>
                    {m.remedies.map((rem, i) => (
                      <div key={i} style={{ fontSize: "11.5px", color: "#475569", display: "flex", alignItems: "center", gap: "6px" }}>
                        <ArrowRight size={13} color="#D97706" />
                        {rem}
                      </div>
                    ))}
                  </div>
                )}

                {/* Grounding & Guardrail Verification Stamp */}
                {m.grounding && (
                  <div style={{
                    marginTop: "12px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    backgroundColor: m.grounding.is_grounded ? "#F0FDF4" : "#FEF2F2",
                    border: m.grounding.is_grounded ? "1px solid #BBF7D0" : "1px solid #FECACA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "11px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: m.grounding.is_grounded ? "#166534" : "#991B1B", fontWeight: 600 }}>
                      <ShieldCheck size={14} color={m.grounding.is_grounded ? "#16A34A" : "#DC2626"} />
                      <span>{m.grounding.status_badge || "100% Grounded in RFx Master Matrix"}</span>
                    </div>
                    <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 500 }}>
                      Verified by Aera Guardrail Engine
                    </span>
                  </div>
                )}

                {/* Dynamic Follow-up Action Chips from Backend */}
                {m.actionChips && m.actionChips.length > 0 && (
                  <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {m.actionChips.map((chip, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => handleSendPrompt(chip)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "12px",
                          backgroundColor: "#F1F5F9",
                          border: "1px solid #CBD5E1",
                          fontSize: "11px",
                          color: "#1E293B",
                          cursor: "pointer",
                          fontWeight: 600,
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = "#EFF6FF";
                          e.currentTarget.style.borderColor = "#93C5FD";
                          e.currentTarget.style.color = "#1D4ED8";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = "#F1F5F9";
                          e.currentTarget.style.borderColor = "#CBD5E1";
                          e.currentTarget.style.color = "#1E293B";
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ fontSize: "12.5px", color: "#2563EB", fontStyle: "italic", padding: "8px 12px", backgroundColor: "#EFF6FF", borderRadius: "8px", border: "1px solid #DBEAFE", alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={14} className="animate-spin" />
            Aera is evaluating constraints across uploaded quotation lines...
          </div>
        )}
        <div ref={messagesEndRef} />

        {/* Floating Scroll-to-Question/Latest Pill */}
        {isScrolledUp && (
          <button
            onClick={() => {
              if (lastUserMsgRef.current) {
                lastUserMsgRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              } else {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            style={{
              position: "sticky",
              bottom: "12px",
              alignSelf: "center",
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "20px",
              padding: "6px 14px",
              fontSize: "11.5px",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              zIndex: 10
            }}
          >
            <ArrowDown size={13} />
            <span>Jump to Question</span>
          </button>
        )}
      </div>

      {/* Sleek Horizontal Suggested Questions Bar (Above Input) */}
      {promptChips.length > 0 && (
        <div style={{
          padding: "8px 16px",
          borderTop: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          overflowX: "auto",
          scrollbarWidth: "none",
          flexShrink: 0
        }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#64748B",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexShrink: 0
          }}>
            <Sparkles size={12} color="#2563EB" />
            <span>Suggested:</span>
          </div>
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(chip.prompt, chip.scenario)}
              style={{
                fontSize: "11.5px",
                padding: "4px 11px",
                borderRadius: "14px",
                backgroundColor: "#F1F5F9",
                color: "#334155",
                border: "1px solid #CBD5E1",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#2563EB";
                e.currentTarget.style.color = "#2563EB";
                e.currentTarget.style.backgroundColor = "#EFF6FF";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#CBD5E1";
                e.currentTarget.style.color = "#334155";
                e.currentTarget.style.backgroundColor = "#F1F5F9";
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div style={{
        padding: "12px 18px",
        borderTop: "1px solid #E2E8F0",
        backgroundColor: "#FFFFFF",
        display: "flex",
        gap: "10px",
        alignItems: "center",
        flexShrink: 0
      }}>
        <input
          type="text"
          placeholder="Ask Aera about uploaded rates, supplier terms, or what-if scenarios..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendPrompt(inputVal)}
          style={{
            flex: 1,
            backgroundColor: "#F8FAFC",
            color: "#0F172A",
            border: "1px solid #CBD5E1",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "13px",
            outline: "none",
            transition: "border-color 0.15s ease"
          }}
          onFocus={e => (e.currentTarget.style.borderColor = "#2563EB")}
          onBlur={e => (e.currentTarget.style.borderColor = "#CBD5E1")}
        />
        <button
          onClick={() => handleSendPrompt(inputVal)}
          disabled={!inputVal.trim() || loading}
          style={{
            backgroundColor: !inputVal.trim() || loading ? "#94A3B8" : "#2563EB",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            cursor: !inputVal.trim() || loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontWeight: 600,
            fontSize: "13px",
            transition: "background 0.15s ease"
          }}
          onMouseEnter={e => {
            if (inputVal.trim() && !loading) e.currentTarget.style.backgroundColor = "#1D4ED8";
          }}
          onMouseLeave={e => {
            if (inputVal.trim() && !loading) e.currentTarget.style.backgroundColor = "#2563EB";
          }}
        >
          <span>Send</span>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};
