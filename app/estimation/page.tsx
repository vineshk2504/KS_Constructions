"use client";

import { useMemo, useRef, useState } from "react";

type TierKey = "tier1" | "tier2" | "tier3";
type CityKey = "hyderabad" | "bengaluru" | "chennai" | "mysuru" | "delhi_ncr";
type AreaKey = "standard" | "high_cost";
type FloorKey = "g0" | "g1" | "g2" | "g3" | "g4plus";

const TIERS: Record<
  TierKey,
  { label: string; shortLabel: string; description: string; ratePerSqft: number }
> = {
  tier1: {
    label: "Tier 1 — Basic Specifications",
    shortLabel: "Basic",
    description: "Standard materials and workmanship, no upgrades.",
    ratePerSqft: 1800,
  },
  tier2: {
    label: "Tier 2 — Standard Upgrades",
    shortLabel: "Standard",
    description: "Better fittings, tiling and finish quality.",
    ratePerSqft: 2000,
  },
  tier3: {
    label: "Tier 3 — Premium Finishes",
    shortLabel: "Premium",
    description: "Premium brands, finishes and fixtures throughout.",
    ratePerSqft: 2200,
  },
};

// Illustrative city cost multipliers — replace with real regional data.
const CITIES: Record<CityKey, { label: string; multiplier: number }> = {
  hyderabad: { label: "Hyderabad", multiplier: 1.0 },
  bengaluru: { label: "Bengaluru", multiplier: 1.08 },
  chennai: { label: "Chennai", multiplier: 1.05 },
  mysuru: { label: "Mysuru", multiplier: 0.95 },
  delhi_ncr: { label: "Delhi NCR", multiplier: 1.1 },
};

// Within a city, a high-cost / premium locality carries its own surcharge
// on top of the city multiplier — e.g. HITEC City vs an outer suburb of
// the same city. Illustrative figure — replace with real locality data.
const AREAS: Record<AreaKey, { label: string; multiplier: number }> = {
  standard: { label: "Standard area", multiplier: 1.0 },
  high_cost: { label: "High-cost / premium locality", multiplier: 1.15 },
};

// Floors expressed the way plots are actually marketed (G+0, G+1, ...)
// rather than a raw floor count.
const FLOORS: Record<FloorKey, { label: string; levels: number }> = {
  g0: { label: "G+0 (Single floor)", levels: 1 },
  g1: { label: "G+1", levels: 2 },
  g2: { label: "G+2", levels: 3 },
  g3: { label: "G+3", levels: 4 },
  g4plus: { label: "G+4 & above", levels: 5 },
};

const RANGE_VARIANCE = 0.08; // ±8%

// Rough built-up-area-per-floor assumptions when someone mentions a BHK
// count without giving an explicit sqft figure. Illustrative — adjust to
// match your actual typical plan sizes.
const BHK_AREA_GUESS: Record<number, number> = {
  1: 650,
  2: 1000,
  3: 1400,
  4: 1800,
  5: 2200,
};

function formatINR(amount: number): string {
  if (!isFinite(amount) || amount <= 0) return "₹0";
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

// ---- Chat agent ----------------------------------------------------------
// A rule-based assistant: it parses plot size, city, locality, floors,
// tier and budget mentions out of free text and either fills in the
// calculator above or answers with a suggestion. It does not call an
// external LLM — everything runs from the same TIERS/CITIES/AREAS/FLOORS
// tables the calculator uses, so its numbers always match the page.
// Swap parseMessage()'s body for a real API call later if you want
// open-ended natural language handling instead.

type ChatMessage = { role: "user" | "agent"; text: string };

const CITY_ALIASES: { key: CityKey; patterns: RegExp[] }[] = [
  { key: "hyderabad", patterns: [/hyderabad/i, /hyd\b/i] },
  { key: "bengaluru", patterns: [/bengaluru/i, /bangalore/i, /blr\b/i] },
  { key: "chennai", patterns: [/chennai/i] },
  { key: "mysuru", patterns: [/mysuru/i, /mysore/i] },
  { key: "delhi_ncr", patterns: [/delhi/i, /ncr\b/i, /gurgaon/i, /noida/i] },
];

const TIER_ALIASES: { key: TierKey; patterns: RegExp[] }[] = [
  { key: "tier1", patterns: [/\btier\s*1\b/i, /\bbasic\b/i] },
  { key: "tier2", patterns: [/\btier\s*2\b/i, /\bstandard\b/i] },
  { key: "tier3", patterns: [/\btier\s*3\b/i, /\bpremium\b/i, /\bluxury\b/i] },
];

const FLOOR_ALIASES: { key: FloorKey; patterns: RegExp[] }[] = [
  { key: "g0", patterns: [/g\s*\+\s*0/i, /single\s*floor/i, /ground\s*floor\s*only/i] },
  { key: "g1", patterns: [/g\s*\+\s*1/i] },
  { key: "g2", patterns: [/g\s*\+\s*2/i] },
  { key: "g3", patterns: [/g\s*\+\s*3/i] },
  { key: "g4plus", patterns: [/g\s*\+\s*4/i] },
];

function parseDims(text: string): { width: number; length: number } | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  if (!m) return null;
  return { width: parseFloat(m[1]), length: parseFloat(m[2]) };
}

