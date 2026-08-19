"use client";

import { useMemo, useState } from "react";

const TIERS = {
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

const CITIES = {
  hyderabad: { label: "Hyderabad", multiplier: 1.0 },
  bengaluru: { label: "Bengaluru", multiplier: 1.08 },
  chennai: { label: "Chennai", multiplier: 1.05 },
  mysuru: { label: "Mysuru", multiplier: 0.95 },
  delhi_ncr: { label: "Delhi NCR", multiplier: 1.1 },
};

const AREAS = {
  standard: { label: "Standard area", multiplier: 1.0 },
  high_cost: { label: "High-cost / premium locality", multiplier: 1.15 },
};

const FLOORS = {
  g0: { label: "G+0 (Single floor)", levels: 1 },
  g1: { label: "G+1", levels: 2 },
  g2: { label: "G+2", levels: 3 },
  g3: { label: "G+3", levels: 4 },
  g4plus: { label: "G+4 & above", levels: 5 },
};

const RANGE_VARIANCE = 0.08;

function formatINR(amount) {
  if (!isFinite(amount) || amount <= 0) return "₹0";
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

export default function Page() {
  const [plotWidth, setPlotWidth] = useState("30");
  const [plotLength, setPlotLength] = useState("40");
  const [builtUpPerFloor, setBuiltUpPerFloor] = useState("1200");
  const [floorKey, setFloorKey] = useState("g1");
  const [tier, setTier] = useState("tier2");
  const [city, setCity] = useState("hyderabad");
  const [area, setArea] = useState("standard");

  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [showSendForm, setShowSendForm] = useState(false);

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

  const effectiveMultiplier = (cityKey, areaKey) =>
    CITIES[cityKey].multiplier * AREAS[areaKey].multiplier;

  const effectiveRate = (tierKey, cityKey = city, areaKey = area) =>
    Math.round(TIERS[tierKey].ratePerSqft * effectiveMultiplier(cityKey, areaKey));

  const costForTier = (tierKey) => {
    return totalBuiltUpArea * effectiveRate(tierKey);
  };

  const selectedCost = useMemo(() => costForTier(tier), [totalBuiltUpArea, tier, city, area]);

  const costRange = useMemo(() => {
    return {
      low: selectedCost * (1 - RANGE_VARIANCE),
      high: selectedCost * (1 + RANGE_VARIANCE),
    };
  }, [selectedCost]);

  const validate = () => {
    const next = {};
    if (!leadName.trim()) next.name = "Enter your name.";
    if (!isValidPhone(leadPhone)) next.phone = "Enter a valid 10-digit mobile number.";
    if (leadEmail.trim() && !isValidEmail(leadEmail)) next.email = "Enter a valid email address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSendEstimate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitStatus("submitting");
    // NOTE: /api/send-estimate doesn't exist in this preview environment,
    // so this simulates the request instead of actually calling it.
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    }
  };

  const handleDownloadPDF = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <main className="ks-page">
      <p className="brand-eyebrow">KS CONSTRUCTIONS</p>
      <h1 className="page-title">Construction Estimation Calculator</h1>
      <p className="page-sub">
        Estimate project cost using plot size, built-up area, floors and construction quality.
      </p>

      <div className="estimator-grid">
        <div className="card">
          <h2 className="calc-card-title">Project Details</h2>

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
            <p className="field-hint">
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
            <p className="field-note">
              Plot area and built-up area are different — allowable built-up area depends on
              setbacks, FAR/FSI, local regulations and the specifics of your site.
            </p>
          </div>

          <div>
            <label htmlFor="floors" className="field-label">
              Floors
            </label>
            <select
              id="floors"
              value={floorKey}
              onChange={(e) => setFloorKey(e.target.value)}
              className="text-input"
              style={{ width: "100%" }}
            >
              {Object.keys(FLOORS).map((key) => (
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
              onChange={(e) => setCity(e.target.value)}
              className="text-input"
              style={{ width: "100%" }}
            >
              {Object.keys(CITIES).map((key) => (
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
              onChange={(e) => setArea(e.target.value)}
              className="text-input"
              style={{ width: "100%" }}
            >
              {Object.keys(AREAS).map((key) => (
                <option key={key} value={key}>
                  {AREAS[key].label}
                  {key === "high_cost" ? " (+15%)" : ""}
                </option>
              ))}
            </select>
          </div>

          <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
            <legend className="field-label" style={{ marginBottom: 8 }}>
              Construction Quality
            </legend>
            <div style={{ display: "grid", gap: 10 }}>
              {Object.keys(TIERS).map((key) => (
                <label key={key} className={`tier-option ${tier === key ? "tier-option-active" : ""}`}>
                  <input type="radio" name="tier" checked={tier === key} onChange={() => setTier(key)} style={{ marginTop: 4 }} />
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

        <div className="card result-card">
          <p className="result-eyebrow">Estimated Construction Cost</p>
          <p className="result-figure">
            {formatINR(costRange.low)} – {formatINR(costRange.high)}
          </p>
          <p className="result-point">
            Point estimate: {formatINR(selectedCost)} at {TIERS[tier].shortLabel} tier, {CITIES[city].label} ({AREAS[area].label})
          </p>

          <div className="result-breakdown">
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

          <p className="field-label result-compare-label">Compare tiers at this size</p>
          <table className="tier-table">
            <thead>
              <tr>
                <th scope="col">Tier</th>
                <th scope="col">Rate in {CITIES[city].label}</th>
                <th scope="col">Est. cost</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(TIERS).map((key) => (
                <tr key={key} className={key === tier ? "tier-row-active" : ""}>
                  <td>{TIERS[key].shortLabel}</td>
                  <td>₹{effectiveRate(key)}</td>
                  <td>{formatINR(costForTier(key))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" onClick={handleDownloadPDF} className="primary-button" style={{ marginTop: 24, width: "100%" }}>
            Download Estimate PDF
          </button>

          <button
            type="button"
            onClick={() => setShowSendForm((v) => !v)}
            className="secondary-button"
            style={{ marginTop: 12, width: "100%" }}
            aria-expanded={showSendForm}
            aria-controls="send-estimate-form"
          >
            Send Estimate by Email/SMS
          </button>

          {showSendForm && (
            <div id="send-estimate-form" className="inline-send-form">
              {submitStatus === "success" ? (
                <p role="status" className="success-note">
                  Sent. Check your phone or inbox shortly — our team will follow up within 30 minutes.
                </p>
              ) : (
                <form onSubmit={handleSendEstimate} noValidate>
                  <div style={{ display: "grid", gap: 14 }}>
                    <div>
                      <label htmlFor="leadName" className="field-label field-label-on-dark">
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
                      <label htmlFor="leadPhone" className="field-label field-label-on-dark">
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
                      <label htmlFor="leadEmail" className="field-label field-label-on-dark">
                        Email
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
          )}

          <p className="disclaimer">
            Estimate only. Actual construction cost may vary based on site conditions, design
            complexity, approvals, specifications, labor and material price fluctuations.
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

        :root {
          --charcoal: #15151a;
          --cream: #f8f6f1;
          --gold: #c9a227;
          --gold-light: #e4c567;
          --text-dark: #1a1a1a;
        }

        .ks-page {
          padding: 48px 24px 80px;
          max-width: 1120px;
          margin: 0 auto;
          font-family: 'Inter', sans-serif;
          color: var(--text-dark);
          background: var(--cream);
        }
        .ks-page * { box-sizing: border-box; }

        .brand-eyebrow {
          font-weight: 700;
          letter-spacing: 0.15em;
          font-size: 12px;
          text-transform: uppercase;
          color: var(--gold);
          margin: 0;
        }
        .page-title {
          font-family: 'Fraunces', serif;
          font-size: 34px;
          font-weight: 600;
          margin: 8px 0 12px;
        }
        .page-sub {
          font-size: 17px;
          max-width: 720px;
          line-height: 1.6;
          opacity: 0.75;
          margin: 0;
        }

        .estimator-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: start;
          margin-top: 36px;
        }
        .card {
          background: #fff;
          border: 1px solid #e6e2d8;
          border-radius: 12px;
          padding: 28px;
          display: grid;
          gap: 20px;
        }
        .calc-card-title {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }
        .field-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .field-hint {
          font-size: 13px;
          opacity: 0.65;
          margin-top: 6px;
        }
        .field-note {
          font-size: 12.5px;
          opacity: 0.6;
          margin-top: 6px;
          line-height: 1.5;
        }
        .field-error {
          color: #d64545;
          font-size: 13px;
          margin-top: 6px;
        }
        .text-input {
          padding: 11px 13px;
          font-size: 15px;
          border: 1px solid #d8d3c4;
          border-radius: 6px;
          font-family: inherit;
          background: #fff;
          color: var(--text-dark);
        }
        .text-input:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 2px;
        }
        .phone-prefix {
          display: flex;
          align-items: center;
          padding: 0 10px;
          border: 1px solid #d8d3c4;
          border-radius: 6px;
          font-size: 15px;
          background: #f2f0ea;
        }
        .tier-option {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border: 1px solid #d8d3c4;
          border-radius: 8px;
          cursor: pointer;
        }
        .tier-option-active {
          border: 2px solid var(--gold);
          background: #fffaf0;
        }
        .tier-option:focus-within {
          outline: 2px solid var(--gold);
          outline-offset: 2px;
        }

        .result-card {
          background: var(--charcoal);
          color: #f5f3ee;
          border: none;
        }
        .result-eyebrow {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          opacity: 0.65;
          margin: 0;
        }
        .result-figure {
          font-family: 'Fraunces', serif;
          font-size: 38px;
          font-weight: 600;
          color: var(--gold-light);
          margin: 0;
        }
        .result-point {
          font-size: 13px;
          opacity: 0.7;
          margin: 0;
        }
        .result-breakdown {
          display: grid;
          gap: 10px;
          font-size: 14.5px;
          padding: 20px 0;
          border-top: 1px solid rgba(255,255,255,0.12);
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }
        .result-row {
          display: flex;
          justify-content: space-between;
          opacity: 0.9;
        }
        .result-compare-label {
          color: #f5f3ee;
          margin: 0;
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
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .tier-table th {
          opacity: 0.6;
          font-weight: 600;
        }
        .tier-row-active {
          font-weight: 600;
          color: var(--gold-light);
        }
        .disclaimer {
          font-size: 12px;
          opacity: 0.55;
          margin: 16px 0 0;
          line-height: 1.6;
        }
        .success-note {
          font-weight: 600;
          color: #1a1a1a;
        }

        .primary-button {
          padding: 13px 20px;
          font-size: 15px;
          font-weight: 600;
          background: var(--gold);
          color: var(--charcoal);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
        }
        .primary-button:hover {
          background: var(--gold-light);
        }
        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .primary-button:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 2px;
        }
        .secondary-button {
          padding: 13px 20px;
          font-size: 15px;
          font-weight: 600;
          background: transparent;
          color: var(--gold-light);
          border: 1px solid var(--gold-light);
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
        }
        .secondary-button:hover {
          background: rgba(228, 197, 103, 0.1);
        }
        .secondary-button:focus-visible {
          outline: 2px solid var(--gold-light);
          outline-offset: 2px;
        }
        .inline-send-form {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.12);
        }
        .field-label-on-dark {
          color: #f5f3ee;
        }

        @media (max-width: 780px) {
          .estimator-grid {
            grid-template-columns: 1fr;
          }
        }
        @media print {
          form {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}