function parseBudgetInINR(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(lakh|lac|l\b|cr|crore)/i);
  if (!m) return null;
  const value = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  if (unit.startsWith("cr")) return value * 10000000;
  return value * 100000; // lakh / lac / l
}

function parseBHK(text: string): number | null {
  const m = text.match(/\b([1-5])\s*bhk\b/i);
  return m ? parseInt(m[1], 10) : null;
}

function findFirst<K extends string>(text: string, table: { key: K; patterns: RegExp[] }[]): K | null {
  for (const entry of table) {
    if (entry.patterns.some((p) => p.test(text))) return entry.key;
  }
  return null;
}

function isRateQuery(text: string): boolean {
  return /\brate\b|\bper\s*sqft\b|\bprice\s*per\b|\bcost\s*per\s*sq/i.test(text);
}

function isCompareQuery(text: string): boolean {
  return /\bcompare\b|\bcheapest\b|\bwhich\s+(is|city|tier)\b.*\b(cheap|better|cost)/i.test(text) ||
    /\bdifference\b/i.test(text);
}

function isCostQuestion(text: string): boolean {
  return /\bcost\b|\bprice\b|\bestimate\b|\bbudget\b|\bafford\b|\bexpensive\b|\bquote\b|\bhow much\b/i.test(text);
}

export default function Page() {
  // Calculator inputs
  const [plotWidth, setPlotWidth] = useState("30");
  const [plotLength, setPlotLength] = useState("40");
  const [builtUpPerFloor, setBuiltUpPerFloor] = useState("1200");
  const [floorKey, setFloorKey] = useState<FloorKey>("g1");
  const [tier, setTier] = useState<TierKey>("tier2");
  const [city, setCity] = useState<CityKey>("hyderabad");
  const [area, setArea] = useState<AreaKey>("standard");

  // Lead capture inputs
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Chat agent
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      text:
        "Ask me anything about pricing — plot combinations (\"30x40 in Bengaluru, G+2, premium tier\"), rates (\"tier1 rate in Chennai\"), comparisons (\"cheapest city for this plot\"), or budgets (\"what fits 25 lakh?\"). If I don't recognize specifics, I'll answer using what's currently set in the calculator.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const plotArea = useMemo(() => {
    const w = parseFloat(plotWidth);
    const l = parseFloat(plotLength);
    return w > 0 && l > 0 ? w * l : 0;
  }, [plotWidth, plotLength]);

  const floors = FLOORS[floorKey].levels;

  const totalBuiltUpArea = useMemo(() => {
    const perFloor = parseFloat(builtUpPerFloor);
    return perFloor > 0 && floors > 0 ? perFloor * floors : 0;
  }, [builtUpPerFloor, floors]);

  const effectiveMultiplier = (cityKey: CityKey, areaKey: AreaKey) =>
    CITIES[cityKey].multiplier * AREAS[areaKey].multiplier;

  // Rate per sqft after city + locality adjustment — this is what changes
  // live when the city or locality dropdown changes, as opposed to the
  // flat base rate in TIERS which never changes.
  const effectiveRate = (tierKey: TierKey, cityKey: CityKey = city, areaKey: AreaKey = area) =>
    Math.round(TIERS[tierKey].ratePerSqft * effectiveMultiplier(cityKey, areaKey));

  const costForTier = (tierKey: TierKey): number => {
    return totalBuiltUpArea * effectiveRate(tierKey);
  };

  const selectedCost = useMemo(() => costForTier(tier), [totalBuiltUpArea, tier, city, area]);

  const costRange = useMemo(() => {
    return {
      low: selectedCost * (1 - RANGE_VARIANCE),
      high: selectedCost * (1 + RANGE_VARIANCE),
    };
  }, [selectedCost]);

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!leadName.trim()) next.name = "Enter your name.";
    if (!isValidPhone(leadPhone)) next.phone = "Enter a valid 10-digit mobile number.";
    if (leadEmail.trim() && !isValidEmail(leadEmail)) next.email = "Enter a valid email address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSendEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitStatus("submitting");
    try {
      // Placeholder endpoint. Implement /api/send-estimate server-side to
      // actually email/SMS the estimate (e.g. via Resend, SendGrid, Twilio).
      const res = await fetch("/api/send-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          phone: `+91${leadPhone}`,
          email: leadEmail || undefined,
          city: CITIES[city].label,
          area: AREAS[area].label,
          plotWidth,
          plotLength,
          builtUpPerFloor,
          floors: FLOORS[floorKey].label,
          tier: TIERS[tier].shortLabel,
          estimatedCost: Math.round(selectedCost),
          costRangeLow: Math.round(costRange.low),
          costRangeHigh: Math.round(costRange.high),
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  function pushChat(role: ChatMessage["role"], text: string) {
    setChatMessages((prev) => [...prev, { role, text }]);
    requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  function handleChatSend(e: React.FormEvent) {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    pushChat("user", text);
    setChatInput("");

    const dims = parseDims(text);
    const matchedCity = findFirst<CityKey>(text, CITY_ALIASES);
    const matchedTier = findFirst<TierKey>(text, TIER_ALIASES);
    const matchedFloor = findFirst<FloorKey>(text, FLOOR_ALIASES);
    const matchedArea = /high[\s-]?cost|premium\s*locality|prime\s*location/i.test(text)
      ? ("high_cost" as AreaKey)
      : /standard\s*area/i.test(text)
      ? ("standard" as AreaKey)
      : null;
    const matchedBHK = parseBHK(text);
    const budget = parseBudgetInINR(text);

    // Apply anything recognized to the live calculator so the two stay in sync.
    const nextCity = matchedCity ?? city;
    const nextTier = matchedTier ?? tier;
    const nextFloorKey = matchedFloor ?? floorKey;
    const nextArea = matchedArea ?? area;
    const nextWidth = dims ? String(dims.width) : plotWidth;
    const nextLength = dims ? String(dims.length) : plotLength;
    const nextBuiltUpPerFloor = matchedBHK ? String(BHK_AREA_GUESS[matchedBHK]) : builtUpPerFloor;

    if (matchedCity) setCity(matchedCity);
    if (matchedTier) setTier(matchedTier);
    if (matchedFloor) setFloorKey(matchedFloor);
    if (matchedArea) setArea(matchedArea);
    if (dims) { setPlotWidth(nextWidth); setPlotLength(nextLength); }
    if (matchedBHK) setBuiltUpPerFloor(nextBuiltUpPerFloor);

    const nextMult = effectiveMultiplier(nextCity, nextArea);
    const nextLevels = FLOORS[nextFloorKey].levels;
    const nextPerFloor = parseFloat(nextBuiltUpPerFloor) || 0;
    const nextTotalArea = nextPerFloor * nextLevels;
    const nextCost = nextTotalArea * TIERS[nextTier].ratePerSqft * nextMult;

    const recognizedAnything = !!(matchedCity || matchedTier || matchedFloor || matchedArea || dims || matchedBHK);

    // "Which tier/rate is X" style questions — answer with rates only, no
    // need for a full plot size.
    if (isRateQuery(text) && !budget) {
      const cities = matchedCity ? [matchedCity] : (Object.keys(CITIES) as CityKey[]);
      const tiers = matchedTier ? [matchedTier] : (Object.keys(TIERS) as TierKey[]);
      const lines = cities.flatMap((c) =>
        tiers.map((t) => `${TIERS[t].shortLabel} in ${CITIES[c].label} (${AREAS[nextArea].label.toLowerCase()}): ₹${effectiveRate(t, c, nextArea)}/sqft`)
      );
      pushChat("agent", lines.join("\n"));
      return;
    }

    // "Compare tiers" / "cheapest city" style questions.
    if (isCompareQuery(text)) {
      if (/city|cities|cheapest\s*city|where/i.test(text) && !matchedCity) {
        const rows = (Object.keys(CITIES) as CityKey[])
          .map((c) => ({
            city: CITIES[c].label,
            cost: nextTotalArea * TIERS[nextTier].ratePerSqft * effectiveMultiplier(c, nextArea),
          }))
          .sort((a, b) => a.cost - b.cost);
        const summary = rows.map((r) => `${r.city}: ${formatINR(r.cost)}`).join(", ");
        pushChat(
          "agent",
          nextTotalArea > 0
            ? `For ${nextTotalArea.toLocaleString("en-IN")} sqft at ${TIERS[nextTier].shortLabel} tier — ${summary}. ${rows[0].city} is cheapest here.`
            : `Set a plot size and floors first so I can compare cities on a real built-up area.`
        );
        return;
      }
      const rows = (Object.keys(TIERS) as TierKey[]).map((t) => ({
        tier: TIERS[t].shortLabel,
        cost: nextTotalArea * effectiveRate(t, nextCity, nextArea),
      }));
      const summary = rows.map((r) => `${r.tier}: ${formatINR(r.cost)}`).join(", ");
      pushChat(
        "agent",
        nextTotalArea > 0
          ? `For ${nextTotalArea.toLocaleString("en-IN")} sqft in ${CITIES[nextCity].label} — ${summary}.`
          : `Set a plot size and floors first so I can compare tiers on a real built-up area.`
      );
      return;
    }

    // Pure budget question — suggest the richest tier that fits.
    if (budget && !recognizedAnything) {
      const affordable = (Object.keys(TIERS) as TierKey[])
        .map((k) => ({ key: k, cost: nextTotalArea * effectiveRate(k, nextCity, nextArea) }))
        .filter((t) => t.cost <= budget)
        .sort((a, b) => b.cost - a.cost)[0];

      if (affordable) {
        pushChat(
          "agent",
          `With your current ${FLOORS[nextFloorKey].label} plan in ${CITIES[nextCity].label} (${nextTotalArea.toLocaleString("en-IN")} sqft built-up), a ${formatINR(budget)} budget comfortably covers ${TIERS[affordable.key].label} at about ${formatINR(affordable.cost)}.`
        );
      } else {
        const cheapest = (Object.keys(TIERS) as TierKey[])
          .map((k) => ({ key: k, cost: nextTotalArea * effectiveRate(k, nextCity, nextArea) }))
          .sort((a, b) => a.cost - b.cost)[0];
        pushChat(
          "agent",
          `Even ${TIERS[cheapest.key].label} comes to about ${formatINR(cheapest.cost)} for this plot — above your ${formatINR(budget)} budget. Try a smaller built-up area, fewer floors, or a lower tier and I'll recalculate.`
        );
      }
      return;
    }

    if (recognizedAnything) {
      const parts: string[] = [];
      if (dims) parts.push(`plot ${nextWidth}×${nextLength} ft`);
      if (matchedBHK) parts.push(`${matchedBHK} BHK (~${BHK_AREA_GUESS[matchedBHK]} sqft/floor assumed)`);
      parts.push(FLOORS[nextFloorKey].label);
      parts.push(CITIES[nextCity].label);
      if (matchedArea) parts.push(AREAS[nextArea].label.toLowerCase());
      parts.push(TIERS[nextTier].shortLabel + " tier");

      pushChat(
        "agent",
        nextTotalArea > 0
          ? `Updated the calculator to ${parts.join(", ")}. At ${nextTotalArea.toLocaleString("en-IN")} sqft built-up, that comes to roughly ${formatINR(nextCost)}. Scroll up to see the full breakdown, or ask another combination to compare.`
          : `Updated ${parts.join(", ")} — set a built-up area per floor above so I can calculate a cost.`
      );
      return;
    }

    // Nothing specific recognized, but it still sounds like a cost
    // question — answer from whatever is currently on the calculator
    // instead of just showing a help message.
    if (isCostQuestion(text)) {
      pushChat(
        "agent",
        nextTotalArea > 0
          ? `Based on your current setup — ${FLOORS[floorKey].label}, ${CITIES[city].label} (${AREAS[area].label.toLowerCase()}), ${TIERS[tier].shortLabel} tier, ${nextTotalArea.toLocaleString("en-IN")} sqft built-up — the estimate is ${formatINR(selectedCost)}. Mention a different plot size, city, tier, floor count, or budget and I'll recalculate.`
          : `Enter a plot size and built-up area per floor above, or tell me one here (e.g. "30x40, 1200 sqft per floor"), and I'll calculate the cost.`
      );
      return;
    }

    pushChat(
      "agent",
      "I can help with plot size (e.g. \"30x40\"), BHK (e.g. \"3 BHK\"), city (Hyderabad, Bengaluru, Chennai, Mysuru, Delhi NCR), locality type (standard or high-cost area), floors (G+0 to G+4), tier (basic, standard, premium), rates (\"tier1 rate in Chennai\"), comparisons (\"compare tiers\", \"cheapest city\") or a budget (e.g. \"25 lakh\"). Try mentioning one of those."
    );
  }

  return (
    <main className="section">
      <div className="container">
        <p>BUILDWELL CONSTRUCTIONS</p>
        <h1>Construction Estimation Calculator</h1>
        <p style={{ fontSize: 20, maxWidth: 760, lineHeight: 1.6 }}>
          Estimate project cost using plot size, built-up area, floors and
          construction quality.
        </p>

        <div className="estimator-grid" style={{ marginTop: 32 }}>
          {/* Inputs */}
          <div className="card" style={{ display: "grid", gap: 20 }}>
            <div>
              <label htmlFor="plotWidth" className="field-label">
                Plot Size (ft)
              </label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  id="plotWidth"
                  type="number"
                  min={0}
                  value={plotWidth}
                  onChange={(e) => setPlotWidth(e.target.value)}
                  placeholder="Width"
                  aria-label="Plot width in feet"
                  className="text-input"
                />
                <span aria-hidden="true">×</span>
                <input
                  id="plotLength"
                  type="number"
                  min={0}
                  value={plotLength}
                  onChange={(e) => setPlotLength(e.target.value)}
                  placeholder="Length"
                  aria-label="Plot length in feet"
                  className="text-input"
                />
              </div>
              <p style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>
                Plot area: {plotArea > 0 ? `${plotArea.toLocaleString("en-IN")} sqft` : "—"}
              </p>
            </div>

            <div>
              <label htmlFor="builtUp" className="field-label">
                Built-up Area per Floor (sqft)
              </label>
              <input
                id="builtUp"
                type="number"
                min={0}
                value={builtUpPerFloor}
                onChange={(e) => setBuiltUpPerFloor(e.target.value)}
                className="text-input"
                style={{ width: "100%" }}
              />
              {plotArea > 0 && parseFloat(builtUpPerFloor) > plotArea && (
                <p role="alert" className="field-error">
                  Built-up area per floor exceeds your plot area — double check this figure.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="floors" className="field-label">
                Floors
              </label>
              <select
                id="floors"
                value={floorKey}
                onChange={(e) => setFloorKey(e.target.value as FloorKey)}
                className="text-input"
                style={{ width: "100%" }}
              >
                {(Object.keys(FLOORS) as FloorKey[]).map((key) => (
                  <option key={key} value={key}>
                    {FLOORS[key].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="field-label">
                City
              </label>
              <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value as CityKey)}
                className="text-input"
                style={{ width: "100%" }}
              >
                {(Object.keys(CITIES) as CityKey[]).map((key) => (
                  <option key={key} value={key}>
                    {CITIES[key].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="area" className="field-label">
                Locality Type
              </label>
              <select
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value as AreaKey)}
                className="text-input"
                style={{ width: "100%" }}
              >
                {(Object.keys(AREAS) as AreaKey[]).map((key) => (
                  <option key={key} value={key}>
                    {AREAS[key].label}{key === "high_cost" ? " (+15%)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend className="field-label" style={{ marginBottom: 8 }}>
                Construction Quality
              </legend>
              <div style={{ display: "grid", gap: 10 }}>
                {(Object.keys(TIERS) as TierKey[]).map((key) => (
                  <label key={key} className={`tier-option ${tier === key ? "tier-option-active" : ""}`}>
                    <input
                      type="radio"
                      name="tier"
                      checked={tier === key}
                      onChange={() => setTier(key)}
                      style={{ marginTop: 4 }}
                    />
                    <span>
                      <span style={{ display: "block", fontWeight: 600 }}>
                        {TIERS[key].label} — ₹{effectiveRate(key)}/sqft
                      </span>
                      <span style={{ display: "block", fontSize: 13, opacity: 0.75 }}>
                        {TIERS[key].description} Base ₹{TIERS[key].ratePerSqft}/sqft in {CITIES[city].label} ({AREAS[area].label.toLowerCase()}).
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Results */}
          <div className="card result-card">
            <p className="result-eyebrow">Estimated Construction Cost</p>
            <p className="result-figure">
              {formatINR(costRange.low)} – {formatINR(costRange.high)}
            </p>
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: -12, marginBottom: 20 }}>
              Point estimate: {formatINR(selectedCost)} at {TIERS[tier].shortLabel} tier, {CITIES[city].label} ({AREAS[area].label})
            </p>

            <div style={{ display: "grid", gap: 10, fontSize: 15, marginBottom: 20 }}>
              <div className="result-row">
                <span>Total built-up area</span>
                <span>{totalBuiltUpArea > 0 ? `${totalBuiltUpArea.toLocaleString("en-IN")} sqft` : "—"}</span>
              </div>
              <div className="result-row">
                <span>Base rate</span>
                <span>₹{TIERS[tier].ratePerSqft}/sqft</span>
              </div>
              <div className="result-row">
                <span>City adjustment</span>
                <span>×{CITIES[city].multiplier.toFixed(2)}</span>
              </div>
              <div className="result-row">
                <span>Locality adjustment</span>
                <span>×{AREAS[area].multiplier.toFixed(2)}</span>
              </div>
              <div className="result-row">
                <span>Effective rate</span>
                <span>₹{effectiveRate(tier)}/sqft</span>
              </div>
              <div className="result-row">
                <span>Floors</span>
                <span>{FLOORS[floorKey].label}</span>
              </div>
            </div>

            <p className="field-label" style={{ marginBottom: 8 }}>
              Compare tiers at this size
            </p>
            <table className="tier-table">
              <thead>
                <tr>
                  <th scope="col">Tier</th>
                  <th scope="col">Rate in {CITIES[city].label}</th>
                  <th scope="col">Est. cost</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(TIERS) as TierKey[]).map((key) => (
                  <tr key={key} className={key === tier ? "tier-row-active" : ""}>
                    <td>{TIERS[key].shortLabel}</td>
                    <td>₹{effectiveRate(key)}</td>
                    <td>{formatINR(costForTier(key))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button type="button" onClick={handlePrint} className="secondary-button" style={{ marginTop: 20 }}>
              Print / Save as PDF
            </button>

            <p style={{ fontSize: 12, opacity: 0.6, marginTop: 16 }}>
              Estimate only. Actual cost may vary based on site conditions, design
              complexity, approvals and material price fluctuations.
            </p>
          </div>
        </div>

        {/* Chat agent */}
        <div className="card chat-panel" style={{ marginTop: 32, maxWidth: 640 }}>
          <h2 style={{ marginTop: 0 }}>Ask the estimator assistant</h2>
          <p style={{ fontSize: 14, opacity: 0.75, marginTop: -8, marginBottom: 16 }}>
            Describe your plot in plain words and I'll fill in the calculator and work out the cost.
          </p>

          <div className="chat-log">
            {chatMessages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role === "user" ? "chat-bubble-user" : "chat-bubble-agent"}`}>
                {m.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleChatSend} className="chat-input-row">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="e.g. 30x40 in Bengaluru, G+2, premium tier"
              aria-label="Message the estimator assistant"
              className="text-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="primary-button">
              Send
            </button>
          </form>
        </div>

        {/* Lead capture */}
        <div className="card" style={{ marginTop: 32, maxWidth: 560 }}>
          <h2 style={{ marginTop: 0 }}>Get this estimate by email or SMS</h2>
          <p style={{ fontSize: 14, opacity: 0.75, marginTop: -8, marginBottom: 20 }}>
            Share your details and we'll send this estimate to you, along with a
            detailed line-item quote from our team.
          </p>

          {submitStatus === "success" ? (
            <p role="status" style={{ fontWeight: 600 }}>
              Sent. Check your phone or inbox shortly — our team will follow up
              within 30 minutes.
            </p>
          ) : (
            <form onSubmit={handleSendEstimate} noValidate>
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label htmlFor="leadName" className="field-label">
                    Name
                  </label>
                  <input
                    id="leadName"
                    type="text"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="text-input"
                    style={{ width: "100%" }}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "leadName-error" : undefined}
                  />
                  {errors.name && (
                    <p id="leadName-error" role="alert" className="field-error">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="leadPhone" className="field-label">
                    Phone Number
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span className="phone-prefix">+91</span>
                    <input
                      id="leadPhone"
                      type="tel"
                      inputMode="numeric"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="text-input"
                      style={{ flex: 1 }}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "leadPhone-error" : undefined}
                    />
                  </div>
                  {errors.phone && (
                    <p id="leadPhone-error" role="alert" className="field-error">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="leadEmail" className="field-label">
                    Email (optional)
                  </label>
                  <input
                    id="leadEmail"
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="text-input"
                    style={{ width: "100%" }}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "leadEmail-error" : undefined}
                  />
                  {errors.email && (
                    <p id="leadEmail-error" role="alert" className="field-error">
                      {errors.email}
                    </p>
                  )}
                </div>

                {submitStatus === "error" && (
                  <p role="alert" className="field-error">
                    Something went wrong sending your estimate. Please try again.
                  </p>
                )}

                <button type="submit" disabled={submitStatus === "submitting"} className="primary-button">
                  {submitStatus === "submitting" ? "Sending…" : "Send my estimate"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .estimator-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: start;
        }
        .field-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .field-error {
          color: #b42318;
          font-size: 13px;
          margin-top: 6px;
        }
        .text-input {
          padding: 10px 12px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        .text-input:focus-visible {
          outline: 2px solid #1a56db;
          outline-offset: 2px;
        }
        .phone-prefix {
          display: flex;
          align-items: center;
          padding: 0 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 16px;
          background: #f2f2f2;
        }
        .tier-option {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          cursor: pointer;
        }
        .tier-option-active {
          border: 2px solid #333;
        }
        .tier-option:focus-within {
          outline: 2px solid #1a56db;
          outline-offset: 2px;
        }
        .result-card {
          background: #fafafa;
          border: 1px solid #ddd;
        }
        .result-eyebrow {
          font-size: 13px;
          text-transform: uppercase;
          opacity: 0.7;
          margin-bottom: 4px;
        }
        .result-figure {
          font-size: 34px;
          font-weight: 700;
          margin: 0 0 4px;
        }
        .result-row {
          display: flex;
          justify-content: space-between;
        }
        .tier-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .tier-table th,
        .tier-table td {
          text-align: left;
          padding: 8px 6px;
          border-bottom: 1px solid #e5e5e5;
        }
        .tier-row-active {
          font-weight: 600;
          background: #f0f4ff;
        }
        .chat-panel {
          background: #fff;
          border: 1px solid #ddd;
        }
        .chat-log {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 320px;
          overflow-y: auto;
          padding: 4px 2px;
          margin-bottom: 12px;
        }
        .chat-bubble {
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 14px;
          line-height: 1.5;
          max-width: 85%;
          white-space: pre-line;
        }
        .chat-bubble-agent {
          background: #f2f4f7;
          align-self: flex-start;
        }
        .chat-bubble-user {
          background: #1a56db;
          color: #fff;
          align-self: flex-end;
        }
        .chat-input-row {
          display: flex;
          gap: 10px;
        }
        .primary-button {
          padding: 12px 20px;
          font-size: 16px;
          font-weight: 600;
          background: #1a56db;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .primary-button:focus-visible,
        .secondary-button:focus-visible {
          outline: 2px solid #1a56db;
          outline-offset: 2px;
        }
        .secondary-button {
          padding: 10px 18px;
          font-size: 15px;
          font-weight: 600;
          background: transparent;
          color: #1a56db;
          border: 1px solid #1a56db;
          border-radius: 6px;
          cursor: pointer;
        }
        @media (max-width: 780px) {
          .estimator-grid {
            grid-template-columns: 1fr;
          }
        }
        @media print {
          form,
          .secondary-button,
          .chat-panel {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}